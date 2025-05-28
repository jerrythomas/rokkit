# Svelte 5 References

## Primary Documentation

- **Complete Guide:** @fetch https://svelte-llm.khromov.se/svelte-complete-distilled
- **Official Docs:** @fetch https://svelte.dev/docs/svelte/llms.txt

## Version Requirements

- **Svelte 5 ONLY** - Do not use Svelte 4 patterns
- **Runes mode** - All components must use runes

## Anti-Patterns to Avoid

- `export let` syntax (use `$props()`)
- `$:` reactive statements (use `$derived()`)
- `on:click` events (use `onclick`)
- `createEventDispatcher` (use callback props)
