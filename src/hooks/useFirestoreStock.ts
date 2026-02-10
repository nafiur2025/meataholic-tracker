import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  onSnapshot, 
  updateDoc,
  orderBy
} from 'firebase/firestore';
import { db as firebaseDb } from '@/lib/firebase';
import type { Firestore } from 'firebase/firestore';
import type { StockItem, ConsumableItem } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export interface FirestoreStockItem extends StockItem {
  userId: string;
}

export interface FirestoreConsumableItem extends ConsumableItem {
  userId: string;
}

export function useFirestoreStock() {
  const { currentUser } = useAuth();
  const [stockItems, setStockItems] = useState<FirestoreStockItem[]>([]);
  const [consumableItems, setConsumableItems] = useState<FirestoreConsumableItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Get db instance
  const db = firebaseDb as Firestore;

  // Subscribe to stock items
  useEffect(() => {
    if (!currentUser) {
      setStockItems([]);
      setConsumableItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Subscribe to stock items
    const stockQuery = query(
      collection(db, 'stock'),
      orderBy('name')
    );

    const unsubscribeStock = onSnapshot(stockQuery, (snapshot) => {
      const stockData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirestoreStockItem[];
      setStockItems(stockData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching stock:', error);
      setLoading(false);
    });

    // Subscribe to consumables
    const consumablesQuery = query(
      collection(db, 'consumables'),
      orderBy('name')
    );

    const unsubscribeConsumables = onSnapshot(consumablesQuery, (snapshot) => {
      const consumablesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirestoreConsumableItem[];
      setConsumableItems(consumablesData);
    }, (error) => {
      console.error('Error fetching consumables:', error);
    });

    return () => {
      unsubscribeStock();
      unsubscribeConsumables();
    };
  }, [currentUser, db]);

  const addStockItem = useCallback(async (item: Omit<StockItem, 'id'>) => {
    if (!currentUser) throw new Error('User not authenticated');

    const itemData = {
      ...item,
      userId: currentUser.uid,
    };

    await addDoc(collection(db, 'stock'), itemData);
  }, [currentUser, db]);

  const updateStockQuantity = useCallback(async (id: string, newQuantity: number) => {
    if (!currentUser) throw new Error('User not authenticated');

    const itemRef = doc(db, 'stock', id);
    await updateDoc(itemRef, { currentQuantity: Math.max(0, newQuantity) });
  }, [currentUser, db]);

  const deleteStockItem = useCallback(async (id: string) => {
    if (!currentUser) throw new Error('User not authenticated');
    await deleteDoc(doc(db, 'stock', id));
  }, [currentUser, db]);

  const addConsumableItem = useCallback(async (item: Omit<ConsumableItem, 'id'>) => {
    if (!currentUser) throw new Error('User not authenticated');

    const itemData = {
      ...item,
      userId: currentUser.uid,
    };

    await addDoc(collection(db, 'consumables'), itemData);
  }, [currentUser, db]);

  const updateConsQuantity = useCallback(async (id: string, newQuantity: number) => {
    if (!currentUser) throw new Error('User not authenticated');

    const itemRef = doc(db, 'consumables', id);
    await updateDoc(itemRef, { currentQuantity: Math.max(0, newQuantity) });
  }, [currentUser, db]);

  const deleteConsItem = useCallback(async (id: string) => {
    if (!currentUser) throw new Error('User not authenticated');
    await deleteDoc(doc(db, 'consumables', id));
  }, [currentUser, db]);

  const lowStockItems = stockItems.filter(item => 
    item.currentQuantity <= item.minLevel && item.minLevel > 0
  );
  
  const lowConsItems = consumableItems.filter(item => 
    item.currentQuantity <= item.minLevel && item.minLevel > 0
  );

  return {
    stockItems,
    consumableItems,
    loading,
    addStockItem,
    updateStockQuantity,
    deleteStockItem,
    addConsumableItem,
    updateConsQuantity,
    deleteConsItem,
    lowStockItems,
    lowConsItems,
  };
}
