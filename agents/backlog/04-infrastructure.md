# Backlog: Infrastructure & Technical Debt

Priority 4 — Code quality, dependency cleanup, migration.

---

## 23. Project-Wide Ramda Removal

**Affected packages:** core, states, actions, data, forms, chart, helpers

**What's needed:**

- [ ] Replace `isNil(v)` → `v == null`
- [ ] Replace `pick`/`omit` → native `Object.fromEntries` + `Object.entries` with filter
- [ ] Replace `pipe`, `map`, `filter` with native equivalents
- [ ] Remove ramda from all package.json files
Q: In order to remove ramda dependency, wouldn't it be easier to just create a replacement function under core/utils. code remains same but uses native equivaluents. 

**Priority:** Low — no functional impact, reduces bundle size.

---

## 24. @rokkit/helpers — Under-Exported Utilities

**Source:** docs/llms/ analysis

**What's needed:**
- [ ] Audit exports vs internal utilities
- [ ] Export useful utilities that are currently internal-only

---

## ~~25. @rokkit/chart — Dead bits-ui Dependency~~ ✅ DONE

bits-ui already removed from chart during ADR-003 archive cleanup. No bits-ui imports in any @rokkit package.

---

## ~~58. Svelte 4 → 5 Migration — Remaining Files~~ ✅ DONE

All Svelte 4 patterns (`export let`, `$:`, `createEventDispatcher`, `$$restProps`) removed from codebase. Archive deleted. Forms legacy components deleted (#8). No `export let` in any `.svelte` file.

## Release. 

We need a pre release script that copies LICENCE from root and post release script that removes it for each package.
