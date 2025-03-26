<script>
	import { afterNavigate, beforeNavigate } from '$app/navigation'
	import { ProgressBar } from '@rokkit/ui'
	let { sections = [] } = $props()

	let loading = $state(false)

	beforeNavigate(() => (loading = true))
	afterNavigate(() => (loading = false))
</script>

<header class="bg-neutral-base relative flex min-h-14 w-full items-center justify-between">
	{#if loading}
		<ProgressBar class="z-5 absolute top-0" />
	{/if}
	<span></span>
	<settings class="flex items-center justify-end gap-3 pr-4">
		<nav class="flex gap-3 pr-3 uppercase text-neutral-900">
			{#each sections as item, index (index)}
				<a
					href="/{item.slug}"
					class="active:border-secondary-700 hover:text-secondary-700 border-b-2 leading-loose"
					>{item.title}</a
				>
			{/each}
		</nav>
	</settings>
</header>
