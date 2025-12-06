# TypeScript Junior Engineer Assessment

A coding assessment designed to evaluate TypeScript fundamentals and problem-solving skills for junior software engineers (0–2 years experience).

---

## 📋 What Candidates Receive

- `src/questions.ts` — Function stubs with problem descriptions (implement these)
- `src/questions.test.ts` — Test cases to validate your solutions
- Configuration files (`package.json`, `tsconfig.json`, `vitest.config.ts`)

> ⚠️ **Note for Interviewers**: `src/solutions.ts` contains the full implementations and is for interviewer reference only. Do not share this file with candidates.

---

## 🎯 Candidate Instructions

### Your Goal

Implement all 5 functions in `src/questions.ts` to make all tests pass.

### Rules

✅ **DO:**
- Implement the function bodies in `src/questions.ts`
- Read the JSDoc comments carefully for requirements and examples
- Use only the TypeScript standard library (no external packages)

❌ **DO NOT:**
- Change function names, parameters, or return types
- Modify test files (`questions.test.ts`)
- Modify configuration files (`package.json`, `tsconfig.json`, `vitest.config.ts`)
- Use `any` type or disable TypeScript strict mode

---

## 🚀 How to Run the Tests

### Prerequisites

- Node.js 20 or higher
- npm

### Setup & Run

```bash
# Install dependencies
npm install

# Run tests
npm test
```

You should see test results in your terminal. Initially, all tests will fail. As you implement each function correctly, the corresponding tests will pass.

### Watch Mode (Optional)

For continuous feedback while developing:

```bash
npm run test:watch
```

---

## ⏱️ Estimated Time

**60–90 minutes**

The assessment includes 5 problems of varying difficulty (Easy to Medium). Budget your time accordingly and tackle the problems you feel most confident about first.

---

## 📝 Problem Overview

| # | Function | Topic | Difficulty |
|---|----------|-------|------------|
| 1 | `computeArrayStats` | Arrays & Algorithms | Easy |
| 2 | `parseConnectionString` | Strings & Parsing | Medium |
| 3 | `groupTransactionsByCategory` | Objects & Records | Medium |
| 4 | `createLookupTable` | Types & Generics | Medium |
| 5 | `executeWithRetry` | Async / Promises | Medium |

---

## 📊 Evaluation Criteria (For Interviewers)

Candidates are evaluated on:

- **Correctness** — Does the solution produce the expected output for all test cases?
- **Code Readability** — Is the code clean, well-organized, and easy to understand?
- **Idiomatic TypeScript** — Does the candidate use TypeScript features appropriately (types, generics, etc.)?
- **Edge Case Handling** — Are edge cases (empty inputs, invalid data) handled gracefully?
- **Problem-Solving Approach** — Does the solution demonstrate logical thinking and efficiency?

### Scoring Suggestion

- Each problem: 20 points (100 total)
- Partial credit for partially working solutions
- Bonus consideration for particularly elegant or efficient solutions

---

## 🔧 Technical Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript 5+
- **Test Runner**: Vitest
- **Mode**: Strict TypeScript (`"strict": true`)

