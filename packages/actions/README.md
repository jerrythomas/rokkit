# Actions

This package provides a set of actions that can be used to perform various tasks.

## Keyboard

The keyboard action can be used to map keyboard events to actions. The following example shows how to map the `K` key combination to an action:

The default behavior is to listen to keyup events.

- [x] Configuration driven
- [x] Custom events can be defined
- [x] Supports mapping an array of keys to an event
- [x] Supports mapping a regex to an event
- [ ] Support key modifiers
- [ ] Support a combination of regex patterns and array of keys

Default configuration

- _add_: alphabet keys cause an `add` event
- _submit_: enter causes a `submit` event
- _cancel_: escape causes a `cancel` event
- _delete_: backspace or delete causes a `delete` event

### Basic Usage

```svelte
<script>
  import { keyboard } from '@fumbl/actions'

  function handleKey(event) {
    console.log(`${event.detail} pressed`)
  }
</script>

<div use:keyboard onadd={handleKey}></div>
```

### Custom Events

```svelte
<script>
  import { keyboard } from '@fumbl/actions'
  function handleKey(event) {
    console.log(`${event.detail} pressed`)
  }

  const config = {
    add: ['a', 'b', 'c'],
    submit: 'enter',
    cancel: 'escape',
    delete: ['backspace', 'delete']
  }
</script>

<div use:keyboard={config} onadd={handleKey}></div>
```
