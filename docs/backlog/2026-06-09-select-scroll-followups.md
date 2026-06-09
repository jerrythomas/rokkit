# Select Scroll — Follow-ups (PageUp/PageDown + e2e)

**Date:** 2026-06-09
**Status:** Backlog — small, follow-up to a resolved regression
**Site Applicability:** Library work in `@rokkit/ui` Select + Navigator; e2e lives in `apps/learn` Playwright.

## Summary

The Select scroll **regression** is resolved (see `done/2026-05-20-select-scroll-regression-and-lab.md`:
`291c5f38` + `cb32f722`). Two always-stretch deliverables from that item were never
built and are carried here as a small, self-contained follow-up. Virtualization and a
dedicated `/app/select/lab` page were also deferred but are explicitly out of scope below.

## Scope

### 1. PageUp / PageDown keyboard navigation

The Navigator only binds `Home`/`End` (`packages/actions/src/nav-constants.js` — verify path)
for jump navigation; `PageUp`/`PageDown` are unbound. Add them so long dropdowns/lists can be
paged with the keyboard.

- Add `PageUp` / `PageDown` to the Navigator key map alongside `Home`/`End`.
- Behaviour: move focus by a "page" (a sensible fixed step, e.g. 10 items, or the number of
  fully-visible rows if cheaply derivable) — clamped to first/last. Reuse the existing
  `#scrollItemIntoView` so focus stays within the scroll container (no ancestor scroll).
- Applies anywhere the Navigator drives list nav (List, Tree, Select, MultiSelect, Menu).
- Unit tests in `packages/ui` (or `packages/actions`) asserting focus moves by a page and
  clamps at the ends.

### 2. Playwright e2e for Select scroll behaviour

The regression fix currently has **no automated guard** — JSDOM unit tests can't exercise
`scrollTop`/`offsetTop`. Add Playwright coverage (in `apps/learn`) for a long (~20+ item)
Select:

- Arrow-key navigation scrolls the focused item into view **without** scrolling the page/body.
- Opening with a pre-selected item near the end scrolls that item into view inside the dropdown.
- Mouse-wheel over the open dropdown does not close it and does not scroll the page.
- (If §1 ships) PageUp/PageDown jump works.

A minimal long-list Select route may be needed as an e2e fixture; keep it tiny (not the full
"lab page" the original item imagined).

## Out of scope

- 100+ item **virtualization/windowing** (separate performance effort if ever needed).
- The full multi-variant `/app/select/lab` showcase page (drop unless a real need appears).

## Deliverable

`PageUp`/`PageDown` Navigator bindings + unit tests, and Playwright e2e guarding Select scroll
behaviour. Ships on the normal patch cadence.
