const items = [
  { label: 'Apple', snippet: 'fruit' },
  { label: 'Carrot', snippet: 'vegetable' }
]

<List {items}>
  {#snippet fruit(proxy)}
    <span>{proxy.text}</span>
    <span class="text-xs text-error-z5">fruit</span>
  {/snippet}
  {#snippet vegetable(proxy)}
    <span>{proxy.text}</span>
    <span class="text-xs text-success-z5">veggie</span>
  {/snippet}
</List>
