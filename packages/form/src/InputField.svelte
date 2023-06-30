<script>
	import { pick, omit } from 'ramda'
	import { Input } from 'rokkit/atoms'

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
	class:empty={!value}
>
	<label for={name} class:required>
		{label}
	</label>

	<!-- <Input bind:value {name} {type} {...props} /> -->
	<!-- </field> -->
	<!-- {:else} -->
	<field class="w-full flex flex-row items-center">
		{#if icon}
			<span
				class="aspect-square flex flex-shrink-0 items-center justify-center"
			>
				<icon class={icon} />
			</span>
		{/if}
		<Input id={name} bind:value {name} {type} {...props} />
	</field>
	<!-- {/if} -->
	{#if message}
		<message class={status}>{message}</message>
	{/if}
</input-field>
