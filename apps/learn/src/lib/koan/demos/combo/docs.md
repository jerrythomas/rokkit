## Combobox = filterable Select

Combobox isn't a separate component — it's the standard `Select`
with the `filterable` flag turned on. The flag swaps a static
dropdown list for one that has a type-to-narrow search input above
the options.

Use it for long lists where typing beats scrolling — countries,
users, products, timezones. For short fixed lists (under ~15 items),
prefer the plain Select.

## When to reach for it

- Option count is large (typically 15+)
- Users will know what they're looking for and can type a substring
- The option labels are reasonably short (filter matches the display text)

If you need fuzzy matching, multi-token search, or async fetching,
look at `FormBuilder`'s lookup system instead — it supports URL
templates, async fetches, and filterable sync sources.

## Basic example

```svelte
<script>
  import { Select } from '@rokkit/ui'
  const countries = [
    { name: 'Australia', code: 'AU' },
    { name: 'Brazil',    code: 'BR' },
    { name: 'Canada',    code: 'CA' }
    /* ...195 more rows */
  ]
  let code = $state(null)
</script>

<Select
  items={countries}
  fields={{ text: 'name', value: 'code' }}
  bind:value={code}
  filterable
  filterPlaceholder="Type a country..."
/>
```

## Filterable off

Setting `filterable={false}` (or omitting the flag) renders a plain
non-filterable Select — same items, same field mapping, same
keyboard navigation, but no search input. Useful when the same
component needs to flip between modes (e.g. compact form vs. wide
settings).

## See also

The Select doc page covers field mapping, grouped options, custom
option rendering, and the ProxyItem API in detail — Combobox
inherits all of it.
