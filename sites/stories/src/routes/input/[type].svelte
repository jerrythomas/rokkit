<script>
	import { inputTypes, FormFields } from '@sparsh-ui/core'
	import { omit } from 'ramda'

	// let data = { type: 'text', label: '?', placeholder: '?', readOnly: false }
	// let props
	// let fields = [
	// 	{ key: 'type', type: 'text' },
	// 	{ key: 'label', type: 'text' },
	// 	{ key: 'placeholder', type: 'text' },
	// 	{ key: 'readOnly', type: 'checkbox' }
	// ]
	export let type
	export let props
	export let fields

	// $: props = omit(['type'], variants.data)
	// $: console.log(type, variants)
</script>

<header>input types</header>
{#if props}
	<content class="flex flex-row flex-grow">
		<div class="flex flex-col items-center flex-grow p-4">
			<!-- <h1 class="leading-loose bg-gray-300 w-80 px-4">Variants</h1> -->
			<demo
				class="flex flex-col border border-skin-300 rounded-sm shadow p-4 min-w-80"
			>
				<svelte:component this={inputTypes[type]} {...props} />
			</demo>
		</div>
		<aside
			class="flex flex-col min-w-80 p-4 bg-skin-100 border-l border-light-300"
		>
			<FormFields bind:data={props} {fields} />
		</aside>
	</content>
{/if}
