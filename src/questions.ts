/**
 * Five TypeScript fundamentals exercises, each with a documented contract
 * and a worked implementation. The contract tests are in `questions.test.ts`;
 * `questions.edge.test.ts` covers inputs the contract suite leaves out.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/** Statistics computed from an array of numbers */
export interface ArrayStats {
  readonly count: number;
  readonly sum: number;
  readonly average: number;
  readonly min: number;
  readonly max: number;
}

/** A parsed connection string with typed values */
export interface ConnectionConfig {
  readonly host: string;
  readonly port: number;
  readonly database: string;
  readonly ssl: boolean;
  readonly timeout: number;
}

/** A financial transaction record */
export interface Transaction {
  readonly id: string;
  readonly category: string;
  readonly amount: number;
  readonly date: string;
}

/** Summary of transactions grouped by category */
export interface CategorySummary {
  readonly category: string;
  readonly totalAmount: number;
  readonly transactionCount: number;
  readonly transactions: readonly Transaction[];
}

/** An entity with an identifiable key */
export interface Identifiable<K extends string | number> {
  readonly id: K;
}

// ============================================================================
// PROBLEM 1: Arrays & Basic Algorithms
// ============================================================================

/**
 * Computes statistical information about an array of numbers.
 *
 * Given an array of numbers, calculate and return an object containing:
 * - count: the number of elements in the array
 * - sum: the total of all elements
 * - average: the arithmetic mean (sum / count)
 * - min: the smallest value
 * - max: the largest value
 *
 * Requirements:
 * - If the array is empty, return an object with count=0, sum=0, average=0, min=0, max=0
 * - Handle negative numbers correctly
 * - Handle decimal numbers correctly
 * - Do not modify the input array
 *
 * @example
 * computeArrayStats([1, 2, 3, 4, 5])
 * // Returns: { count: 5, sum: 15, average: 3, min: 1, max: 5 }
 *
 * @example
 * computeArrayStats([-10, 0, 10])
 * // Returns: { count: 3, sum: 0, average: 0, min: -10, max: 10 }
 *
 * @example
 * computeArrayStats([])
 * // Returns: { count: 0, sum: 0, average: 0, min: 0, max: 0 }
 *
 * Complexity: O(n) time, O(1) extra space.
 *
 * Difficulty: Easy
 */
export function computeArrayStats(numbers: readonly number[]): ArrayStats {
  if (numbers.length === 0) {
    return { count: 0, sum: 0, average: 0, min: 0, max: 0 };
  }

  // One pass instead of Math.min(...numbers): spreading a very large array
  // into call arguments overflows the stack.
  let sum = 0;
  let min = Infinity;
  let max = -Infinity;
  for (const value of numbers) {
    sum += value;
    if (value < min) min = value;
    if (value > max) max = value;
  }

  return { count: numbers.length, sum, average: sum / numbers.length, min, max };
}

// ============================================================================
// PROBLEM 2: Strings & Parsing
// ============================================================================

/**
 * Parses a database connection string into a structured configuration object.
 *
 * The connection string format is:
 *   "host=<value>;port=<value>;database=<value>;ssl=<value>;timeout=<value>"
 *
 * Requirements:
 * - Parse each key-value pair separated by semicolons
 * - Keys and values are separated by '='
 * - 'port' and 'timeout' must be parsed as numbers
 * - 'ssl' must be parsed as a boolean (string "true" -> true, anything else -> false)
 * - 'host' and 'database' remain as strings
 * - Keys may appear in any order
 * - Whitespace around keys and values should be trimmed
 * - If a required key is missing, throw an Error with message "Missing required field: <fieldname>"
 * - If 'port' or 'timeout' is empty or not a finite number, throw an Error with
 *   message "Invalid number for field: <fieldname>"
 * - Segments without '=' are ignored; if a key repeats, the last value wins
 *
 * @example
 * parseConnectionString("host=localhost;port=5432;database=mydb;ssl=true;timeout=30")
 * // Returns: { host: "localhost", port: 5432, database: "mydb", ssl: true, timeout: 30 }
 *
 * @example
 * parseConnectionString("database=test; host=127.0.0.1; ssl=false; port=3306; timeout=60")
 * // Returns: { host: "127.0.0.1", port: 3306, database: "test", ssl: false, timeout: 60 }
 *
 * @example
 * parseConnectionString("host=db.example.com;port=5432;database=prod")
 * // Throws: Error("Missing required field: ssl")
 *
 * Complexity: O(n) in the length of the string.
 *
 * Difficulty: Medium
 */
export function parseConnectionString(connectionString: string): ConnectionConfig {
  const fields = new Map<string, string>();
  for (const segment of connectionString.split(";")) {
    // Split on the first "=" only so values may themselves contain "=".
    const separator = segment.indexOf("=");
    if (separator === -1) continue;
    const key = segment.slice(0, separator).trim();
    const value = segment.slice(separator + 1).trim();
    if (key !== "") fields.set(key, value);
  }

  const requireField = (name: keyof ConnectionConfig): string => {
    const value = fields.get(name);
    if (value === undefined) {
      throw new Error(`Missing required field: ${name}`);
    }
    return value;
  };

  const requireNumber = (name: "port" | "timeout"): number => {
    const raw = requireField(name);
    const parsed = Number(raw);
    // Number("") is 0, so an empty value must be rejected explicitly.
    if (raw === "" || !Number.isFinite(parsed)) {
      throw new Error(`Invalid number for field: ${name}`);
    }
    return parsed;
  };

  return {
    host: requireField("host"),
    port: requireNumber("port"),
    database: requireField("database"),
    ssl: requireField("ssl") === "true",
    timeout: requireNumber("timeout"),
  };
}

// ============================================================================
// PROBLEM 3: Objects & Records
// ============================================================================

/**
 * Groups an array of transactions by their category and computes summary statistics.
 *
 * Given an array of transaction records, group them by category and for each
 * category compute:
 * - category: the category name
 * - totalAmount: sum of all transaction amounts in that category
 * - transactionCount: number of transactions in that category
 * - transactions: array of all transactions in that category (preserve original order)
 *
 * Requirements:
 * - Return an array of CategorySummary objects
 * - Sort the result by category name alphabetically (A-Z)
 * - If the input array is empty, return an empty array
 * - Do not modify the input array or transaction objects
 * - Preserve the original order of transactions within each category
 *
 * @example
 * const transactions = [
 *   { id: "t1", category: "Food", amount: 25.50, date: "2024-01-15" },
 *   { id: "t2", category: "Transport", amount: 15.00, date: "2024-01-15" },
 *   { id: "t3", category: "Food", amount: 12.75, date: "2024-01-16" },
 * ];
 * groupTransactionsByCategory(transactions)
 * // Returns: [
 * //   {
 * //     category: "Food",
 * //     totalAmount: 38.25,
 * //     transactionCount: 2,
 * //     transactions: [
 * //       { id: "t1", category: "Food", amount: 25.50, date: "2024-01-15" },
 * //       { id: "t3", category: "Food", amount: 12.75, date: "2024-01-16" }
 * //     ]
 * //   },
 * //   {
 * //     category: "Transport",
 * //     totalAmount: 15.00,
 * //     transactionCount: 1,
 * //     transactions: [
 * //       { id: "t2", category: "Transport", amount: 15.00, date: "2024-01-15" }
 * //     ]
 * //   }
 * // ]
 *
 * Complexity: O(n + k log k) for n transactions in k categories.
 *
 * Difficulty: Medium
 */
export function groupTransactionsByCategory(
  transactions: readonly Transaction[]
): readonly CategorySummary[] {
  const groups = new Map<string, Transaction[]>();
  for (const transaction of transactions) {
    const group = groups.get(transaction.category);
    if (group) {
      group.push(transaction);
    } else {
      groups.set(transaction.category, [transaction]);
    }
  }

  // Plain code-unit comparison keeps the order deterministic across
  // locales, so "Zebra" sorts before "apple".
  const categories = [...groups.keys()].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

  return categories.map((category) => {
    const items = groups.get(category) ?? [];
    return {
      category,
      totalAmount: items.reduce((total, item) => total + item.amount, 0),
      transactionCount: items.length,
      transactions: items,
    };
  });
}

// ============================================================================
// PROBLEM 4: Types & Generics
// ============================================================================

/**
 * Creates a lookup table (Map) from an array of objects using their 'id' property as the key.
 *
 * This is a generic function that works with any object type that has an 'id' property.
 * The resulting Map allows O(1) lookup of items by their ID.
 *
 * Requirements:
 * - Return a Map where keys are the 'id' values and values are the original objects
 * - The function must be generic and work with any object that has an 'id' property
 * - If duplicate IDs exist, later items should overwrite earlier ones
 * - If the input array is empty, return an empty Map
 * - Do not modify the input array or objects
 *
 * @example
 * interface User { id: number; name: string; }
 * const users: User[] = [
 *   { id: 1, name: "Alice" },
 *   { id: 2, name: "Bob" },
 * ];
 * const lookup = createLookupTable(users);
 * lookup.get(1) // Returns: { id: 1, name: "Alice" }
 * lookup.get(2) // Returns: { id: 2, name: "Bob" }
 * lookup.get(3) // Returns: undefined
 *
 * @example
 * interface Product { id: string; price: number; }
 * const products: Product[] = [
 *   { id: "SKU-001", price: 29.99 },
 *   { id: "SKU-002", price: 49.99 },
 * ];
 * const lookup = createLookupTable(products);
 * lookup.get("SKU-001") // Returns: { id: "SKU-001", price: 29.99 }
 *
 * Complexity: O(n) time and space.
 *
 * Difficulty: Medium
 */
export function createLookupTable<K extends string | number, T extends Identifiable<K>>(
  items: readonly T[]
): Map<K, T> {
  // Map keeps the last value set for a key, which gives "later wins".
  return new Map(items.map((item): [K, T] => [item.id, item]));
}

// ============================================================================
// PROBLEM 5: Async / Promise-based Logic
// ============================================================================

/**
 * Executes an async operation with automatic retry logic.
 *
 * This function attempts to execute the provided async operation. If it fails
 * (throws an error), it will retry up to 'maxAttempts' times, waiting 'delayMs'
 * milliseconds between each attempt.
 *
 * Requirements:
 * - Execute the operation immediately on first attempt
 * - If the operation succeeds, return its result immediately
 * - If the operation fails and attempts remain, wait 'delayMs' ms then retry
 * - If all attempts are exhausted, throw the last error that occurred
 * - The delay should occur AFTER a failed attempt, not before the first attempt
 * - 'maxAttempts' must be at least 1; if less than 1, treat it as 1
 * - 'delayMs' must be non-negative; if negative, treat it as 0
 * - A fractional 'maxAttempts' is rounded down; NaN falls back to the minimums above
 *
 * @example
 * // Operation succeeds on first try
 * const result = await executeWithRetry(
 *   async () => "success",
 *   3,
 *   100
 * );
 * // Returns: "success" (immediately, no retries needed)
 *
 * @example
 * // Operation fails twice, then succeeds
 * let attempts = 0;
 * const result = await executeWithRetry(
 *   async () => {
 *     attempts++;
 *     if (attempts < 3) throw new Error("Not yet");
 *     return "finally!";
 *   },
 *   5,
 *   100
 * );
 * // Returns: "finally!" (after 2 failures and ~200ms delay total)
 *
 * @example
 * // Operation always fails
 * await executeWithRetry(
 *   async () => { throw new Error("Always fails"); },
 *   3,
 *   100
 * );
 * // Throws: Error("Always fails") after 3 attempts and ~200ms delay total
 *
 * Complexity: At most maxAttempts calls and (maxAttempts - 1) * delayMs of waiting.
 *
 * Difficulty: Medium
 */
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxAttempts: number,
  delayMs: number
): Promise<T> {
  // NaN falls back to the minimum as well.
  const attempts = Math.max(1, Math.floor(maxAttempts) || 1);
  const delay = Math.max(0, delayMs || 0);

  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt < attempts && delay > 0) {
        await sleep(delay);
      }
    }
  }
  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
