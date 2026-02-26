<script>
	// @ts-nocheck
  import { Toolbar } from '@rokkit/ui'

  let items = [
    { text: 'Bold', icon: 'i-lucide:bold' },
    { text: 'Italic', icon: 'i-lucide:italic' },
    { itemType: 'separator' },
    { text: 'Align Left', icon: 'i-lucide:align-left' }
  ]
</script>

<Toolbar {items} onclick={(item) => console.log(item.text)} />
