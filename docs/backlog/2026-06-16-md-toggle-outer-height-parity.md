# Toggle `md` Outer-Height Parity With Inputs

**Date:** 2026-06-16
**Status:** Backlog — small design refinement, deferred
**Site Applicability:** Library work in `@rokkit/ui` Toggle + `@rokkit/themes` `base/toggle.css`.

## Summary

The Toggle is a *grouped* control: a pill **container** (`[data-toggle]`, `padding: 0.25rem`
+ 1px border) wrapping the **options** (`[data-toggle-option]`). The option height already
tracks the shared control-height scale (`--control-h-{sm,md,lg}` = 28 / 36 / 44px), so at
`size="md"` an option is **36px** — matching inputs, selects, and buttons.

But because of the container padding + border, the toggle's **outer box** at `md` is ~**46px**
— ~10px taller than a 36px input. So:

- **Option-height parity** with other controls: ✅ already true (option = `control-h-md`).
- **Outer-box parity** (a toggle sitting flush next to a 36px input/select in a toolbar or
  form row): ❌ the toggle is taller by its container chrome.

Found while making the learn site header toggles compact (`sm`, 28px) — the theme-switcher /
density toggles (commit `2d8a509f`). Not blocking; the header uses `sm` deliberately.

## Scope

Make a `md` (and `sm`/`lg`) Toggle's **outer** height equal the matching `--control-h-*`
token, so it lines up edge-to-edge with inputs/selects in a row:

- Pin the container height to `var(--control-h-{size})` and let the options **inset** within
  it (container owns the height; options fill it minus a small pad), rather than
  `option-height + container-padding` driving the outer box.
- Preserve the inset "pill" look (the active fill shouldn't touch the container edge).
- Keep the icon-only square behaviour (option `min-width` = option height) intact.
- Verify across all five styles (the pill container chrome differs per theme) and both modes.

## Out of scope

- Changing the control-height token values themselves (28/36/44 stay).
- The header `sm` toggles — they intentionally stay compact; this is about default/`md`
  parity in body/toolbar contexts.

## Deliverable

`base/toggle.css` (and any per-theme container rules) adjusted so a Toggle's outer height
equals `--control-h-{size}`, with the options inset — verified next to a same-size input.
Ships on the normal patch cadence.
