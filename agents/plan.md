# Active Plan: Fix Issues from docs/issues/001.md

## Context

Forms Phase 2 is complete (commit `7af488f8`). All playground pages converted to FormRenderer, old controls deleted, archive/deprecated cleaned up. User wants to prioritize the reported issues before any new feature work.

## Steps

### Bug Fixes (High Priority)

- [ ] 1. **Input text value binding bug** — value changes to `[Object Event]` on edit. Fix the oninput/onchange handler in InputText to pass `event.target.value` not the event object.
- [ ] 2. **Menu first item always highlighted** — Menu should not pre-highlight any item on open since it doesn't track active selection.
- [ ] 3. **Button icon select extra thick border on empty value** — empty string option in Select causes rendering issue. Fix the empty item handling.

### Style Fixes

- [ ] 4. **input-root border 2px → 1px** — `[data-input-root]` wrapping Select has 2px border, should be 1px to match inputs.
- [ ] 5. **Input/Select height and font-size mismatch** — Input text has larger height/font than Select; they should match.
- [ ] 6. **Button Danger text invisible in dark mode** — fix text color for danger variant in dark mode.
- [ ] 7. **Minimal theme underline style** — rework minimal input-root: no padding, underline only, `::after` gradient underline on focus, smaller label, matched heights.
- [ ] 8. **Material theme outlined floating label** — implement Material Design text field pattern with outline border and floating label.

### Icons

- [ ] 9. **Add menu-closed/menu-opened icon aliases** — copy lucide chevron-right as menu-closed, chevron-down as menu-opened, update icon bundles.
