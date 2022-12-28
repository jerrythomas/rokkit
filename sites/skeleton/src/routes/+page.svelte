<script>
	import GraphPaper from '$lib/GraphPaper.svelte'
	import { InputField } from '@rokkit/form'

	let items = [{ text: 'Minimal' }, { text: 'Material' }, { text: 'Spicy' }]
	let value
	let name = null
</script>

<section class="flex flex-col flex-grow items-center justify-center">
	<GraphPaper class="purple">
		<!-- <input-field
			class="border border-skin-800 flex flex-col relative leading-loose text-skin-900"
		>
			<input
				type="text"
				id="name"
				placeholder="name"
				name="name"
				bind:value={name}
				class="flex leading-loose px-2 outline-none"
			/>
			<label for="name" class="required" class:has-value={name != null}>
				Name
			</label>
		</input-field> -->

		<InputField
			type="text"
			label="name"
			placeholder="name"
			required
			icon="i-spice-palette"
		/>
	</GraphPaper>
</section>
<section>description</section>
