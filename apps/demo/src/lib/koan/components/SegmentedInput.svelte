<script lang="ts">
	/**
	 * Compact segmented input for enum-typed Tweaks. Renders as a
	 * single-row pill-strip of buttons — same vertical footprint as a
	 * select, none of the dropdown indirection. The selected option is
	 * highlighted; clicking any other option commits the change.
	 *
	 * Wired into FormRenderer via the `renderers` prop on
	 * `<FormRenderer renderers={{ segmented: SegmentedInput }} />`,
	 * driven by `renderer: 'segmented'` on the enum element. The
	 * lookups source provides the option list at runtime.
	 */
	interface Props {
		value: unknown
		options?: string[]
		lookup?: { source?: string[] }
		disabled?: boolean
		onchange?: (value: unknown) => void
		[key: string]: unknown
	}

	let {
		value = $bindable(),
		options = [],
		lookup,
		disabled = false,
		onchange
	}: Props = $props()

	// FormRenderer hands the layout element's `lookup` (resolved lookups
	// for this field) — fall back to it when options aren't passed inline.
	const items = $derived(options.length > 0 ? options : lookup?.source ?? [])

	function pick(opt: string) {
		if (disabled || opt === value) return
		value = opt
		onchange?.(opt)
	}
</script>

<div data-segmented role="radiogroup" aria-disabled={disabled || undefined}>
	{#each items as opt (opt)}
		<button
			type="button"
			role="radio"
			data-segmented-opt
			data-active={opt === value ? '' : undefined}
			aria-checked={opt === value}
			{disabled}
			onclick={() => pick(opt)}
		>
			{opt}
		</button>
	{/each}
</div>

<style>
	[data-segmented] {
		display: inline-flex;
		flex-wrap: nowrap;
		padding: 2px;
		border: 1px solid var(--paper-edge);
		border-radius: 6px;
		background: var(--paper-soft);
		gap: 1px;
		max-width: 100%;
		overflow: hidden;
	}

	[data-segmented-opt] {
		flex: 1 1 auto;
		min-width: 0;
		padding: 3px 10px;
		border: 0;
		background: transparent;
		color: var(--ink-mute);
		font: 500 12px var(--font-ui);
		border-radius: 4px;
		cursor: pointer;
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
		transition:
			background 120ms ease,
			color 120ms ease;
	}

	[data-segmented-opt]:hover:not(:disabled) {
		color: var(--ink);
		background: var(--paper);
	}

	[data-segmented-opt][data-active] {
		background: var(--paper);
		color: var(--ink);
		font-weight: 500;
		box-shadow: 0 1px 2px color-mix(in oklch, var(--ink) 8%, transparent);
	}

	[data-segmented-opt]:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
