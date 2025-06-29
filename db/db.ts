import * as SQLite from 'expo-sqlite';

// Open (and automatically create if it doesn\'t exist) the budget database.
export const db = SQLite.openDatabase('budget.db');

/**
 * A Promise-based helper around `expo-sqlite`\'s callback API.
 *
 * Example:
 * ```ts
 * await executeSqlAsync('SELECT * FROM transactions');
 * ```
 */
export function executeSqlAsync(
  sql: string,
  params: SQLite.SQLStatementArg[] = [],
): Promise<SQLite.SQLResultSet> {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        sql,
        params,
        (_txObj, result) => resolve(result),
        (_txObj, error) => {
          reject(error);
          // Returning `true` here would indicate we handled the error and want
          // to continue the transaction chain. We return `false` to make the
          // transaction roll back when an error occurs.
          return false;
        },
      );
    });
  });
} 