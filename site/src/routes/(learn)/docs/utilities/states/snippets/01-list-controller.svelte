<script>
  import { ListController } from '@rokkit/states'

  const items = ['a', 'b', 'c']
  const controller = new ListController(items)

  // Select an item by key
  controller.select('a')
  // controller.selectedKey → 'a'
  // controller.focusedKey  → 'a'

  // Move focus
  controller.moveNext()
  // controller.focusedKey → 'b'

  controller.movePrev()
  controller.moveFirst()
  controller.moveLast()
  controller.moveToIndex(2)
</script>
