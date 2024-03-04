---
title: Getting Started
---

Rokkit consists of the following libraries.

- [@rokkit/core](https://www.npmjs.com/package/@rokkit/core)
- [@rokkit/icons](https://www.npmjs.com/package/@rokkit/icons)
- [@rokkit/actions](https://www.npmjs.com/package/@rokkit/actions)
- [@rokkit/stores](https://www.npmjs.com/package/@rokkit/stores)
- [@rokkit/atoms](https://www.npmjs.com/package/@rokkit/atoms)
- [@rokkit/molecules](https://www.npmjs.com/package/@rokkit/molecules)
- [@rokkit/organisms](https://www.npmjs.com/package/@rokkit/organisms)
- [@rokkit/layout](https://www.npmjs.com/package/@rokkit/layout)
- [@rokkit/ui](https://www.npmjs.com/package/@rokkit/ui)
- [@rokkit/themes](https://www.npmjs.com/package/@rokkit/themes)

> You'll need to have basic familiarity with Svelte/Svelte-Kit to use Rokkit.

## Get started

Add [UnoCSS](https://github.com/unocss/unocss) to your svelte-kit project using the steps mentioned [here](https://unocss.dev/integrations/vite#sveltekit)

### Clone the quick start template

```bash
degit jerrythomas/rokkit/sites/quick-start my-app
cd my-app
pnpm i
```

### Try out one of the components

In your `+page.svelte`

```svelte
<script>
  import { List } from '@rokkit/organisms'

  let items = ['Fruits', 'Vegetables', 'Nuts', 'Spices']
  let value
</script>

<List {items} bind:value /><p>Selected Value: <b>{value}</b></p>
```
