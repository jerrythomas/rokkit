# Stepper

> Step progress indicator with optional sub-stages, connector lines, and click navigation.

**Export**: `Stepper` from `@rokkit/ui`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `StepItem[]` | `[]` | Step items |
| `fields` | `Partial<StepperFields>` | — | Field mapping |
| `value` | `number \| unknown` | `0` | Current step index or value (bindable) |
| `linear` | `boolean` | `false` | Restrict navigation to completed + next step |
| `class` | `string` | `''` | Extra CSS classes |
| `onchange` | `(value, item) => void` | — | Called on step change |

## Snippets

| Snippet | Signature | Description |
|---------|-----------|-------------|
| `step` | `(item, fields, state)` | Custom step node renderer |

## Step Item Structure

```typescript
interface StepItem {
  text: string       // Step label
  value?: unknown    // Step value
  completed?: boolean  // Mark step as done
  substeps?: number    // Number of sub-stage dots
}
```

## Examples

### Basic

```svelte
<script>
  import { Stepper } from '@rokkit/ui'
  const steps = [
    { text: 'Account' },
    { text: 'Profile' },
    { text: 'Review' },
    { text: 'Done' },
  ]
  let current = $state(0)
</script>

<Stepper items={steps} bind:value={current} />
```

### Linear mode (wizard)

```svelte
<script>
  const steps = [
    { text: 'Step 1', completed: true },
    { text: 'Step 2', completed: true },
    { text: 'Step 3' },
    { text: 'Step 4' },
  ]
</script>

<Stepper items={steps} linear bind:value={current} />
```
In linear mode, only completed steps and the next incomplete step are clickable.

### With sub-stages

```svelte
<Stepper
  items={[
    { text: 'Planning', substeps: 3 },
    { text: 'Development', substeps: 5 },
    { text: 'Testing', substeps: 2 },
  ]}
  bind:value={current}
/>
```

## State Attributes (CSS hooks)

| Attribute | Element | When |
|-----------|---------|------|
| `data-stepper` | Root | Always |
| `data-step` | Step node | Always |
| `data-completed` | Step node | Step completed |
| `data-active` | Step node | Current step |
| `data-disabled` | Step node | Not yet reachable (linear mode) |
