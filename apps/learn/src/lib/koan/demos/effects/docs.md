## Three pointer + scroll decorators

Three small wrappers from `@rokkit/ui` that add motion without
introducing layout — pure visual primitives meant to be composed
with whatever else you're rendering inside them.

## Tilt

Pointer-tracking 3D tilt. The wrapped element rotates toward the
mouse on `mousemove` and snaps back on `mouseleave`. Optional
`setBrightness` adjusts the lighting based on the mouse's Y position.

```svelte
<script>
  import { Tilt, Card } from '@rokkit/ui'
</script>

<Tilt maxRotation={12} setBrightness>
  <Card>
    <h3>Hover me</h3>
    <p>The card tilts toward the cursor.</p>
  </Card>
</Tilt>
```

Knobs:

- `maxRotation` (deg, default `10`) — peak rotation amplitude.
- `perspective` (px, default `600`) — CSS perspective; lower = more
  dramatic depth.
- `setBrightness` (default `false`) — also vary brightness with
  pointer Y.

## Shine

Pointer-tracking specular highlight rendered via SVG `feSpecularLighting`.
Adds a soft "light source follows your finger" feel — great on
glossy cards and elevated surfaces.

```svelte
<Shine color="rgb(var(--accent))">
  <Card class="glossy">Glossy surface</Card>
</Shine>
```

Knobs include `radius` (light-source distance), `depth` (gaussian
blur), `specularConstant` (reflection strength), `specularExponent`
(focus / sharpness).

## Reveal

Scroll-reveal wrapper. Children animate in once they cross the
viewport's threshold. Direction, distance, duration, and per-child
stagger are all configurable.

```svelte
<Reveal direction="up" stagger={120}>
  <Card>Reveals first…</Card>
  <Card>…then this one…</Card>
  <Card>…then this one.</Card>
</Reveal>
```

Knobs:

- `direction` — `up` (default) / `down` / `left` / `right` / `none`.
- `distance` — CSS length, default `1.5rem`.
- `duration` — ms, default `600`.
- `delay` — initial delay in ms.
- `stagger` — per-child delay increment.
- `once` (default `true`) — only animate the first time the child
  enters; set `false` to replay on every entry.
- `threshold` — IntersectionObserver threshold 0–1, default `0.1`.

## Composing them

These are wrappers — they stack naturally. `<Reveal><Tilt><Shine>`
gives a card that fades in on scroll, tilts with the cursor, and
catches highlights when hovered.
