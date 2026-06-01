## Schema-driven date and date-time pickers

There's no separate `<DatePicker>` component — date input is just a
form field with the right `format`. When FormRenderer encounters a
`string` schema with `format: 'date'`, it dispatches to
`InputDate`; `format: 'date-time'` routes to `InputDateTime`;
`format: 'time'` to `InputTime`.

This keeps the date-picker mental model aligned with every other
input — declare it in the schema, and the form renders it.

## Basic example

```svelte
<script>
  import { FormRenderer } from '@rokkit/forms'
  const schema = {
    type: 'object',
    properties: {
      birthday: { type: 'string', format: 'date' }
    },
    required: ['birthday']
  }
  let data = $state({ birthday: '' })
</script>

<FormRenderer bind:data {schema} />
```

## Date + time

Combine a date and a time picker into one input by using `format:
'date-time'`. The bound value is an ISO-8601 string like
`2026-06-15T14:30`.

```svelte
const schema = {
  type: 'object',
  properties: {
    startsAt: { type: 'string', format: 'date-time' }
  }
}
```

## Min and max constraints

JSON-Schema supports `formatMinimum` / `formatMaximum` for date and
date-time strings. FormRenderer enforces these as both HTML
constraints and validation rules.

```svelte
const schema = {
  type: 'object',
  properties: {
    eventDate: {
      type: 'string',
      format: 'date',
      formatMinimum: '2026-01-01',
      formatMaximum: '2026-12-31'
    }
  }
}
```

## Native vs custom picker

The underlying inputs use native `<input type="date">` /
`<input type="datetime-local">` to inherit the platform's accessible
calendar/time picker. The wrapper handles formatting, validation,
and the field state attributes — the calendar UI itself is OS-native.

## Why no `<DatePicker>` component?

A standalone date picker would duplicate the InputDate logic and
fork the schema mental model. Form-first dates keep the API surface
small and consistent — any FormRenderer feature (validation,
conditional fields, lookups) just works on dates the same way it
works on text or numbers.
