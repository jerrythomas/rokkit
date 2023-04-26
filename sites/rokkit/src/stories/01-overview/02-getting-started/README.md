---
title: Getting Started
---

Rokkit consists of the following libraries.

- [@rokkit/core](https://www.npmjs.com/package/@rokkit/core)
- [@rokkit/icons](https://www.npmjs.com/package/@rokkit/icons)
- [@rokkit/input](https://www.npmjs.com/package/@rokkit/input)
- [@rokkit/form](https://www.npmjs.com/package/@rokkit/form)
- [@rokkit/chart](https://www.npmjs.com/package/@rokkit/chart)
- [@rokkit/themes](https://www.npmjs.com/package/@rokkit/themes)
- [@rokkit/markdown](https://www.npmjs.com/package/@rokkit/markdown)
- [@rokkit/layout](https://www.npmjs.com/package/@rokkit/layout)

> You'll need to have basic familiarity with Svelte/Svelte-Kit to use Rokkit.

## Get started

Add [UnoCSS](https://github.com/unocss/unocss) to your svelte-kit project using the steps mentioned [here](https://unocss.dev/integrations/vite#sveltekit)

### Add the libraries

```bash
pnpm i --save-dev @rokkit/core @rokkit/themes
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
  import { themable } from '@rokkit/core/actions'
</script>
<svelte:body use:themable />
```

### Try out one of the components

In your `+page.svelte`

```svelte
<script>
  <script>
  import { List } from '@rokkit/core'

  let items = ['Fruits', 'Vegetables', 'Nuts', 'Spices']
  let value
</script>

<List {items} bind:value />
<p>Selected Value: <b>{value}</b></p>
```
