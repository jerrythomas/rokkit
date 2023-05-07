---
title: State based icons
---

To render text with a state-based icon, pass an object that includes the text, icon, and state fields:

```svelte
<script>
  let value ={
    text: 'Folder',
    icon: { open: 'i-rokkit:folder-opened', close: 'i-rokkit:folder-closed' },
    state: 'open'
  }
</script>
<Item {value} />
```

> Note that the component only renders the icon, image & text, but does not put a wrapper element around it. In the preview, we have used an item tag to wrap the `Item` component. This `item` tag is used as a wrapper around the contents.
