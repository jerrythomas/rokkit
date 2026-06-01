## A flexible interactive primitive

Button is the canonical trigger — text label, optional icons, link
mode, loading state, disabled state. Used everywhere from forms to
toolbars to chat composers.

## Basic example

```svelte
<script>
  import { Button } from '@rokkit/ui'
</script>

<Button onclick={() => save()}>Save</Button>
```

## Icons

Pass an icon class via the `icon` prop for a left-side icon, or
`iconRight` for one on the right. Icon-only buttons omit the label
and pass `aria-label` for accessibility.

```svelte
<Button icon="i-mdi:download">Download</Button>
<Button icon="i-mdi:heart" aria-label="Like" />
<Button label="Next" iconRight="i-mdi:arrow-right" />
```

## States

- **`disabled`** — prevents interaction; affordances dim
- **`loading`** — shows a spinner in place of the icon; click is suppressed
- **`type`** — `'button'` (default), `'submit'`, `'reset'` (form contexts)

## Link mode

Pass an `href` and the Button renders as an `<a>` instead of a
`<button>`. `target` and `rel` flow through. The same visual
treatment, the right semantics.

```svelte
<Button href="/dashboard">Dashboard</Button>
<Button href="https://github.com/..." target="_blank">Repo</Button>
```

## Styling

Buttons inherit from `[data-button]` (root) and read the active
theme's button.css. Themes can vary fill, outline, radius, shadow
per variant without touching the component.
