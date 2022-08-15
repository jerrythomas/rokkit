<script>
	import InputWrapper from '../base/InputWrapper.svelte'

	let className = ''
	export { className as class }
	export let id = null
	export let name
	export let label = null
	export let icon = null
	export let value
	export let type = 'text'
	export let required = false
	export let status = 'default'
	export let disabled = false
	export let message = null

	$: pass = status === 'pass'
	$: fail = status === 'fail'
	$: warn = status === 'warn'

	$: props = {
		required,
		readOnly: disabled,
		...$$restProps
	}
</script>

<input-field
	{id}
	class="flex flex-col {className}"
	class:disabled
	class:pass
	class:fail
	class:warn
>
	<!-- svelte-ignore a11y-label-has-associated-control -->
	<label class="flex flex-col">
		{#if label}
			<p for={id}>{label}</p>
		{/if}
		{#if icon}
			<field class="flex flex-row w-full">
				<span class="flex aspect-square items-center justify-center h-full">
					<icon class={icon} />
				</span>
				<InputWrapper bind:value {id} {name} {type} {...props} />
			</field>
		{:else}
			<InputWrapper bind:value {id} {name} {type} {...props} />
		{/if}
	</label>
	{#if message}
		<message class={status}>{message}</message>
	{/if}
</input-field>
