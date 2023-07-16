# Rokkit

[![Test Coverage][coverage_badge]][coverage_url]
[![Maintainability][maintainability_badge]][maintainability_url]

![Rokkit](rokkit.svg)

Rokkit is a data-driven, configurable, and themeable UI library built for use with Svelte. Rokkit controls are designed to be easily themeable, so you can match the look and feel of your project with minimal effort.

Rokkit provides both composable and data-driven components.

- The Composition-based components allow developers to reuse code and create modular, flexible designs that are easy to maintain and update.
- Data-driven components, make it easier to build dynamic and reactive interfaces. One of the key benefits of this approach is that it allows developers to focus on the data and logic of their application, rather than the implementation of UI elements.

> Rokkit is currently under development and not feature complete yet.

## Libraries

Components have been separated into the following packages. Refer to the package [stories](sites/rokkit) for examples of all available UI components. View a live demo [here](https://rokkit.vercel.app/)

- [@rokkit/core](packages/core)
- [@rokkit/input](packages/input)
- [@rokkit/form](packages/form)
- [@rokkit/chart](packages/chart)
- [@rokkit/themes](packages/themes)
- [@rokkit/layout](packages/layout)

## Installation

To install Rokkit, use the following command:

```bash
npm install @rokkit/core
```

## Basic Usage

To use Rokkit in your Svelte project, simply import the desired control and use it in your template like any other Svelte component. For example, to use the List control:

```svelte
<script>
  import { List } from '@rokkit/core'
</script>

<List items={['a', 'b', 'c']} />
```

## Data-Driven Controls

One of the key features of Rokkit is its data-driven controls. These controls automatically bind to your data and update its state whenever the data changes. All data-driven components follow a consistent pattern. Selection components that work on arrays have an `items` property and all components have a `value` property that has the current value.

```svelte
<script>
  import { List } from '@rokkit/core'

  let items = ['a', 'b', 'c']
  let value
</script>

<List {items} bind:value />
```

## Themeable Controls

To apply a theme to your controls, simply pass a theme prop to the body element.

```svelte
<svelte:body class="rokkit dark" />
```

If you want to provide users the option of switching between dark theme and light mode or custom themes, then you can also use the `themable` action with the `ThemeSwitcher` component.

```svelte
<script>
  import { themable } from '@rokkit/core/actions'
  import { ThemeSwitcher } from '@rokkit/core'

  let themes = [
    { title: 'Rokkit', name: 'rokkit' },
    { title: 'Modern', name: 'modern' }
  ]
</script>

<svelte:body use:themable />
<ThemeSwitcher {themes} />
```

## Documentation

For more detailed documentation on each control, including a list of all available props and usage examples, please refer to the Rokkit documentation on our [website](https://rokkit.vercel.app).

We hope you enjoy using Rokkit in your projects!

## Features

- [x] Data-driven
- [x] Headless
- [x] Actions
- [x] Utility functions
- [x] Themes
- [ ] Responsive
- [ ] Micro-animations
- [ ] Accessible

## Quickstart

```bash
degit jerrythomas/rokkit/sites/rokkit my-app
cd my-app
pnpm i
pnpm dev
```

[coverage_badge]: https://api.codeclimate.com/v1/badges/fd3e28efe14760b16f74/test_coverage
[coverage_url]: https://codeclimate.com/github/jerrythomas/rokkit/test_coverage
[maintainability_badge]: https://api.codeclimate.com/v1/badges/fd3e28efe14760b16f74/maintainability
[maintainability_url]: https://codeclimate.com/github/jerrythomas/rokkit/maintainability
