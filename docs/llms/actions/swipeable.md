# swipeable

> Touch and mouse swipe gesture detection.

**Package**: `@rokkit/actions`
**File**: `swipeable.svelte.js`

## Usage

```svelte
<div use:swipeable={{ horizontal: true, threshold: 50 }}
     on:swipeLeft on:swipeRight>
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `horizontal` | `boolean` | `true` | Detect left/right swipes |
| `vertical` | `boolean` | `false` | Detect up/down swipes |
| `threshold` | `number` | `50` | Minimum distance (px) to register swipe |
| `minSpeed` | `number` | — | Minimum swipe speed (px/ms) |
| `enabled` | `boolean` | `true` | Enable/disable action |

## Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `swipeLeft` | horizontal | Swipe left |
| `swipeRight` | horizontal | Swipe right |
| `swipeUp` | vertical | Swipe up |
| `swipeDown` | vertical | Swipe down |

## Example

```svelte
<!-- Carousel uses swipeable for touch navigation -->
<div
  use:swipeable={{ horizontal: true }}
  on:swipeLeft={() => next()}
  on:swipeRight={() => prev()}
>
  <!-- slides -->
</div>
```
