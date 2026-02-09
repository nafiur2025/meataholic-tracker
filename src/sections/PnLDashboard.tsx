import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths } from 'date-fns';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  PieChart,
  BarChart3,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useFirestoreExpenses } from '@/hooks/useFirestoreExpenses';
import { expenseCategoryLabels, type ExpenseCategory } from '@/types';

const categoryColors: Record<ExpenseCategory, string> = {
  stock_purchase: '#3b82f6',
  uber_delivery: '#f97316',
  salary: '#22c55e',
  meta_ads: '#a855f7',
  equipment: '#6b7280',
  consumables: '#ec4899',
  utilities: '#eab308',
  other: '#64748b',
};

const COLORS = ['#3b82f6', '#f97316', '#22c55e', '#a855f7', '#6b7280', '#ec4899', '#eab308', '#64748b'];

export default function PnLDashboard() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [chartView, setChartView] = useState<'daily' | 'category'>('daily');
  const { getMonthlySummary, loading, totalExpensesAllTime, totalRevenueAllTime, netProfitAllTime } = useFirestoreExpenses();

  const monthData = useMemo(() => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth() + 1;
    return getMonthlySummary(year, month);
  }, [getMonthlySummary, selectedMonth]);

  const dailyChartData = useMemo(() => {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    const days = eachDayOfInterval({ start, end });

    return days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayData = monthData.dailyData[dateStr] || { revenue: 0, expenses: 0 };
      return {
        date: format(day, 'dd'),
        fullDate: dateStr,
        revenue: dayData.revenue,
        expenses: dayData.expenses,
        profit: dayData.revenue - dayData.expenses,
      };
    });
  }, [monthData.dailyData, selectedMonth]);

  const categoryChartData = useMemo(() => {
    return Object.entries(monthData.expensesByCategory).map(([category, amount]) => ({
      name: expenseCategoryLabels[category as ExpenseCategory],
      value: amount,
      category: category as ExpenseCategory,
    }));
  }, [monthData.expensesByCategory]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setSelectedMonth(prev => {
      if (direction === 'prev') {
        return subMonths(prev, 1);
      }
      return subMonths(prev, -1);
    });
  };

  const profitMargin = monthData.totalRevenue > 0 
    ? ((monthData.netProfit / monthData.totalRevenue) * 100).toFixed(1)
    : '0';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-red-700" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20 md:pb-0">
      {/* Month Selector */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={() => navigateMonth('prev')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <span className="text-lg font-semibold">
            {format(selectedMonth, 'MMMM yyyy')}
          </span>
        </div>
        <Button variant="outline" size="icon" onClick={() => navigateMonth('next')}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-green-50 border-green-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <p className="text-xs text-green-600 font-medium">Revenue</p>
            </div>
            <p className="text-xl font-bold text-green-700">
              ৳{monthData.totalRevenue.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <p className="text-xs text-red-600 font-medium">Expenses</p>
            </div>
            <p className="text-xl font-bold text-red-700">
              ৳{monthData.totalExpenses.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className={`${monthData.netProfit >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-amber-50 border-amber-100'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className={`h-4 w-4 ${monthData.netProfit >= 0 ? 'text-blue-600' : 'text-amber-600'}`} />
              <p className={`text-xs font-medium ${monthData.netProfit >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>Net Profit</p>
            </div>
            <p className={`text-xl font-bold ${monthData.netProfit >= 0 ? 'text-blue-700' : 'text-amber-700'}`}>
              ৳{monthData.netProfit.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <PieChart className="h-4 w-4 text-purple-600" />
              <p className="text-xs text-purple-600 font-medium">Profit Margin</p>
            </div>
            <p className="text-xl font-bold text-purple-700">
              {profitMargin}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs value={chartView} onValueChange={(v) => setChartView(v as 'daily' | 'category')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="daily" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Daily Breakdown
          </TabsTrigger>
          <TabsTrigger value="category" className="gap-2">
            <PieChart className="h-4 w-4" />
            By Category
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Daily P&L - {format(selectedMonth, 'MMMM yyyy')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `৳${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`}
                    />
                    <Tooltip 
                      formatter={(value: number) => `৳${value.toLocaleString()}`}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend />
                    <Bar dataKey="revenue" name="Revenue" fill="#22c55e" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="category" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Expenses by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={categoryColors[entry.category] || COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `৳${value.toLocaleString()}`} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      iconType="circle"
                      formatter={(value) => <span className="text-xs">{value}</span>}
                    />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Category Breakdown List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.entries(monthData.expensesByCategory)
            .sort(([,a], [,b]) => b - a)
            .map(([category, amount]) => {
              const percentage = monthData.totalExpenses > 0 
                ? ((amount / monthData.totalExpenses) * 100).toFixed(1)
                : '0';
              return (
                <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: categoryColors[category as ExpenseCategory] }}
                    />
                    <span className="font-medium text-sm">
                      {expenseCategoryLabels[category as ExpenseCategory]}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">৳{amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{percentage}%</p>
                  </div>
                </div>
              );
            })}
          {Object.keys(monthData.expensesByCategory).length === 0 && (
            <p className="text-center text-gray-500 py-4">No expenses this month</p>
          )}
        </CardContent>
      </Card>

      {/* All-Time Summary */}
      <Card className="bg-gradient-to-r from-red-700 to-red-800 text-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-white">All-Time Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-red-200">Total Revenue</span>
            <span className="font-bold text-lg">৳{totalRevenueAllTime.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-red-200">Total Expenses</span>
            <span className="font-bold text-lg">৳{totalExpensesAllTime.toLocaleString()}</span>
          </div>
          <div className="border-t border-red-600 pt-3 flex justify-between items-center">
            <span className="text-red-200">Net Profit/Loss</span>
            <span className={`font-bold text-xl ${netProfitAllTime >= 0 ? 'text-green-300' : 'text-amber-300'}`}>
              ৳{netProfitAllTime.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
