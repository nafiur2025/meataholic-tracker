import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  onSnapshot, 
  orderBy
} from 'firebase/firestore';
import { db as firebaseDb } from '@/lib/firebase';
import type { Firestore } from 'firebase/firestore';
import type { Expense, ExpenseCategory } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export interface RevenueEntry {
  id: string;
  date: string;
  amount: number;
  source: 'online' | 'cash' | 'other';
  notes?: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  createdAt: string;
}

export interface FirestoreExpense extends Expense {
  userId: string;
  userName?: string;
  userEmail?: string;
}

export function useFirestoreExpenses() {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState<FirestoreExpense[]>([]);
  const [revenue, setRevenue] = useState<RevenueEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Get db instance
  const db = firebaseDb as Firestore;

  // Subscribe to expenses
  useEffect(() => {
    if (!currentUser) {
      setExpenses([]);
      setRevenue([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Subscribe to expenses
    const expensesQuery = query(
      collection(db, 'expenses'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeExpenses = onSnapshot(expensesQuery, (snapshot) => {
      const expensesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirestoreExpense[];
      setExpenses(expensesData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching expenses:', error);
      setLoading(false);
    });

    // Subscribe to revenue
    const revenueQuery = query(
      collection(db, 'revenue'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeRevenue = onSnapshot(revenueQuery, (snapshot) => {
      const revenueData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RevenueEntry[];
      setRevenue(revenueData);
    }, (error) => {
      console.error('Error fetching revenue:', error);
    });

    return () => {
      unsubscribeExpenses();
      unsubscribeRevenue();
    };
  }, [currentUser, db]);

  const addExpense = useCallback(async (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    if (!currentUser) throw new Error('User not authenticated');

    const expenseData = {
      ...expense,
      userId: currentUser.uid,
      userName: currentUser.displayName || undefined,
      userEmail: currentUser.email || undefined,
      createdAt: new Date().toISOString(),
    };
    if (expenseData.notes === undefined) {
      delete expenseData.notes;
    }

    await addDoc(collection(db, 'expenses'), expenseData);
  }, [currentUser, db]);

  const deleteExpense = useCallback(async (id: string) => {
    if (!currentUser) throw new Error('User not authenticated');
    await deleteDoc(doc(db, 'expenses', id));
  }, [currentUser, db]);

  const addRevenue = useCallback(async (rev: Omit<RevenueEntry, 'id' | 'userId' | 'createdAt'>) => {
    if (!currentUser) throw new Error('User not authenticated');

    const revenueData = {
      ...rev,
      userId: currentUser.uid,
      userName: currentUser.displayName || undefined,
      userEmail: currentUser.email || undefined,
      createdAt: new Date().toISOString(),
    };
    if (revenueData.notes === undefined) {
      delete revenueData.notes;
    }

    await addDoc(collection(db, 'revenue'), revenueData);
  }, [currentUser, db]);

  const deleteRevenue = useCallback(async (id: string) => {
    if (!currentUser) throw new Error('User not authenticated');
    await deleteDoc(doc(db, 'revenue', id));
  }, [currentUser, db]);

  const getExpensesByDate = useCallback((date: string) => {
    return expenses.filter((e) => e.date === date);
  }, [expenses]);

  const getExpensesByDateRange = useCallback((startDate: string, endDate: string) => {
    return expenses.filter((e) => e.date >= startDate && e.date <= endDate);
  }, [expenses]);

  const getRevenueByDate = useCallback((date: string) => {
    return revenue.filter((r) => r.date === date);
  }, [revenue]);

  const getRevenueByDateRange = useCallback((startDate: string, endDate: string) => {
    return revenue.filter((r) => r.date >= startDate && r.date <= endDate);
  }, [revenue]);

  const getMonthlySummary = useCallback((year: number, month: number) => {
    const monthStr = month.toString().padStart(2, '0');
    const prefix = `${year}-${monthStr}`;
    
    const monthExpenses = expenses.filter((e) => e.date.startsWith(prefix));
    const monthRevenue = revenue.filter((r) => r.date.startsWith(prefix));

    const totalRevenue = monthRevenue.reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

    const expensesByCategory = monthExpenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<ExpenseCategory, number>);

    const dailyData: Record<string, { revenue: number; expenses: number }> = {};
    
    monthRevenue.forEach((r) => {
      if (!dailyData[r.date]) dailyData[r.date] = { revenue: 0, expenses: 0 };
      dailyData[r.date].revenue += r.amount;
    });
    
    monthExpenses.forEach((e) => {
      if (!dailyData[e.date]) dailyData[e.date] = { revenue: 0, expenses: 0 };
      dailyData[e.date].expenses += e.amount;
    });

    return {
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      expensesByCategory,
      dailyData,
    };
  }, [expenses, revenue]);

  const recentExpenses = expenses.slice(0, 20);
  const totalExpensesAllTime = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalRevenueAllTime = revenue.reduce((sum, r) => sum + r.amount, 0);

  return {
    expenses,
    revenue,
    loading,
    addExpense,
    deleteExpense,
    addRevenue,
    deleteRevenue,
    getExpensesByDate,
    getExpensesByDateRange,
    getRevenueByDate,
    getRevenueByDateRange,
    getMonthlySummary,
    recentExpenses,
    totalExpensesAllTime,
    totalRevenueAllTime,
    netProfitAllTime: totalRevenueAllTime - totalExpensesAllTime,
  };
}
