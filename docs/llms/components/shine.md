# Shine

> SVG specular lighting effect that follows the cursor, creating a shiny surface illusion.

**Export**: `Shine` from `@rokkit/ui`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `color` | `string` | `'white'` | Specular light color |
| `radius` | `number` | `100` | Light source radius |
| `depth` | `number` | `20` | Z-axis depth of light source |
| `surfaceScale` | `number` | `5` | Surface texture scale |
| `specularConstant` | `number` | `0.8` | Specular reflection intensity |
| `specularExponent` | `number` | `20` | Shininess (higher = smaller highlight) |
| `class` | `string` | `''` | Extra CSS classes |
| `children` | `Snippet` | — | Content with shine overlay |

## Examples

### Basic

```svelte
<script>
  import { Shine } from '@rokkit/ui'
</script>

<Shine>
  <div class="card">Hover for shine</div>
</Shine>
```

### Custom parameters

```svelte
<Shine color="gold" specularExponent={50} specularConstant={1.2} depth={10}>
  <div class="metallic-surface">Premium look</div>
</Shine>
```

## Notes

- Uses SVG `feDiffuseLighting` / `feSpecularLighting` filters.
- Effect follows the cursor over the element boundary.
- Overlaid via an absolutely-positioned SVG, pointer-events none.
- Respects `prefers-reduced-motion`.
