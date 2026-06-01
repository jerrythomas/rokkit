## Validation criteria with pass / fail / warn / unknown badges

StatusList renders rows of text, each prefixed with a status icon
resolved from the badge icon map. Built for password strength
checkers, pre-submit form validation, system health dashboards —
anywhere a list of rules needs to communicate state at a glance.

## Basic example

```svelte
<script>
  import { StatusList } from '@rokkit/ui'

  const items = [
    { text: 'At least 8 characters',          status: 'pass' },
    { text: 'Contains an uppercase letter',   status: 'fail' },
    { text: 'Contains a number (recommended)', status: 'warn' },
    { text: 'Special character check',        status: 'unknown' }
  ]
</script>

<StatusList {items} />
```

## Status vocabulary

Defaults map to the badge icon set:

- `pass` — succeeded (check)
- `fail` — failed (cross)
- `warn` — soft fail / recommendation (alert)
- `unknown` — not yet evaluated (dash)

Any custom string is allowed as long as you provide its icon via the
`icons` prop. The component falls back to `unknown` for strings
without a mapping.

## Live updates

The root is rendered with `role="status"`, so screen readers
announce row changes as the underlying data updates. Combine with
`$derived` to recompute statuses from a form value:

```svelte
const checks = $derived([
  { text: 'At least 8 characters', status: password.length >= 8 ? 'pass' : 'fail' },
  { text: 'Has uppercase',         status: /[A-Z]/.test(password) ? 'pass' : 'fail' }
])
```
