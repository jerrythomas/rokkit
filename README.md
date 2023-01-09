# Rokkit

[![Test Coverage][coverage_badge]][coverage_url]
[![Maintainability][maintainability_badge]][maintainability_url]

![Rokkit](rokkit.svg)

In the world of UI development, there are two main approaches to building components: composition-based and data-driven.

Composition-based components are built by combining smaller, simpler components to form a more complex UI element. This allows developers to reuse code and create modular, flexible designs that are easy to maintain and update. One of the key benefits of this approach is that it allows for a high level of customization and control over the final component.

Data-driven components, on the other hand, are built by binding UI elements to data sources. This allows the component to automatically update and respond to changes in the data, making it easier to build dynamic and reactive interfaces. One of the key benefits of this approach is that it allows developers to focus on the data and logic of their application, rather than the implementation of UI elements.

Ultimately, which approach is best will depend on the needs and goals of your project. Both composition-based and data-driven components have their strengths and limitations, and the right choice for your project will depend on your specific requirements and goals.

Rokkit is a data-driven, configurable, and themeable UI library built for use with Svelte. With Rokkit, you can easily add professional-looking controls to your Svelte projects. Rokkit controls are designed to be easily themeable, so you can match the look and feel of your project with minimal effort.

If you are interested in a composition-based component library checkout [skeleton](https://www.skeleton.dev/)

> Rokkit is currently under development and not feature complete yet. Use it at your own risk.

## Libraries

Components have been separated into the following packages. Refer to the package [stories](sites/skeleton) for examples of all available UI components. View a live demo [here](https://rokkit.vercel.app/components)

- [@rokkit/core](packages/core)
- [@rokkit/input](packages/input)
- [@rokkit/form](packages/form)
- [@rokkit/chart](packages/chart)
- [@rokkit/themes](packages/themes)
- [@rokkit/markdown](packages/markdown)
- [@rokkit/layout](packages/layout)

## Installation

To install Rokkit, use the following command:

```bash
npm install @rokkit/form
```

## Basic Usage

To use Rokkit in your Svelte project, simply import the desired control and use it in your template like any other Svelte component. For example, to use the Button control:

```svelte
<script>
  import { Button } from '@rokkit/form';
</script>

<Button>Click me!</Button>
```

## Data-Driven Controls

One of the key features of Rokkit is its data-driven controls. These controls automatically bind to your data and update their state whenever the data changes. For example, the Checkbox control can be bound to a boolean value in your component's state:

```svelte
<script>
  import { Checkbox } from 'rokkit';

  let checked = false;
</script>

<Checkbox bind:checked={checked}>I agree to the terms and conditions</Checkbox>
```

## Configurable Controls

Rokkit controls are highly configurable, allowing you to customize their appearance and behavior to fit the needs of your project. For example, the Button control has a number of configurable properties, such as type, size, and disabled:

```svelte
<Button type="primary" size="large" disabled>Submit</Button>
```

## Themeable Controls

To apply a theme to your controls, simply pass a theme prop to the root element of your Svelte app:

```svelte
<svelte:options theme="rokkit"/>
```

## Documentation

For more detailed documentation on each control, including a list of all available props and usage examples, please refer to the Rokkit documentation on our [website](rokkit.vercel.app).

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

## Usage

## Quickstart

```bash
degit jerrythomas/rokkit/sites/skeleton my-app
cd my-app
pnpm i
pnpm dev
```

[coverage_badge]: https://api.codeclimate.com/v1/badges/fd3e28efe14760b16f74/test_coverage
[coverage_url]: https://codeclimate.com/github/jerrythomas/rokkit/test_coverage
[maintainability_badge]: https://api.codeclimate.com/v1/badges/fd3e28efe14760b16f74/maintainability
[maintainability_url]: https://codeclimate.com/github/jerrythomas/rokkit/maintainability
