# Timeline

> Vertical sequence of events with icons and completion indicators.

**Export**: `Timeline` from `@rokkit/ui`
**Interaction**: Presentational only — no keyboard navigation

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `TimelineItem[]` | `[]` | Timeline events |
| `fields` | `Partial<TimelineFields>` | — | Field mapping |
| `icons` | `Partial<TimelineIcons>` | — | Override icon CSS classes |
| `class` | `string` | `''` | Extra CSS classes |

## Field Mapping

| Field | Default | Description |
|-------|---------|-------------|
| `text` | `'text'` | Event title |
| `description` | `'description'` | Event description |
| `icon` | `'icon'` | Event icon |
| `completed` | `'completed'` | Boolean — marks event as done |
| `date` | `'date'` | Date/timestamp label |

## Examples

### Basic

```svelte
<script>
  import { Timeline } from '@rokkit/ui'
  const events = [
    { text: 'Order placed', date: 'Jan 1', completed: true },
    { text: 'Payment confirmed', date: 'Jan 1', completed: true },
    { text: 'Shipped', date: 'Jan 3', completed: true },
    { text: 'Delivered', date: 'Jan 5' },
  ]
</script>

<Timeline items={events} />
```

### Custom field mapping

```svelte
<Timeline
  items={history}
  fields={{ text: 'title', description: 'body', completed: 'done', date: 'timestamp' }}
/>
```

## State Attributes (CSS hooks)

| Attribute | Element | When |
|-----------|---------|------|
| `data-timeline` | Root | Always |
| `data-timeline-item` | Item | Always |
| `data-completed` | Item | Event marked complete |
| `data-timeline-icon` | Icon container | Always |
| `data-timeline-connector` | Line between items | Always |
