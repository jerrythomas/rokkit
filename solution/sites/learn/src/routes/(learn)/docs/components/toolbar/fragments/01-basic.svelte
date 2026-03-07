<script>
	// @ts-nocheck
  import { Toolbar } from '@rokkit/ui'

  let items = [
    { label: 'Bold', icon: 'i-lucide:bold' },
    { label: 'Italic', icon: 'i-lucide:italic' },
    { itemType: 'separator' },
    { label: 'Align Left', icon: 'i-lucide:align-left' }
  ]
</script>

<Toolbar {items} onclick={(item) => console.log(item.label)} />
