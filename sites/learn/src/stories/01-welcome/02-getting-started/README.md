---
title: Getting Started
---

Rokkit consists of the following libraries.

- [@rokkit/core](https://www.npmjs.com/package/@rokkit/core)
- [@rokkit/icons](https://www.npmjs.com/package/@rokkit/icons)
- [@rokkit/actions](https://www.npmjs.com/package/@rokkit/actions)
- [@rokkit/stores](https://www.npmjs.com/package/@rokkit/stores)
- [@rokkit/utils](https://www.npmjs.com/package/@rokkit/utils)
- [@rokkit/atoms](https://www.npmjs.com/package/@rokkit/atoms)
- [@rokkit/molecules](https://www.npmjs.com/package/@rokkit/molecules)
- [@rokkit/organisms](https://www.npmjs.com/package/@rokkit/organisms)
- [@rokkit/layout](https://www.npmjs.com/package/@rokkit/layout)
- [@rokkit/themes](https://www.npmjs.com/package/@rokkit/themes)

> You'll need to have basic familiarity with Svelte/Svelte-Kit to use Rokkit.

## Get started

Add [UnoCSS](https://github.com/unocss/unocss) to your svelte-kit project using the steps mentioned [here](https://unocss.dev/integrations/vite#sveltekit)

### Add the libraries

```bash
pnpm i --save-dev rokkit @rokkit/organisms @rokkit/themes
```

### Add the following styles to your `app.css`

```css
/* Uno CSS Reset */
@import '@rokkit/themes/palette.css';
@import '@rokkit/themes/rokkit.css';
/* Custom styles */
```

### Update the root layout

In your root `+layout.svelte`

```svelte
<script>
  import 'uno.css'
  import '../app.css'
  import { themable } from '@rokkit/actions'
</script>

<svelte:body use:themable />
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
