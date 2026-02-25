# Card

> Flexible content container that renders as `div`, `<a>`, or `<button>` depending on props.

**Export**: `Card` from `@rokkit/ui`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `href` | `string` | — | If set, renders as `<a>` |
| `onclick` | `(e) => void` | — | If set (and no href), renders as `<button>` |
| `class` | `string` | `''` | Extra CSS classes |
| `children` | `Snippet` | — | Main card content |
| `header` | `Snippet` | — | Card header slot |
| `footer` | `Snippet` | — | Card footer slot |

## Examples

### Static card

```svelte
<Card>
  <p>Card content here</p>
</Card>
```

### Clickable card

```svelte
<Card onclick={() => navigate(item.id)}>
  <h3>{item.title}</h3>
  <p>{item.description}</p>
</Card>
```

### Link card

```svelte
<Card href="/products/{product.id}">
  <img src={product.image} alt={product.name} />
  <h3>{product.name}</h3>
</Card>
```

### With header and footer

```svelte
<Card>
  {#snippet header()}
    <h2>Card Title</h2>
  {/snippet}

  <p>Card body content.</p>

  {#snippet footer()}
    <Button label="Learn more" />
  {/snippet}
</Card>
```

## State Attributes (CSS hooks)

| Attribute | Element | When |
|-----------|---------|------|
| `data-card` | Root | Always |
| `data-card-header` | Header | When header snippet provided |
| `data-card-footer` | Footer | When footer snippet provided |
| `data-interactive` | Root | When href or onclick provided |
