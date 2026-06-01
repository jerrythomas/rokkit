## Imperative notifications

Toasts are transient messages — success confirmations, warnings,
errors, info nudges — that surface in response to user actions or
background events. Rokkit's toast system is built on the
`alerts` store from `@rokkit/states` paired with the `AlertList`
component for rendering.

## Trigger a toast

The `alerts` store exposes one method per severity. Call from
anywhere — event handlers, async resolvers, route loaders. The
message goes into the queue; `AlertList` renders whatever the queue
holds.

```svelte
<script>
  import { alerts } from '@rokkit/states'
  import { Button, AlertList } from '@rokkit/ui'
</script>

<Button onclick={() => alerts.success('Saved successfully')}>
  Save
</Button>

<AlertList position="top-right" />
```

## Four severity kinds

- **`alerts.success(msg)`** — green, checkmark
- **`alerts.info(msg)`** — blue, info circle
- **`alerts.warning(msg)`** — amber, exclamation
- **`alerts.error(msg)`** — red, x-circle

Each carries an icon and a paper background that contrasts with the
severity-tinted border. Themes can re-skin via the
`[data-toast][data-kind]` attribute pair.

## Position

`AlertList` accepts a `position` prop choosing one of six anchors:
`top-right` (default), `top-center`, `top-left`, `bottom-right`,
`bottom-center`, `bottom-left`. Pick the corner least likely to
collide with primary UI for the surface — `bottom-right` works well
in dashboard layouts; `top-center` is common in chat-first
experiences where the user's eye lives in the message column.

## Auto-dismiss + max stack

`duration` (ms; default 4000) controls how long each toast stays
before fading out. Set `duration={0}` to keep toasts open until
manually dismissed. `max` caps how many can stack at once — older
toasts drop off when the queue exceeds the cap.

## Manual dismiss

Each toast renders a close button (`[data-toast-close]`). Clicking
it removes the toast immediately and fires `ondismiss` with the
toast object — useful for tracking which notifications users
actively acknowledge.

## When not to use a toast

Toasts are for **transient** confirmations. If the user needs to
read the full message to make a decision (errors that require
correction, multi-line feedback), use an inline message or
`AlertList` in a non-floating placement so the content stays
visible.
