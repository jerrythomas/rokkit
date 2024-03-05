# Contributing

Rokkit is a monorepo using [pnpm workspaces](https://pnpm.io/workspaces) for easier organization.

## Packages

| Package                         |
| ------------------------------- |
| [core](packages/core)           |
| [actions](packages/actions)     |
| [stores](packages/stores)       |
| [atoms](packages/atoms)         |
| [molecules](packages/molecules) |
| [organisms](packages/organisms) |
| [layout](packages/layout)       |
| [icons](packages/icons)         |
| [themes](packages/themes)       |
| [ui](packages/ui)               |

## Sites

| Site                             |
| -------------------------------- |
| [learn](sites/learn)             |
| [quick-start](sites/quick-start) |

## Clone or Fork the Project

```sh
git clone https://github.com/jerrythomas/rokkit.git
```

## Install Dependencies

If you run this at the root of your project it's going to install the dependecies for every package.

```sh
pnpm i
```

## Docs (Learn Site)

The docs use [SvelteKit](https://kit.svelte.dev/) but you don't have to know SvelteKit to contribute. If you find a mistake you can use the GitHub UI or the web editor if you press `.` in the browser for quick edits.

```sh
cd sites/learn
pnpm dev
```

This is going to start the development server for the docs at http://localhost:5173/.
