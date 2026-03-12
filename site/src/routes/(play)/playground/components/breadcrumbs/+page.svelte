<script>
	// @ts-nocheck
	import { BreadCrumbs } from '@rokkit/ui'
	import PlaySection from '$lib/components/PlaySection.svelte'

	const items = [
		{ label: 'Home', value: 'home', icon: 'i-lucide:home' },
		{ label: 'Products', value: 'products' },
		{ label: 'Electronics', value: 'electronics' },
		{ label: 'Laptops', value: 'laptops' }
	]

	const shortItems = [
		{ label: 'Home', value: 'home', icon: 'i-lucide:home' },
		{ label: 'Settings', value: 'settings' }
	]

	function handleClick(value) {
		console.log('Navigate to:', value)
	}
</script>

<PlaySection>
	{#snippet preview()}
		<div class="flex flex-col gap-8 p-8">
			<div class="flex flex-col gap-2">
				<span class="text-surface-z5 text-sm">Default (4 items)</span>
				<BreadCrumbs {items} onclick={handleClick} />
			</div>

			<div class="flex flex-col gap-2">
				<span class="text-surface-z5 text-sm">Short (2 items)</span>
				<BreadCrumbs items={shortItems} onclick={handleClick} />
			</div>

			<div class="flex flex-col gap-2">
				<span class="text-surface-z5 text-sm">Custom separator</span>
				<BreadCrumbs {items} separator="i-lucide:slash" onclick={handleClick} />
			</div>
		</div>
	{/snippet}
</PlaySection>
