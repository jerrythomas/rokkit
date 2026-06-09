# Toolchain

`@rokkit/cli` is the canonical way to set up a Rokkit project,
upgrade between versions, and generate scaffolding. Manual setup
works but tends to drift — the CLI keeps the moving parts
(UnoCSS config, theme imports, `data-style` attribute) in sync.

## init — bootstrap a project

```bash
npx @rokkit/cli@latest init
```

The init command is interactive. It prompts for:

- **Colour palette** — `default` (orange / pink / sky),
  `vibrant` (blue / purple / sky), `seaweed` (sky / green /
  blue), or `custom` (you pick the Tailwind palette names per
  role).
- **Icon collection** — Rokkit's built-in collection, or
  Rokkit plus a custom collection JSON.
- **Theme styles** (multi-select) — `rokkit`, `minimal`,
  `material`, `frosted`, `zen-sumi`. Pick one or more; the CLI
  sets up the import and the `data-style` attribute for the first.
- **Theme switching** — `system` (prefers-color-scheme),
  `manual` (light / dark toggle), or `full` (both light/dark
  and style variants).

Files written: `rokkit.config.js`, `uno.config.js`,
`src/app.css`, `src/app.html`.

## doctor — verify & fix

```bash
npx @rokkit/cli@latest doctor
```

Walks the project and reports drift between what `init` would
produce and what's currently committed — missing UnoCSS preset,
unfilled `data-style` attribute, missing theme imports, etc.
`--fix` re-applies the corrections in place.

## upgrade — between Rokkit versions

```bash
npx @rokkit/cli@latest upgrade
```

Reads your `rokkit.config.js`, checks the registry for newer
`@rokkit/*` packages, and bumps your `package.json` in lockstep.
Reports breaking-change notes inline so you know what to
hand-merge.

## skin — list and create skins

```bash
npx @rokkit/cli@latest skin list    # list skins defined in rokkit.config.js
npx @rokkit/cli@latest skin create  # scaffold a new skin entry (--name <name>)
```

The `skin create` command walks you through picking palette and
step per role for each mode (light / dark), then adds the new
skin entry to your `rokkit.config.js`.

## theme — list and scaffold styles

```bash
npx @rokkit/cli@latest theme list    # list built-in and custom themes
npx @rokkit/cli@latest theme create  # scaffold a new custom theme CSS file (--name <name>)
```

`theme create` produces a stub CSS file with all the
data-attribute selectors components target, pre-filled with
comments. Override the visual recipe (border-radius, shadows,
surface treatments); the data-attribute structure stays the same.

## skills — install AI skill guides

```bash
npx @rokkit/cli@latest skills list          # list available Rokkit AI skills
npx @rokkit/cli@latest skills add           # interactive: pick skills to install
npx @rokkit/cli@latest skills add --all     # install all available skills
npx @rokkit/cli@latest skills add --force   # overwrite already-installed skills
```

The `skills add` command installs bundled `SKILL.md` guides into
`.claude/skills/` so Claude Code can pick up Rokkit-specific
workflows (new-component patterns, theme authoring, etc.) as
local skills in your project.

## CLI reference

For the full command surface (flags, advanced options, exit
codes) see the
[CLI reference llms.txt](/llms/cli.txt) which the demo also
ships at the same path.

## Editor / build integration

- **UnoCSS preset** — `@rokkit/unocss` adds Rokkit's semantic
  token shortcuts (`bg-paper-soft`, `text-ink-mute`, etc.) plus
  the preflight CSS variables.
- **`@rokkit/vite`** — optional Vite plugin that auto-imports
  the configured icon collection JSON.
- **`skinnable`** (from `@rokkit/actions`) — Svelte action for
  components that want to set their own `data-style` instead
  of inheriting from `<html>`.

## Icon collections

`@rokkit/icons` ships a curated default collection
(`@iconify-json/glyph`). Swap it in your unocss config:

```js
import { presetIcons } from '@unocss/preset-icons'

export default {
  presets: [
    presetIcons({
      collections: {
        glyph: () => import('@iconify-json/mdi/icons.json').then(m => m.default)
      }
    })
  ]
}
```
