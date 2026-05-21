# Select Scroll Handling — Regression Investigation + Lab Page

**Date:** 2026-05-20
**Status:** Backlog — important; investigate before fixing

## Summary

Roughly a month ago, a fix to the Select component's dropdown visibility (items overflowing other elements) introduced a regression in scroll handling. Scroll behavior in long dropdowns is now broken in a way that wasn't there before.

Before patching, we need to:
1. Reproduce the regression precisely and identify the offending commit.
2. Build a **Select lab page** that demonstrates multiple proposed scroll-handling approaches side-by-side, so we can evaluate options before settling on a fix.
3. Consider whether the right move is to fix in place OR rewrite Select to share more with `Menu` (which has cleaner scroll handling).

## Symptoms (to verify)

- [ ] Scroll into view when navigating with arrow keys past the visible window
- [ ] Scroll position preservation across open / close
- [ ] Wheel scroll inside dropdown not bubbling to body
- [ ] Active item scroll on initial open
- [ ] Keyboard PageUp/PageDown
- [ ] Long lists (100+ items) virtualization or windowing behavior

Confirm which of these are broken, which are working, before scoping the fix.

## Investigation steps

1. **Find the offending commit.** Search `git log packages/ui/src/components/Select.svelte` since 2026-04-15. Look for commits touching dropdown overflow, z-index, portal, or scroll.
2. **Reproduce in isolation.** Build a minimal repro on the Select lab page (see below).
3. **Compare with Menu.** Menu has the same scroll concerns but reportedly behaves correctly. What's different in its implementation?

## Select Lab Page

New route (location TBD — `site/learn/playground/select-lab` or `demo/select-lab`) with side-by-side variants of Select rendering the same long list:

- **A — Current Select** (with the regression) — control
- **B — Select using Menu's scroll approach** — port Menu's behavior to Select
- **C — Native `<select>` for comparison** — baseline reference
- **D — Select with explicit `scrollIntoView({ block: 'nearest' })`** — minimal-change fix
- **E — Select with windowing (only render visible + buffer)** — for very long lists

Each variant gets the same data (200-item list with grouping). Test cases per variant:

- Keyboard down past visible window — does the focused item scroll into view smoothly?
- Open dropdown — does it scroll to selected item?
- Wheel scroll inside — does it stop at boundaries or bleed to body?
- PageDown / Home / End — does focus move and scroll correctly?
- Resize window — does the dropdown re-position correctly?

## Possible outcomes

1. **Patch in place** — if the regression is a one-liner, just fix it. Lab page becomes a regression test.
2. **Adopt Menu's pattern** — port the working behavior from Menu to Select.
3. **Rewrite Select to share with Menu** — extract a `Popover`/`Listbox` primitive that both consume. Bigger refactor but cleanest long-term.
4. **Add MultiSelect alignment** — if Select is rewritten, MultiSelect should follow the same pattern.

## Out of scope

- Changing Select's external API.
- Touching Combo / MultiSelect this round (they may piggyback after).

## Deliverable

- Identified root-cause commit
- Working Select lab page with at least variants A, B, D
- Recommendation memo (which fix, why, what it costs)
- The fix itself follows as a separate PR
