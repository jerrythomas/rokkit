<script lang="ts">
	/**
	 * Inline tweaks editor — wraps `<FormRenderer />` from @rokkit/forms so
	 * the demo dogfoods its own form package. The DemoPropSchema each demo
	 * declares is adapted on the fly into FormRenderer's schema + layout +
	 * lookups shape; renderer choice per type:
	 *
	 *   enum    → `radio`   (compact segmented feel via lookups source)
	 *   boolean → `toggle`
	 *   string  → `text`
	 *   number  → `number`
	 *
	 * The form's onupdate fires with the full data object each change; we
	 * diff against the previous values and emit a per-field onchange to
	 * the parent so the chat-left can log "prop: from → to" turns.
	 *
	 * Header carries the playground actions (Reset, Copy) which sit
	 * outside FormRenderer's own action bar — the form is value-only,
	 * no submit step.
	 */
	import { FormRenderer } from '@rokkit/forms'
	import type { DemoPropSchema } from '$lib/koan/types'

	interface Props {
		schema: Record<string, DemoPropSchema>
		values: Record<string, unknown>
		onchange?: (name: string, value: unknown) => void
		onreset?: () => void
		oncopy?: () => void
	}

	const { schema: propsSchema, values, onchange, onreset, oncopy }: Props = $props()

	/**
	 * Build the FormRenderer spec from a DemoPropSchema. Returns the
	 * triple { schema, layout, lookups } plus seed `data` populated with
	 * each prop's current value (falling back to the schema default).
	 */
	function buildFormSpec(specs: Record<string, DemoPropSchema>, current: Record<string, unknown>) {
		const properties: Record<string, { type: string }> = {}
		const elements: Array<Record<string, unknown>> = []
		const lookups: Record<string, { source: string[]; filter: (src: string[]) => string[] }> = {}
		const data: Record<string, unknown> = {}

		for (const [name, spec] of Object.entries(specs)) {
			data[name] = current[name] ?? spec.default
			const element: Record<string, unknown> = {
				scope: `#/${name}`,
				label: spec.label ?? name,
				description: spec.desc
			}
			if (spec.type === 'enum') {
				properties[name] = { type: 'string' }
				// 2-option enums collapse to a select for a compact one-row
				// control (radio is too tall in the slab). 3+ options also
				// use select so the slab doesn't grow with the option count.
				element.renderer = 'select'
				lookups[name] = { source: spec.options, filter: (src) => src }
				// Selects + their label read better stacked (label above)
				// than inline at narrow slab widths.
				element.variant = 'stacked'
			} else if (spec.type === 'boolean') {
				properties[name] = { type: 'boolean' }
				element.renderer = 'toggle'
				// Toggles look natural inline — label on the left, switch
				// on the right (matches the global default for switch/
				// checkbox/toggle in input.css).
				element.variant = 'inline'
			} else if (spec.type === 'string') {
				properties[name] = { type: 'string' }
				element.renderer = 'text'
				if (spec.placeholder) element.placeholder = spec.placeholder
				element.variant = 'stacked'
			} else if (spec.type === 'number') {
				properties[name] = { type: 'number' }
				element.renderer = 'number'
				if (spec.min !== undefined) element.min = spec.min
				if (spec.max !== undefined) element.max = spec.max
				if (spec.step !== undefined) element.step = spec.step
				element.variant = 'stacked'
			}
			elements.push(element)
		}

		return {
			schema: { type: 'object', properties },
			layout: { type: 'vertical', elements },
			lookups,
			data
		}
	}

	const spec = $derived(buildFormSpec(propsSchema, values))
	let formData = $state<Record<string, unknown>>(spec.data)
	let prev = $state<Record<string, unknown>>({ ...spec.data })

	/** Diff the incoming data against `prev` and emit per-field changes. */
	function handleUpdate(next: Record<string, unknown>) {
		for (const [k, v] of Object.entries(next)) {
			if (prev[k] !== v) onchange?.(k, v)
		}
		prev = { ...next }
	}
</script>

<div data-tweaks role="group" aria-label="Component prop editor">
	<header data-tweaks-head>
		<span class="i-mdi:tune-variant" aria-hidden="true"></span>
		<span data-tweaks-title>Tweak props</span>
		<span data-tweaks-hint>Live edits to the canvas component</span>
		<span data-tweaks-spacer></span>
		{#if oncopy}
			<button type="button" data-tweaks-action onclick={oncopy} title="Copy props as JSON">
				<span class="action-copy" aria-hidden="true"></span>
				<span>Copy</span>
			</button>
		{/if}
		{#if onreset}
			<button type="button" data-tweaks-action onclick={onreset} title="Reset to defaults">
				<span class="action-retry" aria-hidden="true"></span>
				<span>Reset</span>
			</button>
		{/if}
	</header>

	<div data-tweaks-body>
		<FormRenderer
			bind:data={formData}
			schema={spec.schema}
			layout={spec.layout}
			lookups={spec.lookups}
			validateOn="change"
			onupdate={handleUpdate}
		/>
	</div>
</div>

<style>
	[data-tweaks] {
		display: flex;
		flex-direction: column;
		border: 1px solid var(--paper-edge);
		border-radius: 8px;
		background: var(--paper);
		overflow: hidden;
	}

	[data-tweaks-head] {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 12px;
		border-bottom: 1px solid var(--paper-edge);
		background: var(--paper-soft);
		font: 500 12px var(--font-ui);
		color: var(--ink-mute);
	}

	[data-tweaks-head] .i-mdi\:tune-variant {
		width: 14px;
		height: 14px;
		color: var(--ink-soft);
	}

	[data-tweaks-title] {
		color: var(--ink);
		font-weight: 500;
	}

	[data-tweaks-hint] {
		color: var(--ink-soft);
		font: 400 11px var(--font-ui);
	}

	[data-tweaks-spacer] {
		flex: 1;
	}

	[data-tweaks-action] {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 3px 8px;
		border: 1px solid var(--paper-edge);
		border-radius: 4px;
		background: var(--paper);
		color: var(--ink-mute);
		font: 500 11px var(--font-ui);
		cursor: pointer;
	}

	[data-tweaks-action]:hover {
		border-color: var(--ink-soft);
		color: var(--ink);
	}

	[data-tweaks-action] > span:first-child {
		width: 12px;
		height: 12px;
	}

	[data-tweaks-body] {
		padding: 6px 12px 10px;
	}

	/* Hide FormRenderer's auto-emitted Reset + Submit bar — tweaks
	   save on every change and our own header carries Copy + Reset.
	   The per-field inline layout (label-left, input-right) is opted
	   into via `variant: 'inline'` on each layout element, so no
	   density overrides are needed here. */
	[data-tweaks-body] :global([data-form-actions]) {
		display: none;
	}

	[data-tweaks-body] :global([data-form-field]) {
		margin-bottom: 8px;
	}

	[data-tweaks-body] :global([data-form-field]:last-child) {
		margin-bottom: 0;
	}
</style>
