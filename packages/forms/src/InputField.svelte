<script>
	import Input from './Input.svelte'

	let {
		class: className,
		name,
		value = $bindable(),
		type,
		required,
		status,
		disabled,
		dirty,
		message,
		nolabel,
		icon,
		label,
		description,
		onchange,
		id,
		renderers,
		/**
		 * Field layout — controls how the label and input are arranged.
		 *
		 * - `stacked` (default) — label above input. Best for form pages
		 *   with full-width inputs and long labels.
		 * - `inline` — label and input on the same row (label takes a
		 *   fixed leading column). Best for compact control panels —
		 *   playground knob rows, settings dialogs, tweak editors.
		 */
		variant = 'stacked',
		...restProps
	} = $props()

	let rootProps = $derived(id !== null && id !== undefined ? { id } : {})
	let properties = $derived({
		required,
		readOnly: disabled,
		...restProps,
		name
	})
</script>

<div
	data-field-root
	{...rootProps}
	class={className}
	data-field-state={status ?? message?.state}
	data-field-type={type}
	data-field-required={required}
	data-field-disabled={disabled}
	data-field-dirty={dirty || undefined}
	data-field-empty={value === null || value === undefined}
	data-has-icon={icon !== null && icon !== undefined}
	data-field-layout={variant}
>
	<div data-field aria-label={description ?? label ?? name}>
		{#if label && !nolabel}
			<label for={name}>{label}</label>
		{/if}
		<Input id={name} bind:value {type} {...properties} {onchange} {icon} {renderers} />
	</div>
	{#if description}
		<div data-description>{description}</div>
	{/if}
	{#if message}
		<div data-message data-message-state={message?.state ?? 'info'}>
			{message?.text ?? message}
		</div>
	{/if}
</div>
