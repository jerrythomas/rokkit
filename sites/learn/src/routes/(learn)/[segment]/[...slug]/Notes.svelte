<script>
	import { Icon, BreadCrumbs } from '@rokkit/ui'
	import { getContext } from 'svelte'
	import { goto, invalidate } from '$app/navigation'
	import { page } from '$app/state'
	const story = getContext('tutorial')()
	const site = getContext('site')()

	/**
	 *
	 * @param {string} route
	 */
	async function gotoPage(route) {
		if (route) {
			const location = '/' + page.params.segment + '/' + route
			await invalidate((url) => url.pathname !== location)
			await goto(location)
		}
	}
	function toggle() {
		site.sidebar = !site.sidebar
	}

	function getRouteURL(route) {
		return route ? '/' + page.params.segment + '/' + route : page.url.pathname
	}
	let previousUrl = $derived(getRouteURL(story.previous))
	let nextUrl = $derived(getRouteURL(story.next))
</script>

<aside class="border-r-neutral-inset flex h-full w-full flex-col border-r">
	{#if story}
		<nav class="border-b-neutral-inset box-border flex h-10 items-center gap-1 border-b text-sm">
			{#if !site.sidebar}
				<Icon
					name="i-rokkit:menu"
					class="border-r-neutral-subtle border-r"
					role="button"
					on:click={toggle}
				/>
			{/if}
			<a href={previousUrl}>
				<Icon name="i-rokkit:arrow-left" disabled={!story.previous} />
			</a>
			<h1 class="w-full"><BreadCrumbs items={story.crumbs} class="text-xs" /></h1>
			<a href={nextUrl}>
				<Icon name="i-rokkit:arrow-right" disabled={!story.next} } />
			</a>
		</nav>

		{@const SvelteComponent = story.readme}
		<notes class="markdown-body h-full w-full overflow-auto p-8 font-thin">
			<SvelteComponent />
		</notes>
	{/if}
</aside>
