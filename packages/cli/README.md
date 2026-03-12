# @rokkit/cli

CLI for Rokkit — SVG icon bundling, Iconify JSON package generation, project initialization, and setup validation.

## Install

```bash
# Install globally
bun add -g @rokkit/cli

# Or run without installing
bunx @rokkit/cli <command>
npx @rokkit/cli <command>
```

The binary is available as `rokkit`.

## Commands

### `rokkit bundle`

Scan SVG subfolders and output one Iconify-compatible JSON file per folder.

```bash
rokkit bundle -i ./src/icons -o ./lib
```

Each subfolder under `--input` becomes a separate JSON bundle in `--output`. Useful for splitting icon sets by category (ui, solid, auth, etc.).

### `rokkit build`

Build a full Iconify JSON package for each icon subfolder.

```bash
rokkit build -i ./src/icons -o ./lib
```

Similar to `bundle` but produces the complete Iconify package structure (with `prefix`, `icons`, `width`, `height`). Use this when publishing icons as a standalone package.

### `rokkit init`

Initialize Rokkit in an existing SvelteKit project.

```bash
rokkit init
```

Interactively sets up `uno.config.ts` with `presetRokkit()`, installs required packages, and configures the project for Rokkit.

### `rokkit doctor`

Validate that a Rokkit project is correctly configured.

```bash
# Check setup
rokkit doctor

# Check and auto-fix safe issues
rokkit doctor --fix
```

Checks for correct UnoCSS config, theme imports, and required package presence. `--fix` applies automatic repairs where safe to do so.

## Global Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--input` | `-i` | Source folder containing SVG subfolders | `./src` |
| `--output` | `-o` | Output folder for generated files | `./lib` |
| `--config` | `-c` | Path to config file (relative to input) | `config.json` |

## Configuration File

Place a `config.json` inside the input folder to control icon processing:

```json
{
  "package": {
    "namespace": "@my-org",
    "version": "1.0.0",
    "homepage": "https://github.com/my-org/my-icons"
  },
  "ui": {
    "color": false
  },
  "brand": {
    "color": true
  }
}
```

| Field | Description |
|-------|-------------|
| `package.namespace` | Iconify collection prefix namespace |
| `package.version` | Published version string |
| `package.homepage` | Repository or homepage URL |
| `<set>.color` | `true` preserves original colors; `false` converts fills to `currentColor` |

## Examples

```bash
# Bundle icons from src/ into lib/
rokkit bundle -i src -o lib

# Build full Iconify packages with a custom config
rokkit build -i src -o lib -c my-config.json

# Use with bunx (no global install needed)
bunx @rokkit/cli bundle -i ./icons -o ./dist
```

## Icon Folder Layout

```
src/
  ui/
    menu.svg
    close.svg
  solid/
    check.svg
    x.svg
  auth/
    login.svg
```

Running `rokkit build -i src -o lib` produces:

```
lib/
  ui.json
  solid.json
  auth.json
```

---

Part of [Rokkit](https://github.com/jerrythomas/rokkit) — a Svelte 5 component library and design system.
