---
title: Removable
---

To create a removable ItemWrapper, set the `removable` prop to `true`. This will add a remove icon to the ItemWrapper, and when clicked, it will emit a `remove` event that you can handle to perform the actual remove action:

```svelte
<script>
  let items = [
    { text: 'Sample Removable 1' },
    { text: 'Sample Removable 2' },
    { text: 'Sample Removable 3' }
  ]

  function handleRemove(index) {
    items.splice(index, 1)
    items = [...items]
  }
</script>

{#each items as item, index}
  <ItemWrapper value={item.text} removable={true} on:remove={() => handleRemove(index)} />
{/each}
```

## Customizing Removable Appearance

The ItemWrapper component can utilize the Item component's features for rendering different content types. To customize the appearance of the ItemWrapper, pass an object containing the desired fields to the `value` prop:

```svelte
<ItemWrapper value={{ text: 'Sample Item', icon: 'i-sample:icon' }} removable={true} />
```

The ItemWrapper component provides a flexible and customizable way to display removable elements in your application. By utilizing the Item component's features, you can create various appearances to suit your specific use cases.
