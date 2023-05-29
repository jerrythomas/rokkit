<script>
	import Variant from './review/Variant.svelte'
	import { FieldLayout } from '@rokkit/form'

	export let title
	export let props
	export let fields
	export let component
	export let variants = [{}]
</script>

<story class="grid h-full">
	<header class="flex flex-col justify-center">{title}</header>
	<h1 class="flex flex-col items-center justify-center bg-skin-300">
		Properties
	</h1>
	<content class="flex flex-grow flex-row items-center justify-around p-4">
		<board class="flex flex-row flex-wrap gap-4 p-4">
			{#each variants as variant}
				<Variant {component} {variant} {props} />
			{/each}
		</board>
	</content>
	<props class="min-w-80 flex flex-col bg-skin-100 p-4">
		<FieldLayout bind:data={props} {fields} />
	</props>
</story>

<style>
	story {
		grid-template-rows: 3.5em auto 20rem;
		grid-template-columns: 8fr 2fr;
		grid-template-areas:
			'header propHeader'
			'content props'
			'desc props';
	}
	header {
		grid-area: header;
	}
	content {
		grid-area: content;
	}
	props {
		grid-area: props;
	}
</style>
