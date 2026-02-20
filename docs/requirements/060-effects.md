# Presentation Effect Components

> Requirements for visual effect wrapper components.

## 1. Overview

Effect components are wrapper components that add visual presentation effects to their children. They follow the pattern `<Effect><Child /></Effect>`.

## 2. Components

### 2.1 Existing (in archive)

| Component | Effect | Archive Status |
|-----------|--------|----------------|
| `Tilt` | 3D tilt on hover/mouse movement | `archive/ui/src/Tilt.svelte` — uses d3-scale |
| `Shine` | Glossy shine effect | `archive/ui/src/Shine.svelte` — uses d3-scale + SVG filters |

### 2.2 Planned

| Component | Effect |
|-----------|--------|
| `Glow` | Glow/shadow effect |
| `Depth3D` | 3D depth/perspective |
| `Motion` | Entry/exit animations |
| `Parallax` | Parallax scroll effect |

## 3. Usage Pattern

```svelte
<Tilt intensity={0.5}>
  <Shine>
    <Card>Content</Card>
  </Shine>
</Tilt>
```

## 4. Common Interface

All effect components should accept:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `intensity` | `number` | `1` | Effect strength (0–1) |
| `disabled` | `boolean` | `false` | Disable the effect |
| `class` | `string` | `''` | CSS classes |
| `children` | `Snippet` | — | Child content |

## 5. Additional Archived Components

These use similar visual effect patterns:

| Component | Description | Archive |
|-----------|-------------|---------|
| `GraphPaper` | Grid background with configurable units/thickness | `archive/ui/src/GraphPaper.svelte` |
| `Rating` | Star rating input (visual) | `archive/ui/src/Rating.svelte` |
| `Fillable` | Markdown text with fillable options | `archive/ui/src/Fillable.svelte` — uses `marked` |

## 6. Dependencies

- `d3-scale` — used by Tilt and Shine for interpolation
- Consider replacing d3-scale with native CSS or Svelte tweened stores to reduce bundle size
