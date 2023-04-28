<script>
	import { Icon, BreadCrumbs } from '@rokkit/core'
	import { getContext } from 'svelte'

	const story = getContext('tutorial')
	const site = getContext('site')

	function toggle() {
		$site.sidebar = !$site.sidebar
	}
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
			<Icon name="i-rokkit:arrow-left" class="cursor-pointer text-skin-muted" />
			<BreadCrumbs items={$story.crumbs} />
			<Icon
				name="i-rokkit:arrow-right"
				class="cursor-pointer text-skin-muted"
			/>
		</nav>

		<notes class="markdown-body font-thin p-8 w-full h-full overflow-auto">
			<svelte:component this={$story.readme} />
		</notes>
	{/if}
</aside>
