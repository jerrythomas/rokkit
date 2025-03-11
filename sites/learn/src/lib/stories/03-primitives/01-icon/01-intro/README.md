---
title: Introduction
---

The Icon component in our library is designed to be easy to use and customizable, allowing you to include icons in your application with minimal effort. In this tutorial, we will learn how to use the Icon component and explore its customization options.

## Basic Usage

To use the Icon component, simply import it and provide the `name` prop, which should correspond to the name of the icon you want to display.

```svelte
<Icon name="i-rokkit:mode-dark" />
```

This will render the dark mode icon from the Rokkit icon set. Make sure to include the appropriate icon set in your project.

## Accessibility Label

You can set the `aria-label` for the icon using the label property.

```svelte
<Icon name="i-rokkit:mode-dark" label="Toggle Dark Mode" />
```

## Custom Classes

You can set custom class for the icon using the class property.

```svelte
<Icon name="i-rokkit:mode-dark" class="text-secondary" />
```
