<script>
	// @ts-nocheck
	import { Menu } from '@rokkit/ui'

	const items = [
		{ label: 'Copy', icon: 'i-glyph:copy' },
		{ label: 'Paste', icon: 'i-glyph:clipboard' },
		{ label: 'Delete', icon: 'i-glyph:trash-bin' }
	]
</script>

<Menu {items} label="Actions" onselect={(value, proxy) => console.log(value, proxy)} />
