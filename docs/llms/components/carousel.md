# Carousel

> Content slides with dots, arrows, touch swipe, and autoplay.

**Export**: `Carousel` from `@rokkit/ui`
**Navigation**: `keyboard` + `swipeable` actions (Pattern C — no controller)

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `count` | `number` | `0` | Total number of slides |
| `current` | `number` | `0` | Current slide index (bindable) |
| `autoplay` | `boolean` | `false` | Auto-advance slides |
| `interval` | `number` | `3000` | Autoplay interval (ms) |
| `loop` | `boolean` | `true` | Loop from last to first |
| `showDots` | `boolean` | `true` | Show dot indicators |
| `showArrows` | `boolean` | `true` | Show prev/next arrow buttons |
| `transition` | `'slide' \| 'fade' \| 'none'` | `'slide'` | Slide transition type |
| `class` | `string` | `''` | Extra CSS classes |

## Snippets

| Snippet | Signature | Description |
|---------|-----------|-------------|
| `slide` | `(index)` | Content for each slide |

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `ArrowLeft` | Previous slide |
| `ArrowRight` | Next slide |
| `Home` | First slide |
| `End` | Last slide |

Touch swipe left/right also navigates.

## Examples

### Basic

```svelte
<script>
  import { Carousel } from '@rokkit/ui'
  let current = $state(0)
</script>

<Carousel count={3} bind:current>
  {#snippet slide(i)}
    <div class="slide-content">Slide {i + 1}</div>
  {/snippet}
</Carousel>
```

### Autoplay with fade

```svelte
<Carousel count={images.length} autoplay interval={5000} transition="fade">
  {#snippet slide(i)}
    <img src={images[i]} alt="Slide {i}" />
  {/snippet}
</Carousel>
```

### No loop, no dots

```svelte
<Carousel count={steps.length} loop={false} showDots={false} bind:current>
  {#snippet slide(i)}
    <StepContent step={steps[i]} />
  {/snippet}
</Carousel>
```
