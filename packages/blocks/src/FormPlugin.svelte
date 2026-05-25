<script lang="ts">
	import { FormRenderer } from '@rokkit/forms'
	import { DEFAULT_STATE_ICONS } from '@rokkit/core'

	interface LookupSpec {
		/** URL template with {field} placeholders. */
		url?: string
		/** Pre-loaded option list (static, JSON-serialisable). */
		source?: unknown[]
		/** Field paths this lookup depends on. */
		dependsOn?: string[]
		/** Field mapping for the response data. */
		fields?: Record<string, string>
		/** Cache duration in milliseconds. */
		cacheTime?: number
	}

	interface FormSpec {
		schema: Record<string, unknown>
		data?: Record<string, unknown>
		layout?: Record<string, unknown>
		/**
		 * Field-level lookups. Each key is a field path; the value is a
		 * LookupSpec. Only JSON-serialisable patterns are supported (url
		 * templates + source arrays). Function-typed `fetch` / `filter`
		 * hooks are dropped here — JSON can't carry callables and LLM
		 * output can't safely produce them anyway.
		 */
		lookups?: Record<string, LookupSpec>
		/**
		 * Optional human-in-the-loop hook. When present, the plugin renders
		 * a submit button labelled `submitLabel` (default "Submit"). On
		 * submit, the plugin dispatches a CustomEvent('block-action') on the
		 * root element so a parent (e.g. the chat host) can capture the
		 * structured input and route it back to the agent.
		 */
		submitAction?: string
		submitLabel?: string
	}

	/**
	 * Strip non-JSON-safe fields from incoming lookups (e.g. `fetch` /
	 * `filter` if someone tries to inject them via JSON-as-string). The
	 * builder accepts only url + source patterns from this path.
	 */
	function sanitiseLookups(
		raw: Record<string, LookupSpec> | undefined
	): Record<string, LookupSpec> | undefined {
		if (!raw || typeof raw !== 'object') return undefined
		const out: Record<string, LookupSpec> = {}
		for (const [path, lk] of Object.entries(raw)) {
			if (!lk || typeof lk !== 'object') continue
			const safe: LookupSpec = {}
			if (typeof lk.url === 'string') safe.url = lk.url
			if (Array.isArray(lk.source)) safe.source = lk.source
			if (Array.isArray(lk.dependsOn)) safe.dependsOn = lk.dependsOn
			if (lk.fields && typeof lk.fields === 'object') safe.fields = lk.fields
			if (typeof lk.cacheTime === 'number') safe.cacheTime = lk.cacheTime
			if (safe.url || safe.source) out[path] = safe
		}
		return Object.keys(out).length > 0 ? out : undefined
	}

	let { code }: { code: string } = $props()

	let showCode = $state(false)
	const icons = DEFAULT_STATE_ICONS.view

	const result = $derived.by(() => {
		try {
			const parsed = JSON.parse(code) as FormSpec
			if (!parsed || typeof parsed !== 'object' || !parsed.schema) {
				throw new Error('Expected { schema, data?, submitAction? }')
			}
			return { spec: parsed, error: null as string | null }
		} catch (e) {
			return { spec: null, error: e instanceof Error ? e.message : 'Invalid JSON' }
		}
	})

	let data = $state<Record<string, unknown>>({})
	let root = $state<HTMLElement | null>(null)
	let submitted = $state(false)

	$effect(() => {
		if (result.spec?.data) data = { ...result.spec.data }
	})

	function submit() {
		if (!root || !result.spec?.submitAction) return
		const payload = JSON.parse(JSON.stringify(data))
		root.dispatchEvent(
			new CustomEvent('block-action', {
				bubbles: true,
				detail: { name: result.spec.submitAction, payload }
			})
		)
		submitted = true
	}
</script>

{#if result.error}
	<div data-block-error class="block-error">
		<span>Form error: {result.error}</span>
		<details>
			<summary>Raw spec</summary>
			<pre>{code}</pre>
		</details>
	</div>
{:else}
	{@const spec = result.spec!}
	<div data-form-plugin bind:this={root}>
		<button
			data-form-code-toggle
			onclick={() => (showCode = !showCode)}
			title={showCode ? 'Show form' : 'Show spec'}
			aria-pressed={showCode}
		>
			<span class="i-rokkit:{showCode ? icons.chart : icons.code}"></span>
		</button>

		{#if showCode}
			<pre data-form-code>{code}</pre>
		{:else}
			<FormRenderer
				bind:data
				schema={spec.schema}
				layout={spec.layout}
				lookups={sanitiseLookups(spec.lookups) ?? {}}
			/>
			{#if spec.submitAction}
				<div data-form-actions>
					<button
						type="button"
						data-form-submit
						onclick={submit}
						disabled={submitted}
					>
						{submitted ? 'Submitted ✓' : (spec.submitLabel ?? 'Submit')}
					</button>
				</div>
			{/if}
		{/if}
	</div>
{/if}

<style>
	[data-form-plugin] {
		position: relative;
	}

	[data-form-code-toggle] {
		position: absolute;
		top: 0.375rem;
		right: 0.375rem;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 0.25rem;
		border: 1px solid currentColor;
		background: transparent;
		color: inherit;
		opacity: 0.4;
		cursor: pointer;
		transition: opacity 150ms ease;
		font-size: 1rem;
	}

	[data-form-code-toggle]:hover {
		opacity: 0.8;
	}

	[data-form-code][data-form-code] {
		margin: 0;
		padding: 1rem;
		overflow-x: auto;
		font-size: 0.75rem;
		white-space: pre-wrap;
		word-break: break-all;
	}

	[data-form-actions] {
		margin-top: 0.75rem;
		display: flex;
		justify-content: flex-end;
	}

	[data-form-submit] {
		padding: 0.4rem 0.9rem;
		border: 1px solid var(--accent, currentColor);
		border-radius: 0.375rem;
		background: var(--accent, currentColor);
		color: var(--paper, white);
		font: 500 0.85rem inherit;
		cursor: pointer;
	}

	[data-form-submit]:hover:not(:disabled) {
		filter: brightness(1.05);
	}

	[data-form-submit]:disabled {
		opacity: 0.55;
		cursor: default;
	}
</style>
