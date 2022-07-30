<script>
	export let variants = []
	export let component
	export let props

	let active = 0
	$: summary = variants[active].summary
	$: props = variants[active].props
	// $: console.log(variants, summary);
</script>

<section class="flex flex-col w-full flex-grow ">
	<h1
		class="flex flex-row bg-gray-200 text-xl px-4 h-14 border-b border-gray-300 justify-between items-center"
	>
		<b>{component}</b>
		<select bind:value={active} class="px-4 py-1 rounded border border-primary">
			{#each variants as { title }, i}
				<option value={i}>{title}</option>
			{/each}
		</select>
	</h1>
	<content class="flex flex-row flex-grow">
		<div
			class="flex flex-grow flex-col items-center p-4 bg-gray-100 border-gray-300 border-r "
		>
			<slot name="component" />
			<article class="flex w-100 p-4">
				{summary}
			</article>
		</div>
		<aside class="flex flex-row w-100 bg-blue-100">
			<slot name="control" />
		</aside>
	</content>
</section>
