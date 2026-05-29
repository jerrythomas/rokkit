<script lang="ts">
	/**
	 * Inline tweaks — renders editable prop controls based on a demo's
	 * `props` schema. Mounts as a message inside the chat response stream.
	 * Each control change calls `onchange(propName, newValue)`; the parent
	 * layout writes into a `tweakProps` $state map that the canvas mount
	 * spreads after the variant props.
	 *
	 * Re-anchor behavior: the parent re-renders this card as a new
	 * assistant turn on each change, so the most-recent state always sits
	 * near the composer while the older snapshots stay in the scrollback
	 * as part of the conversation history.
	 */
	import type { DemoPropSchema } from '$lib/koan/types'

	interface Props {
		schema: Record<string, DemoPropSchema>
		values: Record<string, unknown>
		onchange?: (name: string, value: unknown) => void
		onreset?: () => void
		oncopy?: () => void
	}

	const { schema, values, onchange, onreset, oncopy }: Props = $props()

	function currentValue(name: string): unknown {
		const v = values[name]
		if (v !== undefined) return v
		return schema[name]?.default
	}

	function isEnum(s: DemoPropSchema): s is Extract<DemoPropSchema, { type: 'enum' }> {
		return s.type === 'enum'
	}
	function isBool(s: DemoPropSchema): s is Extract<DemoPropSchema, { type: 'boolean' }> {
		return s.type === 'boolean'
	}
	function isStr(s: DemoPropSchema): s is Extract<DemoPropSchema, { type: 'string' }> {
		return s.type === 'string'
	}
	function isNum(s: DemoPropSchema): s is Extract<DemoPropSchema, { type: 'number' }> {
		return s.type === 'number'
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

	<ul data-tweaks-list>
		{#each Object.entries(schema) as [name, spec] (name)}
			<li data-tweaks-row>
				<div data-tweaks-label>
					<span data-tweaks-name>{spec.label ?? name}</span>
					{#if spec.desc}<span data-tweaks-desc>{spec.desc}</span>{/if}
				</div>
				<div data-tweaks-control>
					{#if isEnum(spec)}
						<div data-tweaks-segmented role="radiogroup" aria-label={name}>
							{#each spec.options as opt (opt)}
								{@const active = currentValue(name) === opt}
								<button
									type="button"
									data-tweaks-segment
									data-active={active ? '' : undefined}
									role="radio"
									aria-checked={active}
									onclick={() => onchange?.(name, opt)}
								>
									{opt}
								</button>
							{/each}
						</div>
					{:else if isBool(spec)}
						{@const v = Boolean(currentValue(name))}
						<button
							type="button"
							data-tweaks-toggle
							data-on={v ? '' : undefined}
							role="switch"
							aria-checked={v}
							onclick={() => onchange?.(name, !v)}
						>
							<span data-tweaks-toggle-thumb></span>
							<span data-tweaks-toggle-label>{v ? 'on' : 'off'}</span>
						</button>
					{:else if isStr(spec)}
						<input
							type="text"
							data-tweaks-input
							value={currentValue(name) as string}
							placeholder={spec.placeholder ?? ''}
							oninput={(e) => onchange?.(name, (e.currentTarget as HTMLInputElement).value)}
						/>
					{:else if isNum(spec)}
						<input
							type="number"
							data-tweaks-input
							value={currentValue(name) as number}
							min={spec.min}
							max={spec.max}
							step={spec.step ?? 1}
							oninput={(e) => onchange?.(name, Number((e.currentTarget as HTMLInputElement).value))}
						/>
					{/if}
				</div>
			</li>
		{/each}
	</ul>
</div>

<style>
	[data-tweaks] {
		display: flex;
		flex-direction: column;
		gap: 0;
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

	[data-tweaks-list] {
		list-style: none;
		margin: 0;
		padding: 6px 12px 10px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	[data-tweaks-row] {
		display: grid;
		grid-template-columns: 120px 1fr;
		align-items: center;
		gap: 12px;
	}

	[data-tweaks-label] {
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	[data-tweaks-name] {
		font: 500 11.5px var(--font-mono);
		color: var(--ink);
		letter-spacing: 0.02em;
	}

	[data-tweaks-desc] {
		font: 400 10.5px var(--font-ui);
		color: var(--ink-soft);
		line-height: 1.3;
	}

	[data-tweaks-control] {
		min-width: 0;
	}

	[data-tweaks-segmented] {
		display: inline-flex;
		gap: 0;
		border: 1px solid var(--paper-edge);
		border-radius: 4px;
		overflow: hidden;
		background: var(--paper-soft);
	}

	[data-tweaks-segment] {
		padding: 3px 8px;
		border: 0;
		border-right: 1px solid var(--paper-edge);
		background: transparent;
		font: 500 11px var(--font-mono);
		color: var(--ink-mute);
		cursor: pointer;
	}

	[data-tweaks-segment]:last-child {
		border-right: 0;
	}

	[data-tweaks-segment]:hover {
		color: var(--ink);
	}

	[data-tweaks-segment][data-active] {
		background: var(--accent);
		color: var(--on-primary, var(--paper));
	}

	[data-tweaks-toggle] {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 2px 8px 2px 4px;
		border: 1px solid var(--paper-edge);
		border-radius: 9999px;
		background: var(--paper-soft);
		cursor: pointer;
	}

	[data-tweaks-toggle-thumb] {
		display: inline-block;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: var(--ink-soft);
		transition: background 120ms ease;
	}

	[data-tweaks-toggle][data-on] [data-tweaks-toggle-thumb] {
		background: var(--accent);
	}

	[data-tweaks-toggle-label] {
		font: 500 10.5px var(--font-mono);
		color: var(--ink-mute);
		min-width: 18px;
	}

	[data-tweaks-input] {
		width: 100%;
		padding: 3px 8px;
		border: 1px solid var(--paper-edge);
		border-radius: 4px;
		background: var(--paper-soft);
		color: var(--ink);
		font: 400 12px var(--font-mono);
	}

	[data-tweaks-input]:focus {
		outline: none;
		border-color: var(--accent);
	}
</style>
