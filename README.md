# Five TypeScript fundamentals exercises

A deliberately unfinished practice set for arrays, parsing, grouping, generics and async retry behavior. The repository contains **function stubs and tests**, not completed implementations or an interviewer answer key.

| Function | What to practice |
| --- | --- |
| `computeArrayStats` | Empty inputs, numeric aggregation and readonly arrays |
| `parseConnectionString` | Whitespace, required fields and typed values |
| `groupTransactionsByCategory` | Grouping, totals, order preservation and immutable inputs |
| `createLookupTable` | Generic ID keys, `Map` and duplicate handling |
| `executeWithRetry` | Promise failures, attempt limits and timing between retries |

## Work through a problem

Use Node 20+ and npm:

```sh
npm ci --ignore-scripts
npm run typecheck
npm test
```

The stubs in `src/questions.ts` throw `Not implemented yet`. A failing test run is the expected starting state; a passing type check does not mean the exercises are solved. The reviewed baseline discovers 48 tests: 47 fail and one passes with the stubs unchanged. Implement one function, then run only its cases:

```sh
npm test -- -t computeArrayStats
npm run test:watch
```

Read each function's contract before coding. Keep its signature and strict typing, avoid `any`, and preserve the tests. The input arrays and objects are readonly for a reason: several cases check that solutions do not mutate them.

For example, the statistics contract requires this behavior **after you implement it**:

```typescript
computeArrayStats([1, 2, 3]);
// { count: 3, sum: 6, average: 2, min: 1, max: 3 }
```

## What is included

- `src/questions.ts`: five documented stubs and the shared interfaces.
- `src/questions.test.ts`: example, edge-case, mutation and retry/timing checks.
- `vitest.config.ts`: Node-based test discovery.
- `tsconfig.json`: strict TypeScript configuration.

The earlier README referred to `src/solutions.ts`, but that file is absent. The broken solutions-only script/configuration was removed rather than implying an answer key exists. The exercise stubs and test expectations remain unchanged. Unused copied fonts were removed; there is no browser interface to render them.

## How to use it in a portfolio

Keep this as a learning or assessment repository, separate from finished applications. Useful evidence would be a completed solution with a short explanation of its tradeoffs and tests for any contract extensions. The current scaffold is not a stronger pin than a working API or integration project.

If used for interviews, agree on the expected time and scoring rubric rather than treating this repository as a standardized hiring assessment. Existing tests cover examples of each contract, not every malformed input, resource limit or cancellation policy. No license file is included.
