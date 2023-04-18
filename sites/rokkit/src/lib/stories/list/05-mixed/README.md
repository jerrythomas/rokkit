---
title: Mixed
---

# {title}

Sometimes, we may want to use different views for different items. This can be achieved by setting
both fields and using properties.

Let's say that we want to show a larger image with some descriptive text for some of the items,
and for some of them we want the image to be on the left and for some we wnat it on the right.
This simple variation can be done using css, but in this case we are going to create two custom
components, Odd & Even.

We will be using the following configuration to tell list to use the 'type' attribute to identify
the component to be used.

```js
let fields = { component: 'type' }
```

Now that we have mapped the `component` attribute, let's create two custom components and tell list
to use these components.

```svelte
<script>
  import Odd from './Odd.svelte'
  import Even from './Even.svelte'

  let using = {	odd: Odd,	even: Even }
</script>
```

Notice that some of the elements do not have this attribute. In such cases, list will use the default component.
If we wanted to used the Even component as a default we could modify the `using` attribute as shown below.

```js
let using = { odd: Odd, default: Even }
```

In this case also, even though the value `even` is not mapped to a component, list will use the default.
