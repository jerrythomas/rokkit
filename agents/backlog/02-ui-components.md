# Backlog: UI Components

Priority 2 — Component enhancements and new features for `@rokkit/ui`.

---

## 3. ItemProxy → @rokkit/states

**Decision (deferred):** Not appropriate — different abstraction layers:
- `ItemProxy` — pure TypeScript, read-only field-mapper, no reactivity
- `@rokkit/states` classes — reactive Svelte 5 (`$state`/`$derived`), mutable, `@rokkit/core`-dependent

**Revisit when:** The two proxy systems are consolidated or if ItemProxy gains consumers outside `@rokkit/ui`.

**Concern:** Moving would add `states → core` dependency chain to `@rokkit/ui` (currently standalone with zero workspace deps).

---

## ~~11. List/Tree — Type-Ahead Search~~ ✅ DONE

`findByText()` on ListController + `typeahead: true` option on navigator action. Enabled for List and Tree. Buffer accumulates, resets after 500ms, wrapping search, skips disabled. See journal 2026-02-24.

---

## ~~28. MultiSelect — Align Value Contract~~ ✅ DONE

`value` is now `unknown[]` (extracted primitives), `selected` is `SelectItem[]` (bindable full items), `onchange` is `(values, items) => void`. Aligned with Select/List/Tree. See journal 2026-02-24.

---

## 46. Learn Site — Story Audit & Update

**Problem:** Some learn site stories still reference deprecated components or are missing.

**Remaining phases:**
- Tree story (deferred)
- Effects stories: Tilt, Shine
- Input stories: Calendar, Range (when components exist)
- Table story (when #47 phases complete)
- Playground integration into learn site

---

## 47. Table — Phases 2-4

**Source:** `docs/requirements/004-table.md`, `docs/design/004-table.md`

**Phase 1 done** (2026-02-23): Core flat table + SearchFilter + sort + selection.

**Remaining phases:**
- [ ] Phase 2: Hierarchy (path-based + multi-column grouping, `groupToHierarchy()`)
- [ ] Phase 3: Pagination (client-side + lazy loading)
- [ ] Phase 4: Polish (sub-component split, named column snippets, accessibility audit, docs)

---

## 49. Documentation Gaps — Requirements & Design Docs

**Problem:** Several implemented components lack requirements and/or design docs.

**What's needed:**
- [ ] Add Rating to `050-feedback.md` (or create dedicated doc)
- [ ] Add Code to requirements (new file or extend existing)
- [ ] Create design docs for components that only have requirements
- [ ] Range requirements (now implemented)

**Priority:** Low — documentation catch-up, not blocking implementation.

---

## ~~50. FloatingNavigation — New Component~~ ✅ DONE

`FloatingNavigation.svelte` in `@rokkit/ui`. Data-driven with ItemProxy, 4-position layouts (left/right/top/bottom), hover expand/collapse, pin toggle, IntersectionObserver tracking, CSS animations, keyboard navigation. Base + 4 theme CSS files. 34 unit tests + playground page. See journal 2026-02-24.

---

## ~~51. Button — Style Enhancements~~ ✅ DONE

Added `gradient` and `link` style variants. Micro-animations (hover lift, press scale, icon shift, loading pulse) in base CSS. Created button CSS for glass/minimal/material themes (previously only rokkit had button theme). Playground updated. See journal 2026-02-24.
