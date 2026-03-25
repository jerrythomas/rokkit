<script>
	import { defaultRenderers, resolveRenderer } from './lib/renderers.js'

	let {
		type = 'text',
		value = $bindable(),
		onchange = null,
		oninput = null,
		onfocus = null,
		onblur = null,
		icon = null,
		renderers = {},
		...restProps
	} = $props()

	const allRenderers = $derived({ ...defaultRenderers, ...renderers })
	const extraProps = $derived(type === 'integer' ? { step: '1' } : {})
</script>

{#if type === 'checkbox' || type === 'swatch'}
	{@const Component = resolveRenderer({ type, props: restProps }, allRenderers)}
	<Component bind:value {onchange} {oninput} {onfocus} {onblur} {...restProps} />
{:else}
	{@const Component = resolveRenderer({ type, props: restProps }, allRenderers)}
	<div data-input-root>
		{#if icon}
			<span data-input-icon class={icon} aria-hidden="true"></span>
		{/if}
		<Component bind:value {onchange} {oninput} {onfocus} {onblur} {...extraProps} {...restProps} />
	</div>
{/if}
