<script>
	import Variant from '$lib/Variant.svelte'
	import { FormFields } from '@sparsh-ui/core'

	export let title
	export let props
	export let fields
	export let component
	export let variants = [{}]

	// $: console.log(fields)
</script>

<story class="flex flex-col flex-grow">
	<header class="flex flex-col justify-center">{title}</header>
	<content class="flex flex-row flex-grow w-full">
		<board class="flex flex-row flex-grow flex-wrap p-4 gap-4">
			{#each variants as variant}
				<Variant {component} {variant} {props} />
			{/each}
		</board>
		<props class="flex flex-col p-4 min-w-80 bg-skin-100">
			<FormFields bind:data={props} {fields} />
		</props>
	</content>
</story>
