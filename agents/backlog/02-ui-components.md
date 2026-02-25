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

## 50. FloatingNavigation — New Component

**Source:** `docs/requirements/009-navigation.md §6`, `docs/design/009-floating-navigation.md`

**What's needed:**
- [ ] `FloatingNavigation.svelte` in `@rokkit/ui` — data-driven with ItemProxy
- [ ] Position on any screen edge (left, right, top, bottom)
- [ ] Collapsed state: icon-only; expands on hover to show text labels
- [ ] Pin toggle to lock expanded state
- [ ] IntersectionObserver for automatic active section tracking
- [ ] CSS animations: entrance slide-in, expand/collapse, label fade, active indicator, item hover, stagger
- [ ] Keyboard: arrow navigation, Enter/Space to activate, Escape to collapse
- [ ] Base + 4 theme CSS
- [ ] Unit tests + playground page

---

## 51. Button — Style Enhancements

**Source:** `docs/requirements/001-button.md §6`

**What's needed:**
- [ ] Add `gradient` style variant (`data-style="gradient"`)
- [ ] Add `link` style variant (`data-style="link"`)
- [ ] Standardize micro-animations across all themes: press, hover lift, focus ring, icon shift, loading pulse
- [ ] Theme-specific enhancements: glass backdrop, material ripple, minimal border
- [ ] Update Button.svelte + base/button.css + all 4 theme CSS files
