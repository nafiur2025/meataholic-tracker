import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Expense, ExpenseCategory, DailySummary } from '@/types';

const EXPENSES_KEY = 'meataholic_expenses';
const REVENUE_KEY = 'meataholic_revenue';

export interface RevenueEntry {
  id: string;
  date: string;
  amount: number;
  source: 'online' | 'cash' | 'other';
  notes?: string;
}

export function useExpenses() {
  const [expenses, setExpenses] = useLocalStorage<Expense[]>(EXPENSES_KEY, []);
  const [revenue, setRevenue] = useLocalStorage<RevenueEntry[]>(REVENUE_KEY, []);

  const addExpense = useCallback((expense: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [newExpense, ...prev]);
    return newExpense;
  }, [setExpenses]);

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, [setExpenses]);

  const addRevenue = useCallback((rev: Omit<RevenueEntry, 'id'>) => {
    const newRevenue: RevenueEntry = {
      ...rev,
      id: Date.now().toString(),
    };
    setRevenue((prev) => [newRevenue, ...prev]);
    return newRevenue;
  }, [setRevenue]);

  const deleteRevenue = useCallback((id: string) => {
    setRevenue((prev) => prev.filter((r) => r.id !== id));
  }, [setRevenue]);

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

  const getDailySummary = useCallback((date: string): DailySummary => {
    const dayExpenses = getExpensesByDate(date);
    const dayRevenue = getRevenueByDate(date);
    
    const totalRevenue = dayRevenue.reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    const expensesByCategory = dayExpenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<ExpenseCategory, number>);

    return {
      date,
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      expensesByCategory,
    };
  }, [getExpensesByDate, getRevenueByDate]);

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

    // Get daily breakdown
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

  const getCategoryTotals = useCallback((startDate?: string, endDate?: string) => {
    const filteredExpenses = startDate && endDate 
      ? getExpensesByDateRange(startDate, endDate)
      : expenses;

    return filteredExpenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<ExpenseCategory, number>);
  }, [expenses, getExpensesByDateRange]);

  const recentExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 20);
  }, [expenses]);

  const totalExpensesAllTime = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const totalRevenueAllTime = useMemo(() => {
    return revenue.reduce((sum, r) => sum + r.amount, 0);
  }, [revenue]);

  return {
    expenses,
    revenue,
    addExpense,
    deleteExpense,
    addRevenue,
    deleteRevenue,
    getExpensesByDate,
    getExpensesByDateRange,
    getRevenueByDate,
    getRevenueByDateRange,
    getDailySummary,
    getMonthlySummary,
    getCategoryTotals,
    recentExpenses,
    totalExpensesAllTime,
    totalRevenueAllTime,
    netProfitAllTime: totalRevenueAllTime - totalExpensesAllTime,
  };
}
