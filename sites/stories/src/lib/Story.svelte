<script>
	import { FormFields } from '@sparsh-ui/core'

	export let title
	export let props
	export let fields
	export let component
	export let variants = [{}]

	$: console.log(fields)
</script>

<story class="flex flex-col flex-grow">
	<header class="flex flex-col justify-center">{title}</header>
	<content class="flex flex-row flex-grow w-full">
		<board class="flex flex-col flex-grow items-center p-4">
			{#each variants as variantProps}
				<variant
					class="flex flex-col border border-skin-300 rounded-sm shadow p-4 min-w-80"
				>
					<svelte:component this={component} {...variantProps} {...props} />
				</variant>
			{/each}
		</board>
		<props class="flex flex-col p-4 min-w-80 bg-skin-100">
			<FormFields bind:data={props} {fields} />
		</props>
	</content>
</story>
