---
title: As a button
---

By default, the role is set to `img`, but you can change it to `button` to use it as a button.

```svelte
<Icon name="i-rokkit:mode-dark"
      role="button" />
```

## Handle Events

To make the Icon component interactive, you can add a click event handler.

```svelte
<script>
  function handleClick() {
    console.log('Icon clicked')
  }
</script>

<Icon name="i-rokkit:mode-dark"
      role="button"
      label="Toggle dark mode"
      onclick={handleClick} />
```

When the icon is clicked, the `handleClick` function will be executed, and the ARIA label will be used for accessibility purposes. The `click` event will be triggered not only when the button is clicked, but also when it is focused and the user presses the `Enter` key.

The Icon component is a versatile and easy-to-use component that allows you to include icons in your application with minimal effort. By using the customization options such as `size`, `role`, and event handling, you can tailor the Icon component to your specific needs.
