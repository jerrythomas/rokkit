<script>
	import { Icon, BreadCrumbs } from '@rokkit/elements'
	import { getContext } from 'svelte'
	import { goto } from '$app/navigation'
	import { page } from '$app/state'
	const site = getContext('site')()

	let { content, crumbs, previous, next } = $props()
	/**
	 *
	 * @param {string} route
	 */
	async function gotoPage(route) {
		if (route) {
			const location = '/' + page.params.segment + '/' + route
			await goto(location)
		}
	}
	function toggle() {
		site.sidebar = !site.sidebar
	}
</script>

<aside class="border-r-neutral-inset flex h-full w-full flex-col border-r">
	{#if content}
		<nav
			class="border-b-neutral-inset box-border flex h-10 items-center gap-1 border-b px-2 text-sm"
		>
			{#if !site.sidebar}
				<Icon
					name="i-rokkit:menu"
					class="border-r-neutral-subtle border-r"
					role="button"
					on:click={toggle}
				/>
			{/if}
			<Icon
				name="i-rokkit:arrow-left"
				role="button"
				onclick={() => gotoPage(previous)}
				class="square"
			/>
			<h1 class="w-full">
				<BreadCrumbs items={crumbs} class="text-xs" />
			</h1>
			<Icon
				name="i-rokkit:arrow-right"
				role="button"
				onclick={() => gotoPage(next)}
				class="square"
			/>
		</nav>

		{@const SvelteComponent = content}
		<notes class="markdown-body h-full w-full overflow-auto p-8 font-thin">
			<SvelteComponent />
		</notes>
	{/if}
</aside>
