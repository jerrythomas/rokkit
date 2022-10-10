<script>
	import { pick, omit } from 'ramda'
	import { Input } from '@svelte-spice/input'

	let className = ''
	export { className as class }
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
	$: rootProps = pick(['id'], $$restProps)
	$: props = {
		required,
		readOnly: disabled,
		...omit(['id'], $$restProps)
	}
</script>

<input-field
	{...rootProps}
	class="flex flex-col {className}"
	class:disabled
	class:pass
	class:fail
	class:warn
>
	<!-- svelte-ignore a11y-label-has-associated-control -->
	<label class="flex flex-col">
		{#if label}
			<p>{label}</p>
		{/if}
		{#if icon}
			<field class="flex flex-row w-full">
				<span class="flex aspect-square items-center justify-center h-full">
					<icon class={icon} />
				</span>
				<Input bind:value {name} {type} {...props} />
			</field>
		{:else}
			<Input bind:value {name} {type} {...props} />
		{/if}
	</label>
	{#if message}
		<message class={status}>{message}</message>
	{/if}
</input-field>
