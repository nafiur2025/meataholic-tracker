import { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { 
  ShoppingCart, 
  Truck, 
  Users, 
  Megaphone, 
  Wrench, 
  PackageOpen, 
  Lightbulb, 
  MoreHorizontal,
  Calendar,
  Filter,
  Search,
  Trash2,
  TrendingUp,
  Banknote,
  X,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  type ExpenseCategory, 
  expenseCategoryLabels
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

export default function ExpenseHistory() {
  const { toast } = useToast();
  const { 
    expenses, 
    revenue, 
    loading,
    deleteExpense, 
    deleteRevenue 
  } = useFirestoreExpenses();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | 'all'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [viewMode, setViewMode] = useState<'expenses' | 'revenue'>('expenses');
  const [filterOpen, setFilterOpen] = useState(false);

  const filteredExpenses = useMemo(() => {
    let filtered = [...expenses];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e => 
        e.item.toLowerCase().includes(query) ||
        e.notes?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(e => e.category === selectedCategory);
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(e => e.date >= dateFrom);
    }
    if (dateTo) {
      filtered = filtered.filter(e => e.date <= dateTo);
    }

    // Sort by date descending
    return filtered.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [expenses, searchQuery, selectedCategory, dateFrom, dateTo]);

  const filteredRevenue = useMemo(() => {
    let filtered = [...revenue];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.notes?.toLowerCase().includes(query)
      );
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(r => r.date >= dateFrom);
    }
    if (dateTo) {
      filtered = filtered.filter(r => r.date <= dateTo);
    }

    // Sort by date descending
    return filtered.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [revenue, searchQuery, dateFrom, dateTo]);

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteExpense(id);
      toast({ title: 'Deleted', description: 'Expense removed successfully' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to delete', variant: 'destructive' });
    }
  };

  const handleDeleteRevenue = async (id: string) => {
    try {
      await deleteRevenue(id);
      toast({ title: 'Deleted', description: 'Revenue entry removed successfully' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to delete', variant: 'destructive' });
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setDateFrom('');
    setDateTo('');
  };

  const hasFilters = searchQuery || selectedCategory !== 'all' || dateFrom || dateTo;

  // Group by date
  const groupedExpenses = useMemo(() => {
    const groups: Record<string, typeof filteredExpenses> = {};
    filteredExpenses.forEach(expense => {
      if (!groups[expense.date]) {
        groups[expense.date] = [];
      }
      groups[expense.date].push(expense);
    });
    return groups;
  }, [filteredExpenses]);

  const groupedRevenue = useMemo(() => {
    const groups: Record<string, typeof filteredRevenue> = {};
    filteredRevenue.forEach(rev => {
      if (!groups[rev.date]) {
        groups[rev.date] = [];
      }
      groups[rev.date].push(rev);
    });
    return groups;
  }, [filteredRevenue]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-red-700" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20 md:pb-0">
      {/* Search and Filter Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="h-4 w-4" />
              {hasFilters && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Filter Entries</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>View Mode</Label>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'expenses' ? 'default' : 'outline'}
                    onClick={() => setViewMode('expenses')}
                    className="flex-1"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Expenses
                  </Button>
                  <Button
                    variant={viewMode === 'revenue' ? 'default' : 'outline'}
                    onClick={() => setViewMode('revenue')}
                    className="flex-1"
                  >
                    <Banknote className="h-4 w-4 mr-2" />
                    Revenue
                  </Button>
                </div>
              </div>

              {viewMode === 'expenses' && (
                <div className="space-y-2">
                  <Label>Category</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('all')}
                      className={`p-2 rounded-lg border-2 text-sm transition-all ${
                        selectedCategory === 'all'
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200'
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`p-2 rounded-lg border-2 text-xs transition-all ${
                          selectedCategory === cat
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200'
                        }`}
                      >
                        {expenseCategoryLabels[cat]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Date Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-gray-500">From</Label>
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">To</Label>
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {hasFilters && (
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <div className="flex gap-2">
        <Button
          variant={viewMode === 'expenses' ? 'default' : 'outline'}
          onClick={() => setViewMode('expenses')}
          className="flex-1"
          size="sm"
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Expenses
          <span className="ml-2 bg-white/20 px-2 py-0.5 rounded text-xs">
            {filteredExpenses.length}
          </span>
        </Button>
        <Button
          variant={viewMode === 'revenue' ? 'default' : 'outline'}
          onClick={() => setViewMode('revenue')}
          className="flex-1"
          size="sm"
        >
          <Banknote className="h-4 w-4 mr-2" />
          Revenue
          <span className="ml-2 bg-white/20 px-2 py-0.5 rounded text-xs">
            {filteredRevenue.length}
          </span>
        </Button>
      </div>

      {/* Results */}
      {viewMode === 'expenses' ? (
        <div className="space-y-4">
          {Object.entries(groupedExpenses).length === 0 ? (
            <Card className="bg-gray-50">
              <CardContent className="p-8 text-center">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No expenses found</p>
                {hasFilters && (
                  <Button variant="link" onClick={clearFilters}>
                    Clear filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedExpenses).map(([date, dayExpenses]) => {
              const dayTotal = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
              return (
                <div key={date} className="space-y-2">
                  <div className="flex items-center justify-between sticky top-0 bg-gray-50 py-2 px-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-sm">
                        {format(parseISO(date), 'EEEE, MMM dd, yyyy')}
                      </span>
                    </div>
                    <span className="bg-gray-200 px-2 py-1 rounded text-xs font-medium">
                      ৳{dayTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {dayExpenses.map((expense) => {
                      const Icon = categoryIcons[expense.category];
                      return (
                        <Card key={expense.id} className="overflow-hidden">
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${categoryColors[expense.category]}`}>
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{expense.item}</p>
                                  <p className="text-xs text-gray-500">
                                    {expenseCategoryLabels[expense.category]} • {expense.quantity} {expense.unit}
                                  </p>
                                  {expense.notes && (
                                    <p className="text-xs text-gray-400 mt-1">{expense.notes}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-red-600">-৳{expense.amount.toLocaleString()}</p>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-gray-400 hover:text-red-500"
                                  onClick={() => handleDeleteExpense(expense.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedRevenue).length === 0 ? (
            <Card className="bg-gray-50">
              <CardContent className="p-8 text-center">
                <Banknote className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No revenue entries found</p>
                {hasFilters && (
                  <Button variant="link" onClick={clearFilters}>
                    Clear filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedRevenue).map(([date, dayRevenue]) => {
              const dayTotal = dayRevenue.reduce((sum, r) => sum + r.amount, 0);
              return (
                <div key={date} className="space-y-2">
                  <div className="flex items-center justify-between sticky top-0 bg-gray-50 py-2 px-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-sm">
                        {format(parseISO(date), 'EEEE, MMM dd, yyyy')}
                      </span>
                    </div>
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                      ৳{dayTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {dayRevenue.map((rev) => (
                      <Card key={rev.id} className="overflow-hidden">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-green-100 text-green-700">
                                <Banknote className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-medium text-sm capitalize">{rev.source} Revenue</p>
                                {rev.notes && (
                                  <p className="text-xs text-gray-400 mt-1">{rev.notes}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-green-600">+৳{rev.amount.toLocaleString()}</p>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-400 hover:text-red-500"
                                onClick={() => handleDeleteRevenue(rev.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
