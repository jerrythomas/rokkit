<script lang="ts">
	/**
	 * Chat-left details slab — currently surfaces the Tweaks editor.
	 *
	 * Previously this housed Tweaks + API + Source tabs, but:
	 *   - **Source** lives next to the live demo on the canvas already
	 *   - **API** moved into the canvas via the [Live | API] segmented
	 *     control on the canvas head — tabular content reads better at
	 *     canvas width than at the 350-ish-px slab width
	 *
	 * The wrapper survives so the composer pill still has a place to
	 * mount more chat-side controls later (e.g. a future "Notes" tab).
	 */
	import Tweaks from './Tweaks.svelte'
	import type { DemoPropSchema } from '../types'

	interface Props {
		demoId: string
		propsSchema?: Record<string, DemoPropSchema>
		tweakValues?: Record<string, unknown>
		onTweakChange?: (name: string, value: unknown) => void
		onTweakReset?: () => void
		onTweakCopy?: () => void
	}

	const {
		propsSchema,
		tweakValues = {},
		onTweakChange,
		onTweakReset,
		onTweakCopy
	}: Props = $props()
</script>

<div data-details-slab role="group" aria-label="Tweak editor">
	{#if propsSchema && Object.keys(propsSchema).length > 0}
		<Tweaks
			schema={propsSchema}
			values={tweakValues}
			onchange={onTweakChange}
			onreset={onTweakReset}
			oncopy={onTweakCopy}
		/>
	{:else}
		<p data-details-empty>No tweakable props declared for this demo yet.</p>
	{/if}
</div>

<style>
	[data-details-slab] {
		display: flex;
		flex-direction: column;
	}

	[data-details-empty] {
		padding: 24px 8px;
		text-align: center;
		color: var(--ink-mute);
		font: 400 12px var(--font-ui);
	}
</style>
