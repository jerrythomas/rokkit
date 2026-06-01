<script lang="ts">
	import { Tabs, Button } from '@rokkit/ui'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import type { ProxyItem } from '@rokkit/states'

	// ── preview state ────────────────────────────────────────────────
	let value = $state('overview')

	let layout = $state({
		orientation: 'horizontal',
		position: 'before',
		align: 'start',
		disabled: false
	})

	let mapping = $state({
		iconField: 'icon',
		showIcons: true
	})

	let contentMode = $state<'default' | 'rich'>('default')

	const items = [
		{
			label: 'Overview',
			value: 'overview',
			icon: 'i-glyph:home',
			image: 'i-glyph:user',
			content: 'Your starting point — everything at a glance.'
		},
		{
			label: 'Settings',
			value: 'settings',
			icon: 'i-glyph:settings',
			image: 'i-glyph:palette',
			content: 'Tune preferences until they feel just right.'
		},
		{
			label: 'Activity',
			value: 'activity',
			icon: 'i-glyph:chart',
			image: 'i-glyph:bell',
			content: 'Recent events, surfaced without ceremony.'
		}
	]

	// ── derived fields ───────────────────────────────────────────────
	const fields = $derived(
		mapping.showIcons ? { icon: mapping.iconField } : { icon: '__none__' }
	)

	// ── form schemas ─────────────────────────────────────────────────
	const layoutSchema = {
		type: 'object',
		properties: {
			orientation: { type: 'string' },
			position: { type: 'string' },
			align: { type: 'string' },
			disabled: { type: 'boolean' }
		}
	}
	const layoutLayout = {
		type: 'vertical',
		elements: [
			{
				scope: '#/orientation',
				label: 'Orientation',
				props: { options: ['horizontal', 'vertical'] }
			},
			{ scope: '#/position', label: 'Position', props: { options: ['before', 'after'] } },
			{ scope: '#/align', label: 'Align', props: { options: ['start', 'center', 'end'] } },
			{ scope: '#/disabled', label: 'Disabled' }
		]
	}

	const mappingSchema = {
		type: 'object',
		properties: {
			iconField: { type: 'string' },
			showIcons: { type: 'boolean' }
		}
	}
	const mappingLayout = {
		type: 'vertical',
		elements: [
			{ scope: '#/iconField', label: 'Icon field', props: { options: ['icon', 'image'] } },
			{ scope: '#/showIcons', label: 'Show icons' }
		]
	}

	// ── aspect cards ─────────────────────────────────────────────────
	type Aspect = 'visual' | 'fields' | 'content' | 'data'

	let activeAspect = $state<Aspect>('visual')

	const aspects: { id: Aspect; title: string; tagline: string }[] = [
		{
			id: 'visual',
			title: 'Visual',
			tagline: 'shape it — sideways, upside-down, all yours.'
		},
		{
			id: 'fields',
			title: 'Field mapping',
			tagline: 'speak its language — point at any data shape.'
		},
		{
			id: 'content',
			title: 'Content',
			tagline: 'paint the panel — your snippet, your stage.'
		},
		{
			id: 'data',
			title: 'Data',
			tagline: 'peek under the hood.'
		}
	]
</script>

<section class="tabs-demo">

<!-- ── intro ───────────────────────────────────────────────────────── -->
<p class="intro">Have a poke around — every tab is a tab, but every choice is yours.</p>

<!-- ── preview ────────────────────────────────────────────────────── -->
<div class="preview">
	{#if contentMode === 'rich'}
		<Tabs
			options={items}
			bind:value
			{fields}
			orientation={layout.orientation}
			position={layout.position}
			align={layout.align}
			disabled={layout.disabled}
		>
			{#snippet tabPanel(item: ProxyItem)}
				<div class="rich-panel">
					<h3>{item.label}</h3>
					<p class="tag">{item.get('content')}</p>
					<Button label="Take action" variant="primary" />
				</div>
			{/snippet}
		</Tabs>
	{:else}
		<Tabs
			options={items}
			bind:value
			{fields}
			orientation={layout.orientation}
			position={layout.position}
			align={layout.align}
			disabled={layout.disabled}
		/>
	{/if}
</div>

<!-- ── aspect cards ───────────────────────────────────────────────── -->
<div class="aspect-row">
	{#each aspects as aspect}
		<button
			class="aspect-card"
			class:active={activeAspect === aspect.id}
			onclick={() => (activeAspect = aspect.id)}
			aria-pressed={activeAspect === aspect.id}
			data-aspect={aspect.id}
		>
			<span class="aspect-title">{aspect.title}</span>
			<span class="aspect-tagline">{aspect.tagline}</span>
		</button>
	{/each}
</div>

<!-- ── active panel ───────────────────────────────────────────────── -->
<div class="panel-area">
	{#if activeAspect === 'visual'}
		<p class="panel-copy">Twist the knobs. Vertical? Pill? Tucked under? Try them all.</p>
		<FormRenderer bind:data={layout} schema={layoutSchema} layout={layoutLayout} />
	{:else if activeAspect === 'fields'}
		<p class="panel-copy">Same Tabs, different data shape. Swap which key feeds the icon and watch the visuals change without touching the data.</p>
		<FormRenderer bind:data={mapping} schema={mappingSchema} layout={mappingLayout} />
		<InfoField label="Selected value" value={value} />
	{:else if activeAspect === 'content'}
		<p class="panel-copy">Override what shows up when a tab is active. Try the rich-card snippet.</p>
		<div class="content-toggle">
			<button
				class="mode-btn"
				class:mode-active={contentMode === 'default'}
				onclick={() => (contentMode = 'default')}
				data-contentmode="default"
			>
				Default
			</button>
			<button
				class="mode-btn"
				class:mode-active={contentMode === 'rich'}
				onclick={() => (contentMode = 'rich')}
				data-contentmode="rich"
			>
				Rich card
			</button>
		</div>
	{:else if activeAspect === 'data'}
		<p class="panel-copy">This is exactly what the Tabs are reading. JSON, no magic.</p>
		<pre class="data-pre"><code>{JSON.stringify(items, null, 2)}</code></pre>
	{/if}
</div>

</section>

<style>
	/* ── wrapper ─────────────────────────────────────────────── */
	.tabs-demo {
		display: flex;
		flex-direction: column;
		gap: 24px;
		max-width: 1080px;
		margin: 0 auto;
	}

	/* ── intro ───────────────────────────────────────────────── */
	.intro {
		@apply text-ink-z3;
		font-family: var(--font-script, 'Caveat', cursive);
		font-size: 26px;
		margin: 0;
		text-align: center;
	}

	/* ── preview ─────────────────────────────────────────────── */
	.preview {
		@apply bg-surface-z0 border border-surface-z2;
		padding: 24px;
		border-radius: var(--radius-md, 6px);
	}

	/* ── aspect row ──────────────────────────────────────────── */
	.aspect-row {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
	}

	.aspect-card {
		flex: 1 1 0;
		min-width: 140px;
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 16px;
		border-radius: var(--radius-md, 6px);
		cursor: pointer;
		text-align: left;
		transition:
			border-color 0.15s,
			box-shadow 0.15s,
			transform 0.12s;
		@apply bg-surface-z0 border border-surface-z2 text-ink-z1;
	}

	.aspect-card:hover {
		@apply border-accent-z5;
		transform: translateY(-1px);
	}

	.aspect-card.active {
		@apply border-primary-z5 bg-surface-z1;
		box-shadow: 0 2px 8px oklch(0 0 0 / 0.1);
		transform: translateY(-2px);
	}

	.aspect-title {
		font-size: 14px;
		font-weight: 500;
		@apply text-ink-z1;
	}

	.aspect-tagline {
		font-family: var(--font-script, 'Caveat', cursive);
		font-size: 22px;
		line-height: 1.2;
		@apply text-ink-z3;
	}

	/* ── panel area ──────────────────────────────────────────── */
	.panel-area {
		@apply bg-surface-z0 border border-surface-z2;
		padding: 20px;
		border-radius: var(--radius-md, 6px);
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.panel-copy {
		font-family: var(--font-script, 'Caveat', cursive);
		font-size: 18px;
		font-style: italic;
		@apply text-ink-z3;
		margin: 0;
	}

	/* ── content toggle ──────────────────────────────────────── */
	.content-toggle {
		display: flex;
		gap: 8px;
	}

	.mode-btn {
		padding: 8px 20px;
		border-radius: var(--radius-sm, 4px);
		font-size: 14px;
		cursor: pointer;
		transition: background 0.12s, border-color 0.12s;
		@apply bg-surface-z1 border border-surface-z2 text-ink-z2;
	}

	.mode-btn:hover {
		@apply border-accent-z5 text-ink-z1;
	}

	.mode-btn.mode-active {
		@apply bg-primary-z5 border-primary-z5 text-on-primary;
	}

	/* ── data pre ────────────────────────────────────────────── */
	.data-pre {
		@apply bg-surface-z0 border border-surface-z2 text-ink-z2;
		padding: 12px;
		border-radius: var(--radius-sm, 4px);
		overflow-x: auto;
		font-size: 12px;
		font-family: var(--font-mono);
		margin: 0;
	}

	/* ── rich panel (custom snippet) ─────────────────────────── */
	.rich-panel {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 8px 0;
	}

	.rich-panel h3 {
		@apply text-ink-z1;
		font-size: 20px;
		font-weight: 600;
		margin: 0;
	}

	.rich-panel .tag {
		font-family: var(--font-script, 'Caveat', cursive);
		font-size: 20px;
		@apply text-ink-z3;
		margin: 0;
	}
</style>
