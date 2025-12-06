/**
 * ============================================================================
 * TYPESCRIPT JUNIOR ENGINEER ASSESSMENT - TEST SUITE
 * ============================================================================
 *
 * These tests validate the implementations in questions.ts.
 * Run with: npm test
 *
 * DO NOT MODIFY THIS FILE
 * ============================================================================
 */

import { describe, it, expect } from "vitest";
import {
  computeArrayStats,
  parseConnectionString,
  groupTransactionsByCategory,
  createLookupTable,
  executeWithRetry,
  type Transaction,
  type Identifiable,
} from "./questions";

// ============================================================================
// PROBLEM 1: computeArrayStats
// ============================================================================

describe("computeArrayStats", () => {
  it("computes correct statistics for a simple array of positive integers", () => {
    const result = computeArrayStats([1, 2, 3, 4, 5]);

    expect(result.count).toBe(5);
    expect(result.sum).toBe(15);
    expect(result.average).toBe(3);
    expect(result.min).toBe(1);
    expect(result.max).toBe(5);
  });

  it("handles an array with a single element", () => {
    const result = computeArrayStats([42]);

    expect(result.count).toBe(1);
    expect(result.sum).toBe(42);
    expect(result.average).toBe(42);
    expect(result.min).toBe(42);
    expect(result.max).toBe(42);
  });

  it("handles negative numbers correctly", () => {
    const result = computeArrayStats([-10, -5, 0, 5, 10]);

    expect(result.count).toBe(5);
    expect(result.sum).toBe(0);
    expect(result.average).toBe(0);
    expect(result.min).toBe(-10);
    expect(result.max).toBe(10);
  });

  it("handles decimal numbers correctly", () => {
    const result = computeArrayStats([1.5, 2.5, 3.0]);

    expect(result.count).toBe(3);
    expect(result.sum).toBe(7);
    expect(result.average).toBeCloseTo(2.333, 2);
    expect(result.min).toBe(1.5);
    expect(result.max).toBe(3.0);
  });

  it("returns zeros for an empty array", () => {
    const result = computeArrayStats([]);

    expect(result.count).toBe(0);
    expect(result.sum).toBe(0);
    expect(result.average).toBe(0);
    expect(result.min).toBe(0);
    expect(result.max).toBe(0);
  });

  it("does not modify the input array", () => {
    const original = [3, 1, 4, 1, 5];
    const copy = [...original];
    computeArrayStats(original);

    expect(original).toEqual(copy);
  });

  it("returns an object with all required properties", () => {
    const result = computeArrayStats([1, 2, 3]);

    expect(result).toHaveProperty("count");
    expect(result).toHaveProperty("sum");
    expect(result).toHaveProperty("average");
    expect(result).toHaveProperty("min");
    expect(result).toHaveProperty("max");
  });
});

// ============================================================================
// PROBLEM 2: parseConnectionString
// ============================================================================

describe("parseConnectionString", () => {
  it("parses a valid connection string with all fields", () => {
    const result = parseConnectionString(
      "host=localhost;port=5432;database=mydb;ssl=true;timeout=30"
    );

    expect(result.host).toBe("localhost");
    expect(result.port).toBe(5432);
    expect(result.database).toBe("mydb");
    expect(result.ssl).toBe(true);
    expect(result.timeout).toBe(30);
  });

  it("handles fields in different order", () => {
    const result = parseConnectionString(
      "timeout=60;ssl=false;database=testdb;port=3306;host=db.example.com"
    );

    expect(result.host).toBe("db.example.com");
    expect(result.port).toBe(3306);
    expect(result.database).toBe("testdb");
    expect(result.ssl).toBe(false);
    expect(result.timeout).toBe(60);
  });

  it("trims whitespace around keys and values", () => {
    const result = parseConnectionString(
      "  host = localhost ; port = 5432 ; database = mydb ; ssl = true ; timeout = 30  "
    );

    expect(result.host).toBe("localhost");
    expect(result.port).toBe(5432);
    expect(result.database).toBe("mydb");
    expect(result.ssl).toBe(true);
    expect(result.timeout).toBe(30);
  });

  it("parses ssl=false correctly as boolean false", () => {
    const result = parseConnectionString(
      "host=h;port=1;database=d;ssl=false;timeout=1"
    );

    expect(result.ssl).toBe(false);
    expect(typeof result.ssl).toBe("boolean");
  });

  it("parses ssl=true correctly as boolean true", () => {
    const result = parseConnectionString(
      "host=h;port=1;database=d;ssl=true;timeout=1"
    );

    expect(result.ssl).toBe(true);
    expect(typeof result.ssl).toBe("boolean");
  });

  it("treats any non-'true' ssl value as false", () => {
    const result = parseConnectionString(
      "host=h;port=1;database=d;ssl=yes;timeout=1"
    );

    expect(result.ssl).toBe(false);
  });

  it("parses port and timeout as numbers", () => {
    const result = parseConnectionString(
      "host=h;port=8080;database=d;ssl=false;timeout=120"
    );

    expect(typeof result.port).toBe("number");
    expect(typeof result.timeout).toBe("number");
    expect(result.port).toBe(8080);
    expect(result.timeout).toBe(120);
  });

  it("throws an error when host is missing", () => {
    expect(() =>
      parseConnectionString("port=5432;database=mydb;ssl=true;timeout=30")
    ).toThrow("Missing required field: host");
  });

  it("throws an error when port is missing", () => {
    expect(() =>
      parseConnectionString("host=localhost;database=mydb;ssl=true;timeout=30")
    ).toThrow("Missing required field: port");
  });

  it("throws an error when database is missing", () => {
    expect(() =>
      parseConnectionString("host=localhost;port=5432;ssl=true;timeout=30")
    ).toThrow("Missing required field: database");
  });

  it("throws an error when ssl is missing", () => {
    expect(() =>
      parseConnectionString("host=localhost;port=5432;database=mydb;timeout=30")
    ).toThrow("Missing required field: ssl");
  });

  it("throws an error when timeout is missing", () => {
    expect(() =>
      parseConnectionString("host=localhost;port=5432;database=mydb;ssl=true")
    ).toThrow("Missing required field: timeout");
  });

  it("returns an object with correct property types", () => {
    const result = parseConnectionString(
      "host=h;port=1;database=d;ssl=true;timeout=1"
    );

    expect(typeof result.host).toBe("string");
    expect(typeof result.port).toBe("number");
    expect(typeof result.database).toBe("string");
    expect(typeof result.ssl).toBe("boolean");
    expect(typeof result.timeout).toBe("number");
  });
});

// ============================================================================
// PROBLEM 3: groupTransactionsByCategory
// ============================================================================

describe("groupTransactionsByCategory", () => {
  it("groups transactions by category correctly", () => {
    const transactions: Transaction[] = [
      { id: "t1", category: "Food", amount: 25.5, date: "2024-01-15" },
      { id: "t2", category: "Transport", amount: 15.0, date: "2024-01-15" },
      { id: "t3", category: "Food", amount: 12.75, date: "2024-01-16" },
    ];

    const result = groupTransactionsByCategory(transactions);

    expect(result).toHaveLength(2);
  });

  it("calculates totalAmount correctly for each category", () => {
    const transactions: Transaction[] = [
      { id: "t1", category: "Food", amount: 10, date: "2024-01-15" },
      { id: "t2", category: "Food", amount: 20, date: "2024-01-15" },
      { id: "t3", category: "Food", amount: 30, date: "2024-01-16" },
    ];

    const result = groupTransactionsByCategory(transactions);
    const foodCategory = result.find((r) => r.category === "Food");

    expect(foodCategory?.totalAmount).toBe(60);
  });

  it("counts transactions correctly for each category", () => {
    const transactions: Transaction[] = [
      { id: "t1", category: "Bills", amount: 100, date: "2024-01-15" },
      { id: "t2", category: "Bills", amount: 50, date: "2024-01-16" },
      { id: "t3", category: "Entertainment", amount: 25, date: "2024-01-17" },
    ];

    const result = groupTransactionsByCategory(transactions);
    const billsCategory = result.find((r) => r.category === "Bills");
    const entertainmentCategory = result.find(
      (r) => r.category === "Entertainment"
    );

    expect(billsCategory?.transactionCount).toBe(2);
    expect(entertainmentCategory?.transactionCount).toBe(1);
  });

  it("sorts results alphabetically by category", () => {
    const transactions: Transaction[] = [
      { id: "t1", category: "Zebra", amount: 10, date: "2024-01-15" },
      { id: "t2", category: "Apple", amount: 20, date: "2024-01-15" },
      { id: "t3", category: "Mango", amount: 30, date: "2024-01-16" },
    ];

    const result = groupTransactionsByCategory(transactions);

    expect(result[0].category).toBe("Apple");
    expect(result[1].category).toBe("Mango");
    expect(result[2].category).toBe("Zebra");
  });

  it("preserves original transaction order within each category", () => {
    const transactions: Transaction[] = [
      { id: "first", category: "Test", amount: 10, date: "2024-01-15" },
      { id: "second", category: "Test", amount: 20, date: "2024-01-16" },
      { id: "third", category: "Test", amount: 30, date: "2024-01-17" },
    ];

    const result = groupTransactionsByCategory(transactions);
    const testCategory = result.find((r) => r.category === "Test");

    expect(testCategory?.transactions[0].id).toBe("first");
    expect(testCategory?.transactions[1].id).toBe("second");
    expect(testCategory?.transactions[2].id).toBe("third");
  });

  it("returns an empty array for empty input", () => {
    const result = groupTransactionsByCategory([]);

    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
  });

  it("handles a single transaction", () => {
    const transactions: Transaction[] = [
      { id: "t1", category: "Solo", amount: 99.99, date: "2024-01-15" },
    ];

    const result = groupTransactionsByCategory(transactions);

    expect(result).toHaveLength(1);
    expect(result[0].category).toBe("Solo");
    expect(result[0].totalAmount).toBe(99.99);
    expect(result[0].transactionCount).toBe(1);
    expect(result[0].transactions).toHaveLength(1);
  });

  it("includes all original transaction data in grouped results", () => {
    const transactions: Transaction[] = [
      { id: "unique-id-123", category: "Test", amount: 42.5, date: "2024-06-15" },
    ];

    const result = groupTransactionsByCategory(transactions);
    const transaction = result[0].transactions[0];

    expect(transaction.id).toBe("unique-id-123");
    expect(transaction.category).toBe("Test");
    expect(transaction.amount).toBe(42.5);
    expect(transaction.date).toBe("2024-06-15");
  });

  it("does not modify the input array", () => {
    const transactions: Transaction[] = [
      { id: "t1", category: "A", amount: 10, date: "2024-01-15" },
    ];
    const originalLength = transactions.length;
    const originalFirst = { ...transactions[0] };

    groupTransactionsByCategory(transactions);

    expect(transactions.length).toBe(originalLength);
    expect(transactions[0]).toEqual(originalFirst);
  });
});

// ============================================================================
// PROBLEM 4: createLookupTable
// ============================================================================

describe("createLookupTable", () => {
  it("creates a Map from an array of objects with numeric ids", () => {
    interface User extends Identifiable<number> {
      id: number;
      name: string;
    }

    const users: User[] = [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
      { id: 3, name: "Charlie" },
    ];

    const lookup = createLookupTable(users);

    expect(lookup.get(1)).toEqual({ id: 1, name: "Alice" });
    expect(lookup.get(2)).toEqual({ id: 2, name: "Bob" });
    expect(lookup.get(3)).toEqual({ id: 3, name: "Charlie" });
  });

  it("creates a Map from an array of objects with string ids", () => {
    interface Product extends Identifiable<string> {
      id: string;
      price: number;
    }

    const products: Product[] = [
      { id: "SKU-001", price: 29.99 },
      { id: "SKU-002", price: 49.99 },
    ];

    const lookup = createLookupTable(products);

    expect(lookup.get("SKU-001")).toEqual({ id: "SKU-001", price: 29.99 });
    expect(lookup.get("SKU-002")).toEqual({ id: "SKU-002", price: 49.99 });
  });

  it("returns undefined for non-existent keys", () => {
    interface Item extends Identifiable<number> {
      id: number;
    }

    const items: Item[] = [{ id: 1 }];
    const lookup = createLookupTable(items);

    expect(lookup.get(999)).toBeUndefined();
  });

  it("returns an empty Map for empty input", () => {
    interface Item extends Identifiable<number> {
      id: number;
    }

    const items: Item[] = [];
    const lookup = createLookupTable(items);

    expect(lookup.size).toBe(0);
    expect(lookup instanceof Map).toBe(true);
  });

  it("overwrites earlier items when duplicate ids exist", () => {
    interface Item extends Identifiable<number> {
      id: number;
      value: string;
    }

    const items: Item[] = [
      { id: 1, value: "first" },
      { id: 1, value: "second" },
      { id: 1, value: "third" },
    ];

    const lookup = createLookupTable(items);

    expect(lookup.size).toBe(1);
    expect(lookup.get(1)?.value).toBe("third");
  });

  it("has correct size matching unique ids", () => {
    interface Item extends Identifiable<number> {
      id: number;
    }

    const items: Item[] = [
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 2 }, // duplicate
    ];

    const lookup = createLookupTable(items);

    expect(lookup.size).toBe(3);
  });

  it("preserves all properties of the original objects", () => {
    interface ComplexItem extends Identifiable<string> {
      id: string;
      name: string;
      nested: { a: number; b: number };
      tags: string[];
    }

    const items: ComplexItem[] = [
      {
        id: "complex",
        name: "Test",
        nested: { a: 1, b: 2 },
        tags: ["x", "y"],
      },
    ];

    const lookup = createLookupTable(items);
    const retrieved = lookup.get("complex");

    expect(retrieved?.name).toBe("Test");
    expect(retrieved?.nested).toEqual({ a: 1, b: 2 });
    expect(retrieved?.tags).toEqual(["x", "y"]);
  });

  it("does not modify the input array", () => {
    interface Item extends Identifiable<number> {
      id: number;
    }

    const items: Item[] = [{ id: 1 }, { id: 2 }];
    const originalLength = items.length;

    createLookupTable(items);

    expect(items.length).toBe(originalLength);
  });
});

// ============================================================================
// PROBLEM 5: executeWithRetry
// ============================================================================

describe("executeWithRetry", () => {
  it("returns the result when operation succeeds on first try", async () => {
    const result = await executeWithRetry(async () => "success", 3, 10);

    expect(result).toBe("success");
  });

  it("retries and succeeds after initial failures", async () => {
    let attempts = 0;
    const result = await executeWithRetry(
      async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error("Not yet");
        }
        return "finally";
      },
      5,
      10
    );

    expect(result).toBe("finally");
    expect(attempts).toBe(3);
  });

  it("throws the last error when all attempts fail", async () => {
    let attempts = 0;

    await expect(
      executeWithRetry(
        async () => {
          attempts++;
          throw new Error(`Attempt ${attempts} failed`);
        },
        3,
        10
      )
    ).rejects.toThrow("Attempt 3 failed");

    expect(attempts).toBe(3);
  });

  it("respects maxAttempts limit", async () => {
    let attempts = 0;

    try {
      await executeWithRetry(
        async () => {
          attempts++;
          throw new Error("Always fails");
        },
        5,
        10
      );
    } catch {
      // Expected to throw
    }

    expect(attempts).toBe(5);
  });

  it("treats maxAttempts less than 1 as 1", async () => {
    let attempts = 0;

    try {
      await executeWithRetry(
        async () => {
          attempts++;
          throw new Error("Fail");
        },
        0,
        10
      );
    } catch {
      // Expected to throw
    }

    expect(attempts).toBe(1);
  });

  it("treats negative maxAttempts as 1", async () => {
    let attempts = 0;

    try {
      await executeWithRetry(
        async () => {
          attempts++;
          throw new Error("Fail");
        },
        -5,
        10
      );
    } catch {
      // Expected to throw
    }

    expect(attempts).toBe(1);
  });

  it("treats negative delayMs as 0 (no delay)", async () => {
    const start = Date.now();
    let attempts = 0;

    try {
      await executeWithRetry(
        async () => {
          attempts++;
          throw new Error("Fail");
        },
        3,
        -100
      );
    } catch {
      // Expected to throw
    }

    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(50); // Should complete quickly with no delays
  });

  it("waits between retry attempts", async () => {
    const start = Date.now();
    let attempts = 0;

    try {
      await executeWithRetry(
        async () => {
          attempts++;
          throw new Error("Fail");
        },
        3,
        50
      );
    } catch {
      // Expected to throw
    }

    const elapsed = Date.now() - start;
    // Should have waited approximately 100ms (2 delays of 50ms each)
    expect(elapsed).toBeGreaterThanOrEqual(90);
  });

  it("does not delay before the first attempt", async () => {
    const timestamps: number[] = [];
    const start = Date.now();

    await executeWithRetry(
      async () => {
        timestamps.push(Date.now() - start);
        return "done";
      },
      3,
      100
    );

    // First attempt should happen immediately (within 20ms of start)
    expect(timestamps[0]).toBeLessThan(20);
  });

  it("works with different return types", async () => {
    const numberResult = await executeWithRetry(async () => 42, 1, 10);
    expect(numberResult).toBe(42);

    const objectResult = await executeWithRetry(
      async () => ({ key: "value" }),
      1,
      10
    );
    expect(objectResult).toEqual({ key: "value" });

    const arrayResult = await executeWithRetry(async () => [1, 2, 3], 1, 10);
    expect(arrayResult).toEqual([1, 2, 3]);
  });

  it("handles async operations correctly", async () => {
    const result = await executeWithRetry(
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return "async-result";
      },
      1,
      10
    );

    expect(result).toBe("async-result");
  });
});

