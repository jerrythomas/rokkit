# Button / ButtonGroup

> Semantic button or link with variants, styles, sizes, icons, and loading state.

**Exports**: `Button`, `ButtonGroup` from `@rokkit/ui`

## Button Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger'` | `'default'` | Color variant |
| `style` | `'solid' \| 'outline' \| 'ghost' \| 'gradient' \| 'link'` | `'solid'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size |
| `label` | `string` | — | Button text |
| `icon` | `string` | — | Icon CSS class (prepended to label) |
| `href` | `string` | — | If set, renders as `<a>` |
| `loading` | `boolean` | `false` | Shows loading spinner, disables interaction |
| `disabled` | `boolean` | `false` | Disables button |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | HTML button type |
| `class` | `string` | `''` | Extra CSS classes |
| `onclick` | `(e) => void` | — | Click handler |
| `children` | `Snippet` | — | Button content (overrides label) |

## ButtonGroup Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size applied to all buttons |
| `children` | `Snippet` | — | Button children |

## Examples

### Basic

```svelte
<Button label="Save" variant="primary" onclick={save} />
<Button label="Cancel" style="ghost" onclick={cancel} />
```

### With icon

```svelte
<Button variant="danger" style="outline" icon="i-trash" label="Delete" />
```

### As link

```svelte
<Button href="/dashboard" label="Go to Dashboard" />
<Button href="https://example.com" label="External" />
```

### Loading state

```svelte
<Button variant="primary" label="Saving..." loading={isSaving} />
```

### Icon-only

```svelte
<Button icon="i-close" style="ghost" size="sm" onclick={close} />
```

### Gradient + link styles

```svelte
<Button variant="primary" style="gradient" label="Get Started" />
<Button style="link" label="Learn more" href="/docs" />
```

### ButtonGroup

```svelte
<ButtonGroup>
  <Button icon="i-align-left" style="ghost" />
  <Button icon="i-align-center" style="ghost" />
  <Button icon="i-align-right" style="ghost" />
</ButtonGroup>
```

### Children snippet (custom content)

```svelte
<Button variant="primary">
  <span class="i-star"></span>
  Star this repo
  <span class="badge">1.2k</span>
</Button>
```

## State Attributes (CSS hooks)

| Attribute | Element | When |
|-----------|---------|------|
| `data-button` | Root | Always |
| `data-variant` | Root | Set to variant name |
| `data-style` | Root | Set to style name |
| `data-loading` | Root | Loading state |
| `data-disabled` | Root | Disabled state |
| `data-button-group` | ButtonGroup | Always |
