<script>
	import { onMount } from 'svelte'
	import { Tabs } from '@rokkit/core'
	export let data

	const fields = {
		text: 'title'
	}

	let page = null
	let pages = []
	onMount(async () => {
		pages = (await import(`./${data.current.path}`)).pages
		page = pages[0]
	})
</script>

{#if pages.length > 0}
	<Tabs items={pages} {fields} bind:value={page}>
		<div class="prose text-skin-900">
			<svelte:component this={page.content} />
		</div>
	</Tabs>
{/if}
