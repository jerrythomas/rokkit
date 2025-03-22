---
title: Advanced
---

## {title}

Sometimes, we may want to use different views for different items. This can be achieved by setting
both fields and using properties.

Let's say that we want to show a larger image with some descriptive text for some of the items,
and for some of them, we want the image to be on the left and for some we want it on the right.
This simple variation can be done using `css`, but in this case, we are going to create two custom
components, Odd & Even.

We will be using the following configuration to tell the `list` to use the `type` attribute to identify the component to be used.

```js
let fields = { component: 'type' }
```

Now that we have mapped the `component` attribute, let's create two custom components and tell list
to use these components.

```svelte
<script>
  import Odd from './Odd.svelte'
  import Even from './Even.svelte'
</script>

<List items={items} fields={fields} >
  {#snippet odd(node)}
		<Odd value={node.value} />
	{/snippet}
	{#snippet even(node)}
		<Even value={node.value} />
	{/snippet}
</List>
```

If we want the `Odd` component to be used as default we can change the snippet as below.

```svelte
<List items={items} fields={fields} >
  {#snippet stub(node)}
		<Odd value={node.value} />
	{/snippet}
	{#snippet even(node)}
		<Even value={node.value} />
	{/snippet}
</List>
```
