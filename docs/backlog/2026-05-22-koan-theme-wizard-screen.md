# Koan: Theme Wizard Screen (mockup C4)

**Date:** 2026-05-22
**Status:** Backlog
**Parent:** Stage C — Koan demo rebuild (completed for screens 1/2/3 + landing)

## Summary

Implement the fourth composer screen from the design mockup: the theme wizard mounted as a `ChatResponse` artifact on the canvas. Triggered by queries about theming (e.g., "theme to my brand"). Existing wizard logic lives in `demo/src/lib/koan/demos/theme-wizard/` from the pre-rebuild Koan; needs to be wired into the new chat-shell.

## Source

- Mockup: `docs/mockups/project/rokkit-composer.jsx`, `WizardBody` function
- Existing wizard: `demo/src/lib/koan/demos/theme-wizard/{index,StepStart,StepTheme,StepTune,StepSave,PreviewPane}.svelte`

## Scope

### Chat-left content (response phase, theme-wizard variant)

Stream of messages:
- **YOU** — user query (e.g., "Theme for our brand red")
- **STARTED** info — "Opened the theme wizard on the canvas. Step 02 — Skin — is active. Each role on the left can pick its palette and step. Mode-aware: light + dark share roles, swap palette steps."
- **GLOSSARY** info — bulleted list:
  - Palette — a 50→950 color scale
  - Skin — roles (paper, ink, accent…) mapped to a palette + step. Dual-mapped possible.
  - Style — thematic character (zen-sumi underline, rokkit block, minimal, material)
  - Density — padding rhythm, chrome-wide attribute
- **Chips** — "← previous step", "next step → typography", "export tokens.css"

### Canvas content

`ChatResponse` with:
- name: `<ThemeWizard/>`
- meta: `· step 02 · skin`
- kicker: `WIZARD`
- propsRow: `style {style} · palette warm-gray + shu · dual-mode yes`
- actions: `Save preset` / `Export tokens.css` / `Preview live`

Wizard body (inside the response card):
- Horizontal stepper: `01 Style (done) → 02 Skin (active) → 03 Typography → 04 Preview & export`
- **Palettes in this skin** section — 4-column grid of palette swatch cards. "IN USE" badge on the first two. Each card shows the palette name + 5 swatches (50/200/500/700/950) + shade labels.
- **Roles · light/dark mapping** section — a table with columns: Role / Light palette + step / Dark palette + step. Roles: `paper`, `paper-2`, `paper-3`, `edge`, `ink`, `ink-2`, `accent`. Each cell shows a palette name pill, the 11-step ramp with the selected step outlined, and the step label (e.g., `·100`). Other-mode cells dim to 55% opacity.

### State machine update

`demoType: 'tabs' | 'theme-wizard' | null`

Match logic to detect theme-related queries — keywords like "theme", "skin", "palette", "brand" route to `demoType: 'theme-wizard'`.

## Files to touch

- `demo/src/routes/app/+page.svelte` — add `theme-wizard` branch to chat-left + canvas response phase rendering.
- `demo/src/lib/koan/demos/theme-wizard/` — either:
  - **Reuse** the existing component tree (StepStart/StepTheme/StepTune/StepSave) by mounting it inside the new ChatResponse, OR
  - **Rewrite** as a simpler step-2-only display (the mockup only shows step 2; the existing wizard has 4 steps but the design only needs the skin step rendered).
  
  Recommendation: build a new lighter wizard-display component for the response card. Real wizard interaction can be a follow-up.
- Possibly a `PaletteStepPicker` primitive in `demo/src/lib/chat/components/` or `demo/src/lib/koan/components/` if reusable for other screens.

## Out of scope

- Real save/export flows (the modal exists in the pre-rebuild Koan; not a priority for the chat-shell rebuild)
- Full wizard navigation (the mockup only shows step 2 — implement that as a static display first)

## Realistic cost

~3 hours including the role-mapping table grid + palette swatch rendering. Less if we reuse existing PaletteStepPicker-like work; more if we want fully interactive role picking.
