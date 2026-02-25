# Tilt

> Parallax 3D tilt effect on mouse move.

**Export**: `Tilt` from `@rokkit/ui`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `maxRotation` | `number` | `15` | Max tilt angle in degrees |
| `setBrightness` | `boolean` | `true` | Adjust brightness based on tilt |
| `perspective` | `number` | `800` | CSS perspective distance (px) |
| `class` | `string` | `''` | Extra CSS classes |
| `children` | `Snippet` | — | Content inside tilt container |

## Examples

### Basic

```svelte
<script>
  import { Tilt } from '@rokkit/ui'
</script>

<Tilt>
  <div class="card">Hover me!</div>
</Tilt>
```

### Subtle tilt

```svelte
<Tilt maxRotation={5} setBrightness={false}>
  <img src={hero} alt="Hero" />
</Tilt>
```

## Notes

- Tilt is applied via mouse move tracking on the container.
- `setBrightness` adds a subtle brightness shift based on tilt angle for a 3D lighting feel.
- Mouse leave resets transform to identity.
- Respects `prefers-reduced-motion`.
