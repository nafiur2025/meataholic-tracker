import { useState } from 'react';
import { format } from 'date-fns';
import { 
  Plus, 
  Minus, 
  ShoppingCart, 
  Truck, 
  Users, 
  Megaphone, 
  Wrench, 
  PackageOpen, 
  Lightbulb, 
  MoreHorizontal,
  Check,
  Banknote,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  type ExpenseCategory, 
  expenseCategoryLabels, 
  commonUnits 
} from '@/types';
import { useFirestoreExpenses } from '@/hooks/useFirestoreExpenses';

const categoryIcons: Record<ExpenseCategory, React.ElementType> = {
  stock_purchase: ShoppingCart,
  uber_delivery: Truck,
  salary: Users,
  meta_ads: Megaphone,
  equipment: Wrench,
  consumables: PackageOpen,
  utilities: Lightbulb,
  other: MoreHorizontal,
};

const categoryColors: Record<ExpenseCategory, string> = {
  stock_purchase: 'bg-blue-100 text-blue-700 border-blue-200',
  uber_delivery: 'bg-orange-100 text-orange-700 border-orange-200',
  salary: 'bg-green-100 text-green-700 border-green-200',
  meta_ads: 'bg-purple-100 text-purple-700 border-purple-200',
  equipment: 'bg-gray-100 text-gray-700 border-gray-200',
  consumables: 'bg-pink-100 text-pink-700 border-pink-200',
  utilities: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  other: 'bg-slate-100 text-slate-700 border-slate-200',
};


const getEntryUserLabel = (entry: { userName?: string; userEmail?: string; userId: string }) => {
  if (entry.userName?.trim()) return entry.userName;
  if (entry.userEmail?.trim()) return entry.userEmail;
  return `User ${entry.userId.slice(0, 6)}`;
};

export default function CostEntry() {
  const { toast } = useToast();
  const { 
    addExpense, 
    addRevenue, 
    getExpensesByDate, 
    getRevenueByDate, 
    recentExpenses,
    loading 
  } = useFirestoreExpenses();
  
  const [activeForm, setActiveForm] = useState<'expense' | 'revenue'>('expense');
  const [submitting, setSubmitting] = useState(false);
  
  // Expense form state
  const [expenseDate, setExpenseDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [category, setCategory] = useState<ExpenseCategory>('stock_purchase');
  const [item, setItem] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pcs');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  
  // Revenue form state
  const [revenueDate, setRevenueDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [revenueAmount, setRevenueAmount] = useState('');
  const [revenueSource, setRevenueSource] = useState<'online' | 'cash' | 'other'>('online');
  const [revenueNotes, setRevenueNotes] = useState('');

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!item.trim() || !amount.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      await addExpense({
        date: expenseDate,
        category,
        item: item.trim(),
        quantity: parseFloat(quantity) || 1,
        unit,
        amount: parseFloat(amount) || 0,
        notes: notes.trim() || undefined,
      });

      toast({
        title: 'Success',
        description: `Added ${expenseCategoryLabels[category]}: ৳${amount}`,
      });

      // Reset form
      setItem('');
      setQuantity('1');
      setAmount('');
      setNotes('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add expense',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevenueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!revenueAmount.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter revenue amount',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      await addRevenue({
        date: revenueDate,
        amount: parseFloat(revenueAmount) || 0,
        source: revenueSource,
        notes: revenueNotes.trim() || undefined,
      });

      toast({
        title: 'Success',
        description: `Added revenue: ৳${revenueAmount}`,
      });

      // Reset form
      setRevenueAmount('');
      setRevenueNotes('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add revenue',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const categories: ExpenseCategory[] = [
    'stock_purchase',
    'uber_delivery',
    'salary',
    'meta_ads',
    'equipment',
    'consumables',
    'utilities',
    'other',
  ];

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayExpenses = getExpensesByDate(today);
  const todayRevenue = getRevenueByDate(today);
  const todayTotalExpenses = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const todayTotalRevenue = todayRevenue.reduce((sum, r) => sum + r.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-red-700" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20 md:pb-0">
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-red-50 border-red-100">
          <CardContent className="p-3">
            <p className="text-xs text-red-600 font-medium">Today's Costs</p>
            <p className="text-lg font-bold text-red-700">
              ৳{todayTotalExpenses.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-100">
          <CardContent className="p-3">
            <p className="text-xs text-green-600 font-medium">Today's Revenue</p>
            <p className="text-lg font-bold text-green-700">
              ৳{todayTotalRevenue.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-3">
            <p className="text-xs text-blue-600 font-medium">Net Profit</p>
            <p className="text-lg font-bold text-blue-700">
              ৳{(todayTotalRevenue - todayTotalExpenses).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeForm} onValueChange={(v) => setActiveForm(v as 'expense' | 'revenue')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="expense" className="gap-2">
            <Minus className="h-4 w-4" />
            Add Expense
          </TabsTrigger>
          <TabsTrigger value="revenue" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Revenue
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expense" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Minus className="h-5 w-5 text-red-600" />
                Record Expense
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleExpenseSubmit} className="space-y-4">
                {/* Date */}
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Category Selection */}
                <div className="space-y-2">
                  <Label>Category</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {categories.map((cat) => {
                      const Icon = categoryIcons[cat];
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategory(cat)}
                          className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                            category === cat
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon className={`h-5 w-5 ${category === cat ? 'text-red-600' : 'text-gray-500'}`} />
                          <span className={`text-xs font-medium text-center ${category === cat ? 'text-red-700' : 'text-gray-600'}`}>
                            {expenseCategoryLabels[cat]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Item Name */}
                <div className="space-y-2">
                  <Label htmlFor="item">Item/Description *</Label>
                  <Input
                    id="item"
                    placeholder="e.g., Black Pepper, Uber Delivery, etc."
                    value={item}
                    onChange={(e) => setItem(e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Quantity and Unit */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="0"
                      step="0.01"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <select
                      id="unit"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      {commonUnits.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (৳) *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">৳</span>
                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-8"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    placeholder="Any additional details..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-red-700 hover:bg-red-800 text-white"
                  size="lg"
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Save Expense
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="h-5 w-5 text-green-600" />
                Record Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRevenueSubmit} className="space-y-4">
                {/* Date */}
                <div className="space-y-2">
                  <Label htmlFor="rev-date">Date</Label>
                  <Input
                    id="rev-date"
                    type="date"
                    value={revenueDate}
                    onChange={(e) => setRevenueDate(e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Source */}
                <div className="space-y-2">
                  <Label>Revenue Source</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['online', 'cash', 'other'] as const).map((src) => (
                      <button
                        key={src}
                        type="button"
                        onClick={() => setRevenueSource(src)}
                        className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all capitalize ${
                          revenueSource === src
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {src === 'online' && <TrendingUp className={`h-5 w-5 ${revenueSource === src ? 'text-green-600' : 'text-gray-500'}`} />}
                        {src === 'cash' && <Banknote className={`h-5 w-5 ${revenueSource === src ? 'text-green-600' : 'text-gray-500'}`} />}
                        {src === 'other' && <MoreHorizontal className={`h-5 w-5 ${revenueSource === src ? 'text-green-600' : 'text-gray-500'}`} />}
                        <span className={`text-xs font-medium ${revenueSource === src ? 'text-green-700' : 'text-gray-600'}`}>
                          {src}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="rev-amount">Amount (৳) *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">৳</span>
                    <Input
                      id="rev-amount"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={revenueAmount}
                      onChange={(e) => setRevenueAmount(e.target.value)}
                      className="w-full pl-8"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="rev-notes">Notes (Optional)</Label>
                  <Input
                    id="rev-notes"
                    placeholder="Any additional details..."
                    value={revenueNotes}
                    onChange={(e) => setRevenueNotes(e.target.value)}
                    className="w-full"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Save Revenue
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Entries */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent Entries</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentExpenses.slice(0, 5).map((expense) => {
            const Icon = categoryIcons[expense.category];
            return (
              <div 
                key={expense.id} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${categoryColors[expense.category]}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{expense.item}</p>
                    <p className="text-xs text-gray-500">
                      {expenseCategoryLabels[expense.category]} • {expense.quantity} {expense.unit} • Entered by {getEntryUserLabel(expense)}
                    </p>
                  </div>
                </div>
                <p className="font-bold text-red-600">-৳{expense.amount.toLocaleString()}</p>
              </div>
            );
          })}
          {recentExpenses.length === 0 && (
            <p className="text-center text-gray-500 py-4">No entries yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
