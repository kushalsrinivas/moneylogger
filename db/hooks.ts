import { useEffect, useState } from 'react';
import { Budget, getBudgetsForMonth } from './actions';
import { executeSqlAsync } from './db';

export interface Transaction {
  id: number;
  amount: number;
  type: string;
  category: string;
  notes: string | null;
  tags: string | null;
  date: string;
  created_at: string;
  is_recurring: number;
}

/**
 * Fetches all transactions ordered by date descending.
 */
export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchTransactions = async () => {
      try {
        const res = await executeSqlAsync(
          'SELECT * FROM transactions ORDER BY date DESC',
        );
        if (!cancelled) {
          const rows = res.rows as unknown as { _array: Transaction[] };
          setTransactions(rows._array);
        }
      } catch (err) {
        if (!cancelled) setError(err as Error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchTransactions();

    return () => {
      cancelled = true;
    };
  }, []);

  return { transactions, loading, error };
}

// ---------------------------------------------------------------------------
// Budgets Hook
// ---------------------------------------------------------------------------

/**
 * Fetch budgets for the current calendar month and keep them in state.
 */
export function useCurrentMonthBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    const fetchBudgets = async () => {
      try {
        const data = await getBudgetsForMonth(month, year);
        if (!cancelled) setBudgets(data);
      } catch (err) {
        if (!cancelled) setError(err as Error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchBudgets();

    return () => {
      cancelled = true;
    };
  }, []);

  return { budgets, loading, error };
}

// ---------------------------------------------------------------------------
// Stats Hook (XP, streak, level)
// ---------------------------------------------------------------------------

export interface StatsRow {
  id: number;
  xp: number;
  streak: number;
  level: number;
  last_entry: string;
}

export function useStats() {
  const [stats, setStats] = useState<StatsRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchStats = async () => {
      try {
        const res = await executeSqlAsync('SELECT * FROM stats WHERE id = 1');
        const rows = res.rows as unknown as { _array: StatsRow[] };
        if (!cancelled) setStats(rows._array[0] ?? null);
      } catch (err) {
        if (!cancelled) setError(err as Error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchStats();

    return () => {
      cancelled = true;
    };
  }, []);

  return { stats, loading, error };
} 