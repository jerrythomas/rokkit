---
title: Basic Usage
---

We will learn about the versatile `Item` component that can render various content types, including text, icon, state-based icon, or an image along with text. This component accepts a string or an object as a value and an optional `fields` prop for field mapping.

## Rendering Different Content Types

### Simple Text

To render a simple text item, pass a string as the `value` prop:

```svelte
<Item value="Sample Text" />
```

### Icon and Text

To render an icon and text, pass an object with properties icon and text as the value prop:

```svelte
<Item value={{ text: 'A Sun Icon', icon: 'i-rokkit:mode-light-solid' }} />
```

### Image and Text

To render text along with an image, provide an object containing the text and image fields:

```svelte
<script>
  let value = {
    text: 'John Doe',
    image:
      'https://unsplash.com/photos/mjRwhvqEC0U/download?ixid=MnwxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNjgzMzU3Nzcy&force=true&w=200'
  }
</script>

<Item {value} />
```

> Note that the component only renders the icon, image & text, but does not put a wrapper element around it. In the preview, we have used an item tag to wrap the `Item` component. This `item` tag is used as a wrapper around the contents.
