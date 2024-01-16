<script>
	export let variants = []
	export let component
	export let props

	let active = 0
	$: summary = variants[active].summary
	$: props = variants[active].props
</script>

<section class="w-full flex flex-grow flex-col">
	<h1
		class="h-14 flex flex-row items-center justify-between border-b border-gray-300 bg-gray-200 px-4 text-xl"
	>
		<b>{component}</b>
		<select bind:value={active} class="border border-primary rounded px-4 py-1">
			{#each variants as { title }, i}
				<option value={i}>{title}</option>
			{/each}
		</select>
	</h1>
	<content class="flex flex-grow flex-row">
		<div class="flex flex-grow flex-col items-center border-gray-300 border-r bg-gray-100 p-4">
			<slot name="component" />
			<article class="w-100 flex p-4">
				{summary}
			</article>
		</div>
		<aside class="w-100 flex flex-row bg-blue-100">
			<slot name="control" />
		</aside>
	</content>
</section>
