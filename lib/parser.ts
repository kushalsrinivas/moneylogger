export interface ParsedTransaction {
  amount: number; // rupees
  type: 'expense' | 'income';
  category: string;
  notes: string;
  date: string; // ISO string
}

// Keywords that imply an income
const INCOME_KEYWORDS = [
  'salary',
  'got',
  'earned',
  'received',
  'bonus',
  'freelance',
  'interest',
  'refund',
];

/**
 * Very small natural-language parser for quick expense / income entries.
 * The implementation is intentionally lightweight; we can swap it
 * for a more sophisticated NLP later.
 */
export function parseTransaction(inputRaw: string): ParsedTransaction | null {
  if (!inputRaw.trim()) return null;

  const input = inputRaw.trim();

  // 1️⃣ Amount ---------------------------------------------------------------
  // Matches:
  //   50       -> 50
  //   10k      -> 10000
  //   ₹200.50  -> 200.5
  //   2.3k     -> 2300
  //   Rs 1000  -> 1000
  const amtMatch = input.match(/(?:₹|rs)?\s*(\d+(?:[.,]\d+)?)\s*(k?)/i);
  if (!amtMatch) return null;

  let amount = parseFloat(amtMatch[1].replace(',', ''));
  if (amtMatch[2]) {
    amount *= 1000; // convert 10k -> 10000
  }

  // 2️⃣ Type -----------------------------------------------------------------
  let type: 'expense' | 'income' = 'expense';
  const lower = input.toLowerCase();
  if (INCOME_KEYWORDS.some(k => lower.includes(k))) {
    type = 'income';
  }

  // 3️⃣ Category -------------------------------------------------------------
  let category = 'uncategorized';
  const catMatch = input.match(/\b(?:for|on)\s+(\w+)/i);
  if (catMatch) {
    category = catMatch[1].toLowerCase();
  }

  // 4️⃣ Notes ----------------------------------------------------------------
  // Remove amount and category portions from the string to derive notes.
  let notes = input;
  // Remove amount segment
  notes = notes.replace(amtMatch[0], '').trim();
  // Remove leading "for <cat>" or "on <cat>"
  if (catMatch) {
    notes = notes.replace(catMatch[0], '').trim();
  }
  // Collapse multiple spaces
  notes = notes.replace(/\s{2,}/g, ' ');

  // 5️⃣ Date -----------------------------------------------------------------
  const date = new Date().toISOString();

  return {
    amount,
    type,
    category,
    notes,
    date,
  };
} 