---
title: Custom Component
---

You can also use a custom component for the content of the ItemWrapper. In this example, we will create a custom Status component, which takes a status string and shows color and text for the status.

Set the using property to the Status component and ItemWrapper will use this for the content.

```svelte
<script>
  import Status from './Status.svelte'

  let using = { default: Status }
</script>

<ItemWrapper value="success" {using} />
```
