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

	$: console.log('rendering notes', $story.previous, $story.next)
</script>

<aside class="flex flex-col w-full h-full border-r border-r-skin-subtle">
	{#if $story}
		<nav
			class="flex h-12 gap-1 text-sm items-center border-b border-b-skin-subtle"
		>
			<!-- <Icon
				name="i-rokkit:menu"
				class="border-r border-r-skin-subtle cursor-pointer"
				on:click={toggle}
			/> -->
			<Icon
				name="i-rokkit:arrow-left"
				class="cursor-pointer {$story.previous
					? 'text-skin-muted'
					: 'text-skin-subtle'}"
				on:click={() => gotoPage($story.previous)}
			/>
			<BreadCrumbs items={$story.crumbs} />
			<Icon
				name="i-rokkit:arrow-right"
				class="cursor-pointer {$story.next
					? 'text-skin-muted'
					: 'text-skin-subtle'}"
				on:click={() => gotoPage($story.next)}
			/>
		</nav>

		<notes class="markdown-body font-thin p-8 w-full h-full overflow-auto">
			<svelte:component this={$story.readme} />
		</notes>
	{/if}
</aside>
