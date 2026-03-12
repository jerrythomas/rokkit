<script>
	// @ts-nocheck
	import { BreadCrumbs } from '@rokkit/ui'

	let items = [
		{ label: 'Home', icon: 'i-lucide:home' },
		{ label: 'Products', icon: 'i-lucide:package' },
		{ label: 'Electronics' },
		{ label: 'Laptops' }
	]
</script>

<BreadCrumbs {items} onclick={(value) => alert(value.text)} />

<p class="text-surface-z6 mt-4 text-sm">
	Click any breadcrumb to navigate. The last item is the current page.
</p>
