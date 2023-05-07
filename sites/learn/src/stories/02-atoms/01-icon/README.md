---
title: Icon
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

## Customizing Icon Size

The Icon component allows you to easily customize the size of the icon using the `size` prop. The available sizes are `small`, `medium`, `large`, and `base` (default):

```svelte
<Icon name="i-rokkit:mode-dark" size="small" />
<Icon name="i-rokkit:mode-dark" size="medium" />
<Icon name="i-rokkit:mode-dark" size="large" />
```

## Using it as a button

By default, the role is set to `img`, but you can change it to `button` to use it as a button.

```svelte
<Icon name="i-rokkit:mode-dark" role="button" />
```

## Handle Events

To make the Icon component interactive, you can add a click event handler.

```svelte
<script>
  function handleClick() {
    console.log('Icon clicked')
  }
</script>

<Icon name="i-rokkit:mode-dark" role="button" label="Toggle dark mode" on:click={handleClick} />
```

When the icon is clicked, the `handleClick` function will be executed, and the ARIA label will be used for accessibility purposes. The `click` event will be triggered not only when the button is clicked, but also when it is focused and the user presses the `Enter` key.

The Icon component is a versatile and easy-to-use component that allows you to include icons in your application with minimal effort. By using the customization options such as `size`, `role`, and event handling, you can tailor the Icon component to your specific needs.
