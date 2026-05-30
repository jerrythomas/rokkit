export const themeWizardDocs = `## Compose a theme without writing CSS

The Theme Builder is a four-step wizard for composing a Rokkit
preset: pick a style, map roles to palette steps, choose typography,
and preview the result against the running app. Save the preset to
localStorage or export a \`tokens.css\` file you can drop into a
project.

It's both a tool for users assembling their own brand skin AND a
canonical example of how Rokkit's theme tokens compose at runtime.

## The four steps

**01 — Style.** Pick a base style theme (zen-sumi, minimal, material,
frosted, rokkit). Each is a different visual language; the wizard
re-skins everything live as you click. Style selection writes
\`vibe.style\`, which the \`themable\` action picks up to swap the
body's \`data-style\` attribute.

**02 — Skin.** The heart of the wizard. Each *role* (primary,
accent, ink, paper, success, warning, error, info, plus any custom
roles) gets a palette pick and a step within that palette. The wizard
shows a swatch grid per role × palette so you can see how each
combination reads against the active style's surfaces.

**03 — Typography.** Pick the display, UI, and mono font families.
The wizard previews each sample against the chosen style — useful
for catching legibility issues before committing.

**04 — Preview.** Render a representative set of components
(buttons, inputs, surfaces, list items) against the composed
preset. This is the final read before saving.

## Save vs. Export

- **Save preset** writes the current role-step map to localStorage
  under a named key. Re-applying the preset reads that key and
  pushes the values back into the \`vibe\` store.
- **Export tokens.css** generates a self-contained CSS file —
  paste it into a project to apply the same look without depending
  on the live wizard.

## Apply a saved preset at runtime

\`\`\`ts
import { vibe } from '@rokkit/states'

vibe.setSkin('my-brand')    // skin (palette role-steps)
vibe.setStyle('zen-sumi')   // style theme (visual language)
vibe.setMode('dark')        // light | dark
vibe.setDensity('compact')  // compact | cozy | spacious
\`\`\`

The wizard's "Save preset" button is the GUI equivalent of those
four \`vibe.*\` setters.

## Why role-step instead of raw colours?

Rokkit themes don't bake hex codes into components. Each component
references a *role* (e.g. \`--color-primary\`, \`--color-ink-z1\`); the
theme resolves that role to a *step* in a chosen palette. This
double indirection means:

- Themes can be re-coloured by swapping the palette, not editing
  every component.
- Mode (light/dark) just flips the z-scale direction without
  rewriting tokens.
- Accessibility contrast can be enforced at the role-step layer,
  not per-component.

## Built on the trimmed token vocabulary

The wizard works against the \`tokens: 'core'\` vocabulary released
in May 2026 — ~40 named CSS variables per skin (down from ~120 in
the legacy "extended" mode). The smaller surface makes themes
easier to author by hand AND keeps the wizard's role list short
enough to fit on one screen.
`
