<script>
	import { Icon } from '@rokkit/atoms'
	import { BreadCrumbs } from '@rokkit/molecules'
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

<aside class="h-full w-full flex flex-col border-r border-r-neutral-inset">
	{#if $story}
		<nav class="box-border h-10 flex items-center gap-1 border-b border-b-neutral-inset text-sm">
			{#if !$site.sidebar}
				<Icon
					name="i-rokkit:menu"
					class="border-r border-r-neutral-subtle"
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
			<h1 class="w-full"><BreadCrumbs items={$story.crumbs} /></h1>
			<Icon
				name="i-rokkit:arrow-right"
				disabled={!$story.next}
				role="button"
				on:click={() => gotoPage($story.next)}
			/>
		</nav>

		<notes class="markdown-body h-full w-full overflow-auto p-8 font-thin">
			<svelte:component this={$story.readme} />
		</notes>
	{/if}
</aside>
