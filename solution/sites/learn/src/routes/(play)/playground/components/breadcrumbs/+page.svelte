<script>
	// @ts-nocheck
	import { BreadCrumbs } from '@rokkit/ui'
	import PlaySection from '$lib/components/PlaySection.svelte'

	const items = [
		{ text: 'Home', value: 'home', icon: 'i-lucide:home' },
		{ text: 'Products', value: 'products' },
		{ text: 'Electronics', value: 'electronics' },
		{ text: 'Laptops', value: 'laptops' }
	]

	const shortItems = [
		{ text: 'Home', value: 'home', icon: 'i-lucide:home' },
		{ text: 'Settings', value: 'settings' }
	]

	function handleClick(value) {
		console.log('Navigate to:', value)
	}
</script>

<PlaySection>
	{#snippet preview()}
		<div class="flex flex-col gap-8 p-8">
			<div class="flex flex-col gap-2">
				<span class="text-sm text-surface-z5">Default (4 items)</span>
				<BreadCrumbs {items} onclick={handleClick} />
			</div>

			<div class="flex flex-col gap-2">
				<span class="text-sm text-surface-z5">Short (2 items)</span>
				<BreadCrumbs items={shortItems} onclick={handleClick} />
			</div>

			<div class="flex flex-col gap-2">
				<span class="text-sm text-surface-z5">Custom separator</span>
				<BreadCrumbs {items} separator="i-lucide:slash" onclick={handleClick} />
			</div>
		</div>
	{/snippet}
</PlaySection>
