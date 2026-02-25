<script lang="ts">
	import { BreadCrumbs } from '@rokkit/ui'
	import Playground from '$lib/Playground.svelte'

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

	function handleClick(value: unknown) {
		console.log('Navigate to:', value)
	}
</script>

<Playground
	title="BreadCrumbs"
	description="Navigation breadcrumbs showing the current location within a hierarchy."
>
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
</Playground>
