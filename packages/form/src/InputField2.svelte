<script>
	import Field from './Field.svelte'
	import Message from './Message.svelte'
	import { Input } from '@svelte-spice/input'

	let className = ''
	export { className as class }
	export let value
	export let type = 'string'
	export let name
	export let label = null
	export let hasChanged = false
	export let status = 'default'
	export let disabled = false
	export let message = {}
	export let icons = {}

	$: pass = status === 'pass'
	$: fail = status === 'fail'
	$: warn = status === 'warn'
</script>

<input-field
	class="flex flex-col {className}"
	class:disabled
	class:pass
	class:fail
	class:warn
>
	<!-- svelte-ignore a11y-label-has-associated-control -->
	<label class="flex flex-col">
		{#if label}
			{label}
		{/if}
		<Field {...icons}>
			<Input
				{type}
				{name}
				bind:value
				{...$$restProps}
				on:change={() => (hasChanged = true)}
			/>
		</Field>
	</label>
	<Message {...message} />
</input-field>
