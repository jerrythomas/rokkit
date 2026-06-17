<script lang="ts">
	import { defaultRenderers, resolveRenderer } from './lib/renderers.js'
	import type { Component } from 'svelte'

	type Props = {
		type?: string
		value?: unknown
		onchange?: ((value: unknown) => void) | null
		oninput?: ((value: unknown) => void) | null
		onfocus?: ((event: FocusEvent) => void) | null
		onblur?: ((event: FocusEvent) => void) | null
		icon?: string | null
		renderers?: Record<string, Component<Record<string, unknown>>>
	} & Record<string, unknown>

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
	}: Props = $props()

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
