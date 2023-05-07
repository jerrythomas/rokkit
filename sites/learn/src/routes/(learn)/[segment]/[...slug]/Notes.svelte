<script>
	import { Icon, BreadCrumbs } from '@rokkit/core'
	import { getContext } from 'svelte'
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	const story = getContext('tutorial')
	const site = getContext('site')

	function gotoPage(route) {
		if (route) goto('/' + $page.params.segment + '/' + route)
	}
	function toggle() {
		$site.sidebar = !$site.sidebar
	}
</script>

<aside class="flex flex-col w-full h-full border-r border-r-skin-subtle">
	{#if $story}
		<nav
			class="flex box-border h-10 gap-1 text-sm items-center border-b border-b-skin-subtle"
		>
			{#if !$site.sidebar}
				<Icon
					name="i-rokkit:menu"
					class="border-r border-r-skin-subtle"
					role="button"
					on:click={toggle}
				/>
			{/if}
			<Icon
				name="i-rokkit:arrow-left"
				disabled={!$story.previous}
				role="button"
				on:click={() => gotoPage($story.previous)}
			/>
			<BreadCrumbs items={$story.crumbs} />
			<Icon
				name="i-rokkit:arrow-right"
				disabled={!$story.next}
				role="button"
				on:click={() => gotoPage($story.next)}
			/>
		</nav>

		<notes class="markdown-body font-thin p-8 w-full h-full overflow-auto">
			<svelte:component this={$story.readme} />
		</notes>
	{/if}
</aside>
