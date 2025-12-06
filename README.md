# TypeScript fundamentals exercises

A small practice set: five self-contained TypeScript functions covering array
aggregation, string parsing, grouping, generics and async retry logic. Each one
has a written contract (JSDoc in `src/questions.ts`), an implementation, and
tests. It is a learning exercise, not a library. Nothing here is published to
npm or meant to be imported by other projects.

## Running it

Requires Node 22.12 or newer (`.nvmrc` pins 22) and npm.

```sh
npm ci
npm run check        # typecheck + lint + tests
```

The individual steps are also available:

```sh
npm run typecheck    # tsc --noEmit, strict mode
npm run lint         # ESLint flat config with typescript-eslint strict rules
npm test             # Vitest, 70 tests across two files
npm test -- -t parseConnectionString   # one exercise only
npm run test:watch
```

## The exercises

All five functions take readonly inputs and never mutate them; the tests check
this with plain and frozen arrays.

### 1. `computeArrayStats(numbers)`

Returns `count`, `sum`, `average`, `min` and `max`. An empty array gives all
zeros instead of `NaN`/`Infinity`.

```ts
computeArrayStats([1, 2, 3]);
// { count: 3, sum: 6, average: 2, min: 1, max: 3 }
```

A single loop computes all the values in one pass. `Math.min(...numbers)` would be
shorter, but spreading a few hundred thousand elements into function
arguments throws a `RangeError`. An edge-case test covers 300,000 values.
O(n) time, O(1) extra space.

### 2. `parseConnectionString(text)`

Parses `host=...;port=...;database=...;ssl=...;timeout=...` into a typed
`ConnectionConfig`.

```ts
parseConnectionString("database=test; host=127.0.0.1; ssl=false; port=3306; timeout=60");
// { host: "127.0.0.1", port: 3306, database: "test", ssl: false, timeout: 60 }
```

Segments are split on `;`, then on the *first* `=` only, so a value like
`a=b` survives. Keys and values are trimmed, and empty segments are ignored.
A repeated key takes its last value. `ssl` is `true` only for the exact string
`"true"`. A missing key throws `Missing required field: <name>`. The original
contract didn't cover bad numbers, so an empty or non-numeric `port` or
`timeout` now throws `Invalid number for field: <name>` instead of returning
`NaN` or (for an empty string) `0`. O(n) in the string length.

### 3. `groupTransactionsByCategory(transactions)`

Groups transactions by `category` and returns one summary per category with
`totalAmount`, `transactionCount` and the original transactions in input order.
The summaries are sorted by category name.

A `Map` collects each group in insertion order. The category keys are then
sorted by plain code-unit comparison rather than `localeCompare`, so the
order doesn't depend on the runtime's locale data. The trade-off is that
uppercase names sort before lowercase ones (`"Zebra"` before `"apple"`).
Totals are ordinary floating-point sums, so money values may need rounding
for display. O(n + k log k) for n transactions in k categories.

### 4. `createLookupTable(items)`

Builds a `Map<K, T>` keyed by each item's `id`, where `K` is `string | number`
and inferred from the input type.

```ts
const lookup = createLookupTable([{ id: "SKU-001", price: 29.99 }]);
lookup.get("SKU-001"); // { id: "SKU-001", price: 29.99 }
```

This is `new Map(items.map(item => [item.id, item]))`. With duplicate ids the
last item wins, because a later `Map` entry overwrites an earlier one. Values
are the original object references, not copies. The numeric key `1` and the
string key `"1"` stay separate. O(n).

### 5. `executeWithRetry(operation, maxAttempts, delayMs)`

Runs an async operation and retries it on failure. It waits `delayMs` after
each failed attempt except the last, and then rethrows the last error
unchanged, even if it isn't an `Error`.

```ts
await executeWithRetry(() => fetch(url).then((res) => res.json()), 3, 100);
// up to 3 calls, at most ~200 ms of waiting
```

`maxAttempts` below 1 (or `NaN`) becomes 1, and fractional values are rounded
down. A negative or `NaN` delay becomes 0. A synchronous throw from
`operation` counts as a failed attempt, because the call sits inside the
`try`. The fake-timer test checks that the first call has no delay and that
no timer is left pending after the final failure. There is no jitter,
backoff or cancellation (`AbortSignal`), because the exercise contract asks
for a fixed delay.

## Layout

```
src/questions.ts             contracts (JSDoc) and implementations
src/questions.test.ts        the original 48 contract tests
src/questions.edge.test.ts   22 edge-case tests added alongside the implementations
eslint.config.js             ESLint flat config
vitest.config.ts             Node test environment, discovers src/**/*.test.ts
```

## Notes

- The functions started as stubs from a junior-level practice brief. The
  contracts and the original tests are kept. Two timing tests now also assert
  how many attempts ran, and the only behaviour added is the `Invalid number`
  error above.
- TypeScript is held at 6.0 because typescript-eslint does not yet support
  TypeScript 7.

## License

MIT, see [LICENSE](LICENSE).
