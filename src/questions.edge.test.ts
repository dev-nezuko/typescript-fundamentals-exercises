import { afterEach, describe, expect, it, vi } from "vitest";
import {
  computeArrayStats,
  createLookupTable,
  executeWithRetry,
  groupTransactionsByCategory,
  parseConnectionString,
  type Transaction,
} from "./questions";

describe("computeArrayStats edge cases", () => {
  it("handles arrays too large to spread into Math.min/Math.max", () => {
    const numbers = Array.from({ length: 300_000 }, (_, i) => i - 150_000);

    const result = computeArrayStats(numbers);

    expect(result.count).toBe(300_000);
    expect(result.min).toBe(-150_000);
    expect(result.max).toBe(149_999);
    expect(result.sum).toBe(-150_000);
  });

  it("works when every value is negative", () => {
    expect(computeArrayStats([-3, -1, -2])).toEqual({
      count: 3,
      sum: -6,
      average: -2,
      min: -3,
      max: -1,
    });
  });

  it("accepts a frozen array", () => {
    const numbers = Object.freeze([5, 1, 3]);

    expect(computeArrayStats(numbers).max).toBe(5);
  });
});

describe("parseConnectionString edge cases", () => {
  const valid = "host=h;port=1;database=d;ssl=true;timeout=1";

  it("keeps '=' characters that appear inside a value", () => {
    const result = parseConnectionString(
      "host=h;port=1;database=a=b;ssl=true;timeout=1"
    );

    expect(result.database).toBe("a=b");
  });

  it("ignores empty segments and a trailing semicolon", () => {
    expect(parseConnectionString(`;;${valid};`)).toEqual(
      parseConnectionString(valid)
    );
  });

  it("lets a repeated key override the earlier value", () => {
    const result = parseConnectionString(`${valid};host=override`);

    expect(result.host).toBe("override");
  });

  it("treats the ssl flag as case-sensitive", () => {
    const result = parseConnectionString(
      "host=h;port=1;database=d;ssl=TRUE;timeout=1"
    );

    expect(result.ssl).toBe(false);
  });

  it("rejects a non-numeric port", () => {
    expect(() =>
      parseConnectionString("host=h;port=abc;database=d;ssl=true;timeout=1")
    ).toThrow("Invalid number for field: port");
  });

  it("rejects an empty timeout instead of reading it as 0", () => {
    expect(() =>
      parseConnectionString("host=h;port=1;database=d;ssl=true;timeout=")
    ).toThrow("Invalid number for field: timeout");
  });

  it("reports the first missing field for an empty string", () => {
    expect(() => parseConnectionString("")).toThrow(
      "Missing required field: host"
    );
  });
});

describe("groupTransactionsByCategory edge cases", () => {
  const tx = (id: string, category: string, amount: number): Transaction => ({
    id,
    category,
    amount,
    date: "2024-01-01",
  });

  it("keeps references to the original transaction objects", () => {
    const original = tx("t1", "Food", 5);

    const [summary] = groupTransactionsByCategory([original]);

    expect(summary.transactions[0]).toBe(original);
  });

  it("nets refunds (negative amounts) into the total", () => {
    const result = groupTransactionsByCategory([
      tx("t1", "Shop", 40),
      tx("t2", "Shop", -15),
    ]);

    expect(result[0].totalAmount).toBe(25);
  });

  it("sorts by code unit, so uppercase categories come first", () => {
    const result = groupTransactionsByCategory([
      tx("t1", "apple", 1),
      tx("t2", "Zebra", 1),
      tx("t3", "Mango", 1),
    ]);

    expect(result.map((r) => r.category)).toEqual(["Mango", "Zebra", "apple"]);
  });

  it("does not mutate a deeply frozen input", () => {
    const transactions = Object.freeze([
      Object.freeze(tx("t1", "B", 1)),
      Object.freeze(tx("t2", "A", 2)),
    ]);

    expect(() => groupTransactionsByCategory(transactions)).not.toThrow();
    expect(transactions.map((t) => t.id)).toEqual(["t1", "t2"]);
  });
});

describe("createLookupTable edge cases", () => {
  it("stores the original object references", () => {
    const item = { id: "a", label: "first" };

    expect(createLookupTable([item]).get("a")).toBe(item);
  });

  it("keeps the numeric key 1 and string key '1' distinct", () => {
    const lookup = createLookupTable<string | number, { id: string | number }>([
      { id: 1 },
      { id: "1" },
    ]);

    expect(lookup.size).toBe(2);
  });

  it("accepts a frozen array", () => {
    const items = Object.freeze([{ id: 1 }, { id: 2 }]);

    expect(createLookupTable(items).size).toBe(2);
  });
});

describe("executeWithRetry edge cases", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("rethrows non-Error rejection values unchanged", async () => {
    const reason = { code: "E_BUSY" };

    await expect(
      executeWithRetry(() => Promise.reject(reason), 2, 0)
    ).rejects.toBe(reason);
  });

  it("catches a synchronous throw from the operation", async () => {
    const operation = vi.fn((): Promise<string> => {
      throw new Error("sync failure");
    });

    await expect(executeWithRetry(operation, 2, 0)).rejects.toThrow(
      "sync failure"
    );
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it("rounds a fractional maxAttempts down", async () => {
    const operation = vi.fn(() => Promise.reject(new Error("fail")));

    await expect(executeWithRetry(operation, 2.9, 0)).rejects.toThrow("fail");
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it("treats NaN maxAttempts as a single attempt", async () => {
    const operation = vi.fn(() => Promise.reject(new Error("fail")));

    await expect(executeWithRetry(operation, Number.NaN, 0)).rejects.toThrow(
      "fail"
    );
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it("waits delayMs between attempts and not after the last one", async () => {
    vi.useFakeTimers();
    const operation = vi.fn(() => Promise.reject(new Error("fail")));

    const result = executeWithRetry(operation, 3, 1_000);
    const settled = expect(result).rejects.toThrow("fail");

    await vi.advanceTimersByTimeAsync(0);
    expect(operation).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(999);
    expect(operation).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    expect(operation).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(1_000);
    expect(operation).toHaveBeenCalledTimes(3);

    await settled;
    expect(vi.getTimerCount()).toBe(0);
  });
});
