<script>
	import { Icon, iconStore, toHyphenCase, sortByParts } from '@sparsh-ui/icons'

	export let icons = {}
	export let name
	export let iconClass

	$: iconStore.set(icons)
	$: names = Object.keys(icons)
		.map((name) => toHyphenCase(name))
		.sort(sortByParts)
</script>

<section class="flex flex-col gap-4 p-4">
	<h1 class="font-bold text-lg px-4">{name}</h1>
	<div class="flex flex-row flex-wrap gap-4 px-4">
		{#each names as name}
			<div class="flex flex-col w-40 h-32 border rounded-md">
				<Icon {name} class={iconClass} />
				<p class="flex text-xs justify-center py-2">{name}</p>
			</div>
		{/each}
	</div>
</section>
