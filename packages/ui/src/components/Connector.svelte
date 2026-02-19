<script lang="ts">
	/**
	 * Connector Component
	 *
	 * Renders tree line connectors for hierarchical visualizations.
	 * Supports RTL (right-to-left) layouts.
	 *
	 * Based on @rokkit/ui Connector implementation.
	 */

	import type { ConnectorType } from '../types/tree.js'

	interface Props {
		/** The type of connector to render */
		type?: ConnectorType
		/** Right-to-left layout support */
		rtl?: boolean
	}

	const { type = 'empty', rtl = false }: Props = $props()

	const validTypes: ConnectorType[] = ['last', 'child', 'sibling', 'empty']
	const validatedType = $derived(validTypes.includes(type) ? type : 'empty')
</script>

<span data-connector data-connector-type={validatedType} data-connector-rtl={rtl || undefined}>
	{#if validatedType === 'last'}
		{#if rtl}
			<i data-connector-v></i>
			<i data-connector-corner></i>
		{:else}
			<i data-connector-v></i>
			<i data-connector-h></i>
		{/if}
	{:else if validatedType === 'child'}
		{#if rtl}
			<i data-connector-v data-connector-full></i>
			<i data-connector-corner></i>
		{:else}
			<i data-connector-v data-connector-full></i>
			<i data-connector-h></i>
		{/if}
	{:else if validatedType === 'sibling'}
		<i data-connector-v data-connector-full></i>
	{/if}
</span>
