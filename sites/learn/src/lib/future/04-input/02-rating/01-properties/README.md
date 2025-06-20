---
title: Introduction
---

An input to provide rating values. Recommended for use when values are less than 10. For larger values, use the range slider component.

## Properties

- _id_ : A unique identifier for the rating input
- _name_ : A name to be used for the rating input in the form
- _value_ : Current rating value
- _max_ : Maximum value allowed. Default value is 5.
- _stateIcons_: Default uses empty and filled stars, however custom icons can be provided.
- _class_ : Set custom class for style overrides

# Rating Component Tutorial

This tutorial will guide you through using and customizing the Rating component. The Rating component is a versatile and accessible component that allows users to rate content by clicking or tapping on stars, hearts, or other customizable icons.

## 1. Using the Rating Component

To use the Rating component, you can import it and include it in your Svelte component as follows:

```svelte
<script>
  import Rating from './Rating.svelte'
</script>

<Rating value={3} max={5} />
```

This will render a Rating component with a default value of 3 out of 5 stars.

## 2. Accessibility

The Rating component is built with accessibility in mind. The component uses ARIA roles and attributes to convey information about the rating to assistive technologies such as screen readers.

Each icon has a `role` attribute set to `"checkbox"` and a `checked` attribute set to `true` or `false`, depending on whether the icon is selected or not. Additionally, each icon has an `aria-label` attribute to provide a textual description of the icon's purpose.

The component also supports keyboard interactions, including arrow key navigation, and number key selection.

## 3. Customizing Icons

By default, the Rating component uses star icons. However, you can easily customize the icons to use hearts, thumbs up, or any other icon of your choice. To do this, you can modify the `stateIcons` prop to provide your own icons. For example, to use heart icons, you can do the following:

```svelte
<script>
  import Rating from './Rating.svelte'
</script>

<Rating
  value={3}
  max={5}
  stateIcons={{
    filled: 'heart_filled',
    empty: 'heart_empty'
  }}
/>
```

In this example, `heart_filled` and `heart_empty` are the names of the filled and empty heart icons, respectively. You can replace these with your own custom icons.

That's it! Now you know how to use and customize the Rating component in your Svelte application. With its accessibility features and customizable icons, the Rating component is a versatile and user-friendly way to allow users to rate content.
