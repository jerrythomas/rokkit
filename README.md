# Rokkit

[![Test Coverage][coverage_badge]][coverage_url]
[![Maintainability][maintainability_badge]][maintainability_url]

![Rokkit](rokkit.svg)

Rokkit is a data-driven, configurable, and themeable UI library built for use with Svelte. Rokkit controls are designed to be easily themeable, so you can match the look and feel of your project with minimal effort.

Rokkit provides both composable and data-driven components.

- The Composition-based components allow developers to reuse code and create modular, flexible designs that are easy to maintain and update.
- Data-driven components, make it easier to build dynamic and reactive interfaces. One of the key benefits of this approach is that it allows developers to focus on the data and logic of their application, rather than the implementation of UI elements.

> Rokkit is currently under development and not feature complete yet.
> Rokkit has been rewritten to use Svelte 5 runes
> Some components are yet to be rewritten

## Libraries

Components have been separated into the following packages. Refer to the [stories](sites/learn/lib/stories) for examples of all available UI components. View a live demo [here](https://rokkit.vercel.app/)

- [@rokkit/core](packages/core)
- [@rokkit/data](packages/data)
- [@rokkit/actions](packages/actions)
- [@rokkit/states](packages/states)
- [@rokkit/icons](packages/icons)
- [@rokkit/themes](packages/themes)
- [@rokkit/ui](packages/ui)

## Installation

To install Rokkit, use the following command:

```bash
degit jerrythomas/rokkit/sites/quick-start my-app
pnpm i
```

## Basic Usage

To use Rokkit in your Svelte project, simply import the desired control and use it in your template like any other Svelte component. For example, to use the List control:

```svelte
<script>
  import { List } from '@rokkit/ui'
  let items = $state(['a', 'b', 'c'])
</script>

<List bind:items />
```

## Data-Driven Controls

One of the key features of Rokkit is its data-driven controls. These controls automatically bind to your data and update its state whenever the data changes. All data-driven components follow a consistent pattern. Selection components that work on arrays have an `items` property and all components have a `value` property that has the current value.

```svelte
<script>
  import { List } from '@rokkit/ui'

  let items = $state(['a', 'b', 'c'])
  let value = $state(null)
</script>

<List bind:items bind:value />
```

## Themeable Controls

To apply a theme to your controls, simply pass a theme prop to the body element.

```svelte
<svelte:body data-style="rokkit" data-mode="dark" />
```

If you want to provide users the option of switching between dark theme and light mode or custom themes, then you can also use the `themable` action with the `ToggleThemeMode` component.

```svelte
<script>
  import { themable } from '@rokkit/actions'
  import { ToggleThemeMode } from '@rokkit/ui'
</script>

<svelte:body use:themable />
<ToggleThemeMode />
```

## Documentation

For more detailed documentation on each control, including a list of all available props and usage examples, please refer to the Rokkit documentation on our [website](https://rokkit.vercel.app).

We hope you enjoy using Rokkit in your projects!

## Features

- [x] Data-driven
- [x] Unstyled
- [x] Actions
- [x] Utility functions
- [x] Themes
- [ ] Accessible
- [ ] Responsive
- [ ] Micro-animations

## Quickstart

```bash
degit jerrythomas/rokkit/sites/quick-start my-app
cd my-app
pnpm i
pnpm dev
```

[coverage_badge]: https://api.codeclimate.com/v1/badges/fd3e28efe14760b16f74/test_coverage
[coverage_url]: https://codeclimate.com/github/jerrythomas/rokkit/test_coverage
[maintainability_badge]: https://api.codeclimate.com/v1/badges/fd3e28efe14760b16f74/maintainability
[maintainability_url]: https://codeclimate.com/github/jerrythomas/rokkit/maintainability
