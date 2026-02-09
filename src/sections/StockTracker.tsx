import { useState } from 'react';
import { format } from 'date-fns';
import { 
  Plus, 
  Minus, 
  Package, 
  AlertTriangle, 
  Check,
  Beef,
  Carrot,
  Flame,
  Milk,
  ShoppingBag,
  Wine,
  MoreHorizontal,
  Box,
  Sparkles,
  FileText,
  Trash2,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useFirestoreStock } from '@/hooks/useFirestoreStock';
import { 
  type StockCategory, 
  stockCategoryLabels, 
  type ConsumableCategory,
  consumableCategoryLabels,
  commonUnits 
} from '@/types';

const stockCategoryIcons: Record<StockCategory, React.ElementType> = {
  meat: Beef,
  vegetable: Carrot,
  spice: Flame,
  dairy: Milk,
  grocery: ShoppingBag,
  beverage: Wine,
  other: MoreHorizontal,
};

const consumableCategoryIcons: Record<ConsumableCategory, React.ElementType> = {
  packaging: Box,
  cleaning: Sparkles,
  stationery: FileText,
  other: MoreHorizontal,
};

export default function StockTracker() {
  const { toast } = useToast();
  const { 
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
    lowConsItems
  } = useFirestoreStock();
  
  const [activeTab, setActiveTab] = useState<'stock' | 'consumables'>('stock');
  const [submitting, setSubmitting] = useState(false);
  
  // Add stock form state
  const [newStockName, setNewStockName] = useState('');
  const [newStockCategory, setNewStockCategory] = useState<StockCategory>('meat');
  const [newStockQuantity, setNewStockQuantity] = useState('');
  const [newStockUnit, setNewStockUnit] = useState('kg');
  const [newStockMinLevel, setNewStockMinLevel] = useState('');
  const [newStockPrice, setNewStockPrice] = useState('');
  const [addStockOpen, setAddStockOpen] = useState(false);
  
  // Add consumable form state
  const [newConsName, setNewConsName] = useState('');
  const [newConsCategory, setNewConsCategory] = useState<ConsumableCategory>('packaging');
  const [newConsQuantity, setNewConsQuantity] = useState('');
  const [newConsUnit, setNewConsUnit] = useState('pcs');
  const [newConsMinLevel, setNewConsMinLevel] = useState('');
  const [newConsPrice, setNewConsPrice] = useState('');
  const [addConsOpen, setAddConsOpen] = useState(false);

  const handleAddStock = async () => {
    if (!newStockName.trim() || !newStockQuantity.trim()) {
      toast({ title: 'Error', description: 'Please fill in required fields', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      await addStockItem({
        name: newStockName.trim(),
        category: newStockCategory,
        currentQuantity: parseFloat(newStockQuantity) || 0,
        unit: newStockUnit,
        minLevel: parseFloat(newStockMinLevel) || 0,
        lastPurchased: format(new Date(), 'yyyy-MM-dd'),
        lastPurchasePrice: parseFloat(newStockPrice) || 0,
      });
      
      toast({ title: 'Success', description: `Added ${newStockName.trim()} to stock` });
      
      setNewStockName('');
      setNewStockQuantity('');
      setNewStockMinLevel('');
      setNewStockPrice('');
      setAddStockOpen(false);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to add stock item', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddConsumable = async () => {
    if (!newConsName.trim() || !newConsQuantity.trim()) {
      toast({ title: 'Error', description: 'Please fill in required fields', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      await addConsumableItem({
        name: newConsName.trim(),
        category: newConsCategory,
        currentQuantity: parseFloat(newConsQuantity) || 0,
        unit: newConsUnit,
        minLevel: parseFloat(newConsMinLevel) || 0,
        lastPurchased: format(new Date(), 'yyyy-MM-dd'),
        lastPurchasePrice: parseFloat(newConsPrice) || 0,
      });
      
      toast({ title: 'Success', description: `Added ${newConsName.trim()} to consumables` });
      
      setNewConsName('');
      setNewConsQuantity('');
      setNewConsMinLevel('');
      setNewConsPrice('');
      setAddConsOpen(false);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to add consumable', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStockQty = async (id: string, delta: number, currentQty: number) => {
    try {
      await updateStockQuantity(id, currentQty + delta);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update quantity', variant: 'destructive' });
    }
  };

  const handleUpdateConsQty = async (id: string, delta: number, currentQty: number) => {
    try {
      await updateConsQuantity(id, currentQty + delta);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update quantity', variant: 'destructive' });
    }
  };

  const handleDeleteStock = async (id: string) => {
    try {
      await deleteStockItem(id);
      toast({ title: 'Deleted', description: 'Stock item removed' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to delete', variant: 'destructive' });
    }
  };

  const handleDeleteCons = async (id: string) => {
    try {
      await deleteConsItem(id);
      toast({ title: 'Deleted', description: 'Consumable item removed' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to delete', variant: 'destructive' });
    }
  };

  const stockCategories: StockCategory[] = ['meat', 'vegetable', 'spice', 'dairy', 'grocery', 'beverage', 'other'];
  const consCategories: ConsumableCategory[] = ['packaging', 'cleaning', 'stationery', 'other'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-red-700" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20 md:pb-0">
      {/* Alerts */}
      {(lowStockItems.length > 0 || lowConsItems.length > 0) && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <h3 className="font-semibold text-amber-800">Low Stock Alerts</h3>
            </div>
            <div className="space-y-1">
              {lowStockItems.map(item => (
                <p key={item.id} className="text-sm text-amber-700">
                  {item.name}: {item.currentQuantity} {item.unit} remaining
                </p>
              ))}
              {lowConsItems.map(item => (
                <p key={item.id} className="text-sm text-amber-700">
                  {item.name}: {item.currentQuantity} {item.unit} remaining
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Stock Items</p>
            <p className="text-2xl font-bold">{stockItems.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Consumables</p>
            <p className="text-2xl font-bold">{consumableItems.length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'stock' | 'consumables')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stock" className="gap-2">
            <Beef className="h-4 w-4" />
            Stock
          </TabsTrigger>
          <TabsTrigger value="consumables" className="gap-2">
            <Box className="h-4 w-4" />
            Consumables
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stock" className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Stock Inventory</h2>
            <Dialog open={addStockOpen} onOpenChange={setAddStockOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-red-700 hover:bg-red-800">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>Add Stock Item</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Item Name *</Label>
                    <Input 
                      placeholder="e.g., Beef Brisket" 
                      value={newStockName}
                      onChange={(e) => setNewStockName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {stockCategories.map((cat) => {
                        const Icon = stockCategoryIcons[cat];
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setNewStockCategory(cat)}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
                              newStockCategory === cat
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-200'
                            }`}
                          >
                            <Icon className={`h-4 w-4 ${newStockCategory === cat ? 'text-red-600' : 'text-gray-500'}`} />
                            <span className="text-xs capitalize">{stockCategoryLabels[cat]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Quantity *</Label>
                      <Input 
                        type="number" 
                        value={newStockQuantity}
                        onChange={(e) => setNewStockQuantity(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Unit</Label>
                      <select
                        value={newStockUnit}
                        onChange={(e) => setNewStockUnit(e.target.value)}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                      >
                        {commonUnits.map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Min. Level (Alert)</Label>
                      <Input 
                        type="number" 
                        placeholder="0"
                        value={newStockMinLevel}
                        onChange={(e) => setNewStockMinLevel(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Price (৳)</Label>
                      <Input 
                        type="number" 
                        placeholder="0"
                        value={newStockPrice}
                        onChange={(e) => setNewStockPrice(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handleAddStock} 
                    className="w-full bg-red-700 hover:bg-red-800"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Add to Stock
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stock Items List */}
          <div className="space-y-2">
            {stockItems.length === 0 ? (
              <Card className="bg-gray-50">
                <CardContent className="p-8 text-center">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No stock items yet</p>
                  <p className="text-sm text-gray-400">Add your first item to start tracking</p>
                </CardContent>
              </Card>
            ) : (
              stockItems.map((item) => {
                const Icon = stockCategoryIcons[item.category];
                const isLow = item.currentQuantity <= item.minLevel && item.minLevel > 0;
                return (
                  <Card key={item.id} className={isLow ? 'border-amber-300 bg-amber-50/30' : ''}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isLow ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-gray-500">
                              {stockCategoryLabels[item.category]} • Last: ৳{item.lastPurchasePrice}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleUpdateStockQty(item.id, -1, item.currentQuantity)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className={`font-bold w-16 text-center ${isLow ? 'text-amber-600' : ''}`}>
                            {item.currentQuantity} {item.unit}
                          </span>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleUpdateStockQty(item.id, 1, item.currentQuantity)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteStock(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="consumables" className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Consumables</h2>
            <Dialog open={addConsOpen} onOpenChange={setAddConsOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-red-700 hover:bg-red-800">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>Add Consumable Item</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Item Name *</Label>
                    <Input 
                      placeholder="e.g., Foil Paper" 
                      value={newConsName}
                      onChange={(e) => setNewConsName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {consCategories.map((cat) => {
                        const Icon = consumableCategoryIcons[cat];
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setNewConsCategory(cat)}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
                              newConsCategory === cat
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-200'
                            }`}
                          >
                            <Icon className={`h-4 w-4 ${newConsCategory === cat ? 'text-red-600' : 'text-gray-500'}`} />
                            <span className="text-xs capitalize">{consumableCategoryLabels[cat]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Quantity *</Label>
                      <Input 
                        type="number" 
                        value={newConsQuantity}
                        onChange={(e) => setNewConsQuantity(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Unit</Label>
                      <select
                        value={newConsUnit}
                        onChange={(e) => setNewConsUnit(e.target.value)}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                      >
                        {commonUnits.map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Min. Level (Alert)</Label>
                      <Input 
                        type="number" 
                        placeholder="0"
                        value={newConsMinLevel}
                        onChange={(e) => setNewConsMinLevel(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Price (৳)</Label>
                      <Input 
                        type="number" 
                        placeholder="0"
                        value={newConsPrice}
                        onChange={(e) => setNewConsPrice(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handleAddConsumable} 
                    className="w-full bg-red-700 hover:bg-red-800"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Add Consumable
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Consumables List */}
          <div className="space-y-2">
            {consumableItems.length === 0 ? (
              <Card className="bg-gray-50">
                <CardContent className="p-8 text-center">
                  <Box className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No consumables yet</p>
                  <p className="text-sm text-gray-400">Add your first item to start tracking</p>
                </CardContent>
              </Card>
            ) : (
              consumableItems.map((item) => {
                const Icon = consumableCategoryIcons[item.category];
                const isLow = item.currentQuantity <= item.minLevel && item.minLevel > 0;
                return (
                  <Card key={item.id} className={isLow ? 'border-amber-300 bg-amber-50/30' : ''}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isLow ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-gray-500">
                              {consumableCategoryLabels[item.category]} • Last: ৳{item.lastPurchasePrice}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleUpdateConsQty(item.id, -1, item.currentQuantity)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className={`font-bold w-16 text-center ${isLow ? 'text-amber-600' : ''}`}>
                            {item.currentQuantity} {item.unit}
                          </span>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleUpdateConsQty(item.id, 1, item.currentQuantity)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteCons(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
