<script>
  import { navigable } from '@rokkit/actions'

  let items = ['Apple', 'Banana', 'Cherry']
  let focusedIndex = $state(0)
</script>

<!-- navigable fires events on keyup (not keydown) -->
<!-- Default orientation: vertical (ArrowUp/Down = previous/next) -->
<ul
  use:navigable
  onprevious={() => (focusedIndex = Math.max(0, focusedIndex - 1))}
  onnext={() => (focusedIndex = Math.min(items.length - 1, focusedIndex + 1))}
  onselect={() => console.log('selected', items[focusedIndex])}
>
  {#each items as item, i}
    <li tabindex={focusedIndex === i ? 0 : -1}>{item}</li>
  {/each}
</ul>
