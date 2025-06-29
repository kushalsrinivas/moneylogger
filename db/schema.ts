import { db } from './db';

// Minimal transaction type definition to satisfy TypeScript without
// importing the full expo-sqlite types.
type SQLTx = {
  executeSql: (sql: string, params?: unknown[]) => void;
};

/**
 * Initialise all required tables. This runs the `CREATE TABLE IF NOT EXISTS` statements
 * inside a single transaction for speed and atomicity.
 *
 * It is safe to call this multiple times; the `IF NOT EXISTS` guard makes it idempotent.
 */
export function initDb() {
  db.transaction((tx: SQLTx) => {
    // 1️⃣ transactions
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL,
        type TEXT,
        category TEXT,
        notes TEXT,
        tags TEXT,
        date TEXT,
        created_at TEXT,
        is_recurring INTEGER
      );
    `);

    // 2️⃣ budgets
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS budgets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT,
        amount_limit REAL,
        month INTEGER,
        year INTEGER,
        cycle TEXT,
        created_at TEXT,
        UNIQUE (category, month, year)
      );
    `);

    // 3️⃣ goals
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        target_amount REAL,
        saved_amount REAL,
        deadline TEXT,
        created_at TEXT
      );
    `);

    // 4️⃣ challenges
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS challenges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        type TEXT,
        status TEXT,
        start_date TEXT,
        end_date TEXT
      );
    `);

    // 5️⃣ stats
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        xp INTEGER,
        streak INTEGER,
        level INTEGER,
        last_entry TEXT
      );
    `);

    // 6️⃣ settings
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `);
  });
} 