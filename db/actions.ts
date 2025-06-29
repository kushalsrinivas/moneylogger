import { ParsedTransaction } from '@/lib/parser';
import { executeSqlAsync } from './db';
import { Transaction } from './hooks';

/**
 * Inserts a parsed transaction object into the `transactions` table.
 * Returns the newly inserted row (with auto-generated id & created_at).
 */
export async function addTransaction(parsed: ParsedTransaction, xpIncrement = 10): Promise<Transaction> {
  const { amount, type, category, notes, date } = parsed;
  const createdAt = new Date().toISOString();

  const res = await executeSqlAsync(
    `INSERT INTO transactions (amount, type, category, notes, date, created_at, is_recurring)
     VALUES (?, ?, ?, ?, ?, ?, 0);`,
    [amount, type, category, notes, date, createdAt],
  );

  // SQLite returns an insertId we can use to fetch the full row.
  const { insertId } = res as unknown as { insertId: number };

  const rowRes = await executeSqlAsync('SELECT * FROM transactions WHERE id = ?', [insertId]);
  const rows = rowRes.rows as unknown as { _array: Transaction[] };

  const tx = rows._array[0];

  // award XP
  if (xpIncrement !== 0) {
    await updateXP(xpIncrement);
  }

  return tx;
}

export async function getAllTransactions(): Promise<Transaction[]> {
  const res = await executeSqlAsync('SELECT * FROM transactions ORDER BY date DESC');
  const rows = res.rows as unknown as { _array: Transaction[] };
  return rows._array;
}

export async function deleteTransaction(id: number, xpDecrement = 0): Promise<void> {
  // Remove row
  await executeSqlAsync('DELETE FROM transactions WHERE id = ?', [id]);

  if (xpDecrement !== 0) {
    await updateXP(-Math.abs(xpDecrement));
  }
}

/**
 * Increment the user's XP total in the `stats` table by delta (can be negative).
 * Creates the row if it does not yet exist.
 */
export async function updateXP(delta: number): Promise<void> {
  const nowIso = new Date().toISOString();

  const res = await executeSqlAsync('SELECT xp FROM stats WHERE id = 1');
  const rows = res.rows as unknown as { _array: { xp: number }[] };

  if (rows._array.length === 0) {
    // insert new
    await executeSqlAsync(
      'INSERT INTO stats (id, xp, streak, level, last_entry) VALUES (1, ?, 0, 1, ?)',
      [Math.max(0, delta), nowIso],
    );
  } else {
    await executeSqlAsync(
      'UPDATE stats SET xp = xp + ?, last_entry = ? WHERE id = 1',
      [delta, nowIso],
    );
  }
}

// ---------------------------------------------------------------------------
// 🗓️  Budget helpers
// ---------------------------------------------------------------------------

export interface Budget {
  id: number;
  category: string;
  amount_limit: number;
  month: number; // 0-based, aligns with Date.getMonth()
  year: number; // full year e.g. 2025
  cycle: string | null;
  created_at: string;
}

/**
 * Fetch budgets for a given month & year.
 */
export async function getBudgetsForMonth(month: number, year: number): Promise<Budget[]> {
  const res = await executeSqlAsync(
    'SELECT * FROM budgets WHERE month = ? AND year = ? ORDER BY category ASC',
    [month, year],
  );
  const rows = res.rows as unknown as { _array: Budget[] };
  return rows._array;
}

/**
 * Upsert a budget row for a specific category & month.
 * If a row already exists, its amount_limit is updated, otherwise a new row is inserted.
 */
export async function upsertBudget(
  category: string,
  amountLimit: number,
  month: number,
  year: number,
  cycle: string = 'monthly',
): Promise<void> {
  // Check if exists
  const res = await executeSqlAsync(
    'SELECT id FROM budgets WHERE category = ? AND month = ? AND year = ?',
    [category, month, year],
  );
  const rows = res.rows as unknown as { _array: { id: number }[] };

  if (rows._array.length === 0) {
    await executeSqlAsync(
      `INSERT INTO budgets (category, amount_limit, month, year, cycle, created_at)
       VALUES (?, ?, ?, ?, ?, ?);`,
      [category, amountLimit, month, year, cycle, new Date().toISOString()],
    );
  } else {
    const id = rows._array[0].id;
    await executeSqlAsync(
      'UPDATE budgets SET amount_limit = ?, cycle = ? WHERE id = ?',
      [amountLimit, cycle, id],
    );
  }
} 