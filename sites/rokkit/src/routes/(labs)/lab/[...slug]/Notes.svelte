<script>
	import { Icon, BreadCrumbs } from '@rokkit/core'
	export let readmeFile
	export let crumbs = []

	let readme
	async function loadReadme() {
		if (!readmeFile) {
			console.error(`No readme file found for ${path}`)
		}

		try {
			readme = (await import(/* @vite-ignore */ readmeFile)).default
		} catch (error) {
			console.error(error)
		}
	}
	$: loadReadme()
</script>

<aside class="flex flex-col w-1/3 min-w-120 border-r border-r-skin-subtle">
	<nav
		class="flex pr-4 h-12 gap-1 text-sm items-center border-b border-b-skin-subtle"
	>
		<Icon name="i-rokkit:menu" class="border-r border-r-skin-subtle" />
		<icon class="i-rokkit:arrow-left text-skin-muted" />
		<BreadCrumbs items={crumbs} />
		<icon class="i-rokkit:arrow-right text-skin-muted" />
	</nav>
	{#if readme}
		<notes class="markdown-body font-thin p-8 w-full h-full overflow-auto">
			<svelte:component this={readme} />
		</notes>
	{/if}
</aside>
