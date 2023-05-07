---
title: Field Mapping
---

The Item component allows you to provide field mappings using the `fields` prop. These mappings enable you to customize the attributes it uses to the content from the provided value.

Here's an example of how to use field mappings:

```svelte
<script>
  let value = {
    name: 'A Heart Icon',
    symbol: 'i-rokkit:heart-filled'
  }
  let fields = {
    text: 'name',
    icon: 'symbol'
  }
</script>
<Item {value} {fields} />
```

> Note that the component only renders the icon, image & text, but does not put a wrapper element around it. In the preview, we have used an item tag to wrap the `Item` component. This `item` tag is used as a wrapper around the contents.

The flexibility of field mapping and the ability to render various combinations of text, icons, and images make this component the default item renderer for many of the data-driven components.
