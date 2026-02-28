<script>
	let {
		class: className,
		name,
		value,
		label,
		description
	} = $props()
</script>

<div
	data-field-root
	class={className}
	data-field-type="info"
	data-field-empty={value === null || value === undefined}
>
	<div data-field aria-label={description ?? label ?? name}>
		{#if label}
			<label for={name}>{label}</label>
		{/if}
		<span data-field-info>{value === undefined ? '—' : String(value)}</span>
	</div>
	{#if description}
		<div data-description>{description}</div>
	{/if}
</div>
