<script lang="ts">
	import { FormRenderer } from '@rokkit/forms'
	import { CodeBlock, Frame } from '@rokkit/ui'
	import { pluginDisplay } from './config.svelte.js'

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
	/**
	 * The allowlist itself: field name → the shape its value must have. Anything
	 * absent from this table is dropped, which is what makes `fetch` / `filter`
	 * unreachable from the JSON path regardless of what the input claims.
	 */
	const LOOKUP_FIELDS: Array<[keyof LookupSpec, (v: unknown) => boolean]> = [
		['url', (v) => typeof v === 'string'],
		['source', Array.isArray],
		['dependsOn', Array.isArray],
		['fields', (v) => Boolean(v) && typeof v === 'object'],
		['cacheTime', (v) => typeof v === 'number']
	]

	/** Copy across only allowlisted fields whose value has the expected shape. */
	function sanitiseLookup(lk: unknown): LookupSpec | null {
		if (!lk || typeof lk !== 'object') return null
		const source = lk as Record<string, unknown>
		const safe: Record<string, unknown> = {}
		for (const [key, isValid] of LOOKUP_FIELDS) {
			if (isValid(source[key])) safe[key] = source[key]
		}
		// A lookup with neither a url nor a source can never resolve options.
		return safe.url || safe.source ? (safe as LookupSpec) : null
	}

	function sanitiseLookups(
		raw: Record<string, LookupSpec> | undefined
	): Record<string, LookupSpec> | undefined {
		if (!raw || typeof raw !== 'object') return undefined
		const out: Record<string, LookupSpec> = {}
		for (const [path, lk] of Object.entries(raw)) {
			const safe = sanitiseLookup(lk)
			if (safe) out[path] = safe
		}
		return Object.keys(out).length > 0 ? out : undefined
	}

	let { code }: { code: string } = $props()

	let showCode = $state(false)
	let root = $state<HTMLElement | null>(null)
	let submitted = $state(false)

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

	const spec = $derived(result.spec)
	const prettyCode = $derived(spec ? JSON.stringify(spec, null, 2) : code)

	const summary = $derived.by(() => {
		if (!spec) return [] as Array<{ label: string; value: string }>
		const parts: Array<{ label: string; value: string }> = []
		const schema = spec.schema as { properties?: Record<string, unknown> } | undefined
		const fieldCount = schema?.properties ? Object.keys(schema.properties).length : 0
		if (fieldCount) parts.push({ label: 'fields', value: `[${fieldCount}]` })
		if (spec.lookups) parts.push({ label: 'lookups', value: `[${Object.keys(spec.lookups).length}]` })
		if (spec.submitAction) parts.push({ label: 'action', value: String(spec.submitAction) })
		return parts
	})

	let data = $state<Record<string, unknown>>({})

	$effect(() => {
		if (spec?.data) data = { ...spec.data }
	})

	function submit() {
		if (!root || !spec?.submitAction) return
		const payload = JSON.parse(JSON.stringify(data))
		root.dispatchEvent(
			new CustomEvent('block-action', {
				bubbles: true,
				detail: { name: spec.submitAction, payload }
			})
		)
		submitted = true
	}

	async function copyCode() {
		try {
			await navigator.clipboard.writeText(prettyCode)
		} catch {
			// clipboard may be unavailable (insecure context); silent fail.
		}
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
	<div data-form-plugin bind:this={root}>
		<Frame flush>
			<div data-form-body class="form-body-inset">
				<FormRenderer
					bind:data
					schema={spec!.schema}
					layout={spec!.layout}
					lookups={sanitiseLookups(spec!.lookups) ?? {}}
				/>
				{#if spec!.submitAction}
					<div data-form-actions>
						<button
							type="button"
							data-form-submit
							onclick={submit}
							disabled={submitted}
						>
							{submitted ? 'Submitted ✓' : (spec!.submitLabel ?? 'Submit')}
						</button>
					</div>
				{/if}
			</div>

			{#snippet footer()}
				<div data-form-footer>
					{#if summary.length}
						<div data-form-summary>
							{#each summary as part, i (part.label)}
								{#if i > 0}<span data-sep>·</span>{/if}
								<span data-form-summary-label>{part.label}</span>
								<span data-form-summary-value>{part.value}</span>
							{/each}
						</div>
					{:else}
						<span></span>
					{/if}

					{#if pluginDisplay.codeVisible}
						<div data-form-actions-row>
							<button
								type="button"
								data-form-action
								data-form-code-toggle
								onclick={() => (showCode = !showCode)}
								aria-pressed={showCode}
								title={showCode ? 'Hide code' : 'View code'}
							>
								<span class={showCode ? 'view-off' : 'view-code'} aria-hidden="true"></span>
								<span>{showCode ? 'Hide code' : 'View code'}</span>
							</button>
							<button type="button" data-form-action onclick={copyCode} title="Copy spec to clipboard">
								<span class="action-copy" aria-hidden="true"></span>
								<span>Copy code</span>
							</button>
						</div>
					{/if}
				</div>
			{/snippet}
		</Frame>

		{#if showCode && pluginDisplay.codeVisible}
			<CodeBlock
				code={prettyCode}
				language="json"
				filename="form.json"
			/>
		{/if}
	</div>
{/if}

<style>
	.form-body-inset {
		padding: 8px 12px 4px;
	}

	[data-form-footer] {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		flex-wrap: wrap;
	}

	[data-form-summary] {
		display: inline-flex;
		align-items: baseline;
		flex-wrap: wrap;
		gap: 4px;
		font: 500 11px var(--font-mono);
		color: var(--ink-mute);
		letter-spacing: 0.04em;
	}

	[data-form-summary-label] {
		color: var(--ink-mute);
	}

	[data-form-summary-value] {
		color: var(--ink);
	}

	[data-form-summary] [data-sep] {
		opacity: 0.45;
		margin: 0 2px;
	}

	[data-form-actions-row] {
		display: inline-flex;
		align-items: center;
		gap: 2px;
	}

	[data-form-action] {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		height: 24px;
		padding: 0 8px;
		border: 0;
		border-radius: 4px;
		background: transparent;
		color: var(--ink-mute);
		font: 500 11.5px var(--font-ui);
		cursor: pointer;
	}

	[data-form-action]:hover {
		background: var(--paper-mute);
		color: var(--ink);
	}

	[data-form-action] > span:first-child {
		width: 14px;
		height: 14px;
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
