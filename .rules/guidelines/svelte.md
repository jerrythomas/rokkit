# Guidelines

- Use Svelte 5 runes mode for code
- Use SvelteKit for app
- Use UnoCSS for styling
- Use vitest for unit testing
- Use Playwright for e2e testing
- E2E tests should follow the page object pattern

## Svelte 5
{{[Svelte & Svelte Kit Distilled](https://svelte-llm.khromov.se/svelte-complete-distilled)}}
{{[svelte 5 documentation](https://svelte.dev/docs/svelte/llms.txt)}}

## Snippets

### Runes

Runes are special functions that replace reactivity declarations from Svelte 4.

```svelte
<script>
  // State
  let count = $state(0);

  // Derived values
  let doubled = $derived(count * 2);

  // Props
  let {
    name = 'world',
    value = $bindable(null)
  } = $props();

  // Effects
  $effect(() => {
    console.log(`Count changed to ${count}`);
  });
</script>
```

### Defining and passing snippets to components:

```svelte
<script>
  let items = ['one','two', 'three']
</script>
<!-- a header snippet -->
{#snippet header()}
  <h1>Custom header</h1>
{/snippet}

<!-- a snippet with parameters -->
{#snippet item(item, selected)}
  <div class:selected={selected}>
    {item.name}
  </div>
{/snippet}

<List {items} {header} {item} />
```

### Using snippets in a component:

```svelte
<script>
  let { header, item } = $props();
</script>

<div class="header">
  {@render header?.()}
</div>

{#each items as currentItem}
  {@render item(currentItem, selectedItem === currentItem)}
{/each}
```

To pass a snippet to another component:

#### ChildComponent.svelte

```svelte
<script>
  let { header } = $props();
</script>

{#if header}
  {@render header()}
{/if}
```

#### Snippets can be passed as properties to child component

```svelte
<script>
   import  ChildComponent from './ChildComponent.svelte'
</script>
{#snippet header()}
  <h1>Custom Header</h1>
{/snippet}

<ChildComponent {header} />
```

### Snippets can be enclosed within the child component.

```svelte
<script>
   import  ChildComponent from './ChildComponent.svelte'
</script>
<ChildComponent>
  {#snippet header()}
    <h1>Custom Header</h1>
  {/snippet}
</ChildComponent>
```
Both of these options work in a similar way

### Important: What NOT to do

Do not confuse snippets with React-style JSX or string templates:

```svelte
<!-- ❌ INCORRECT - Using arrow functions returning strings -->
<List
  header={() => `<h1>My List</h1>`}
  item={({ item }) => `<div>${item.name}</div>`}
/>

<!-- ✅ CORRECT - Using properly defined snippets -->
<!-- snippets are defined in the html section not in scripts block -->
{#snippet header()}
  <h1>My List</h1>
{/snippet}

{#snippet itemTemplate(item, selected)}
  <div class:selected={selected}>
    {item.name}
  </div>
{/snippet}

<List {header} item={itemTemplate} />
```

## Component Design Guidelines

- should be modular and data driven
- should be accessibile
- Reduced motion should be considered

## Project Structure

If the source code uses runes or the test uses runes the file extension should be `.svelte.js` or `.spec.svelte.js` respectively.

```
project/
│
├── src/
│   ├── index.js
│   ├── Component.svelte
│   └── utils.svelte.js
│
├── spec/
│   ├── index.spec.js
│   ├── Component.spec.js
│   └── utils.spec.svelte.js
├── e2e/
│   ├── home.e2e.js
│   └── login.e2e.js
└── README.md
```
