# keyboard

> Maps keyboard keys to named custom events. Simpler than `navigator` — no controller needed.

**Package**: `@rokkit/actions`
**File**: `keyboard.svelte.js`

## Usage

```svelte
<div use:keyboard on:remove on:submit on:add={(e) => console.log(e.detail)}>
```

## Default Key Mappings

| Key | Event |
|-----|-------|
| `Backspace`, `Delete` | `remove` |
| `Enter` | `submit` |
| `/^[a-zA-Z]$/` (regex) | `add` |

## Custom Key Mapping

```svelte
<div use:keyboard={{ prev: ['ArrowUp', 'k'], next: ['ArrowDown', 'j'], select: 'Enter' }}
     on:prev on:next on:select>
```

Pass an object where keys are event names and values are key strings or arrays of key strings or regex patterns.

## Examples

### Pill/tag input

```svelte
<div
  use:keyboard
  on:remove={() => removeLastTag()}
  on:add={(e) => addCharacter(e.detail)}
  on:submit={() => commitInput()}
>
  <input bind:value={inputText} />
</div>
```

### Custom VIM-style navigation

```svelte
<div
  use:keyboard={{ prev: ['ArrowUp', 'k'], next: ['ArrowDown', 'j'], select: ['Enter', 'l'] }}
  on:prev={() => movePrev()}
  on:next={() => moveNext()}
  on:select={() => selectItem()}
>
```

## Notes

- Used by `Carousel` for prev/next/first/last navigation.
- Events include `e.detail` with the original keyboard event.
