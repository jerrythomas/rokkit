/**
 * Example: Per-component icon override in Rokkit UI
 *
 * You can override icons for a specific component by passing an `icons` object
 * using the base icon names as keys.
 */

const myIcons = {
  add: 'i-custom:add',
  remove: 'i-custom:remove',
  // ...other overrides
}

// Usage in Svelte:
<List items={items} icons={myIcons} />
// Note: Use the base icon names (e.g., "add", "remove"), not full keys like "action-add".
