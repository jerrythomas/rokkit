<script>
	// @ts-nocheck
	import { List } from '@rokkit/ui'

	// ─── Flat list ────────────────────────────────────────────────────────────────

	const flat = [
		{ label: 'Dashboard', icon: 'i-glyph:widget' },
		{ label: 'Analytics', icon: 'i-glyph:chart-2' },
		{ label: 'Reports', icon: 'i-glyph:file-text' },
		{ type: 'separator' },
		{ label: 'Settings', icon: 'i-glyph:settings' },
		{ label: 'Disabled item', icon: 'i-glyph:lock', disabled: true }
	]

	let flatValue = $state(null)

	// ─── Nested collapsible ───────────────────────────────────────────────────────

	const nested = [
		{
			label: 'Components',
			icon: 'i-glyph:box',
			children: [
				{ label: 'Button', value: 'button' },
				{ label: 'Card', value: 'card' },
				{ label: 'Badge', value: 'badge' }
			]
		},
		{ type: 'separator' },
		{
			label: 'Forms',
			icon: 'i-glyph:input-text',
			children: [
				{ label: 'Input', value: 'input' },
				{ label: 'Select', value: 'select' },
				{ label: 'Toggle', value: 'toggle' }
			]
		},
		{ type: 'spacer' },
		{ label: 'Documentation', icon: 'i-glyph:book', value: 'docs' }
	]

	let nestedValue = $state(null)

	// ─── Navigation links ─────────────────────────────────────────────────────────

	const links = [
		{ label: 'Introduction', href: '#introduction', icon: 'i-glyph:info-circle' },
		{ label: 'Getting Started', href: '#getting-started', icon: 'i-glyph:rocket' },
		{ label: 'API Reference', href: '#api', icon: 'i-glyph:code' },
		{ type: 'separator' },
		{
			label: 'Examples',
			icon: 'i-glyph:layers',
			children: [
				{ label: 'Basic', href: '#basic' },
				{ label: 'Advanced', href: '#advanced' }
			]
		}
	]

	// ─── Custom snippet demo ──────────────────────────────────────────────────────

	const withBadge = [
		{ label: 'Inbox', icon: 'i-glyph:inbox', badge: 12 },
		{ label: 'Sent', icon: 'i-glyph:plain', badge: null },
		{ label: 'Drafts', icon: 'i-glyph:file', badge: 3 },
		{ type: 'separator' },
		{ label: 'Trash', icon: 'i-glyph:trash-bin', badge: null }
	]

	let badgeValue = $state(null)

	// ─── Per-item snippet demo ────────────────────────────────────────────────────

	const mixed = [
		{ label: 'Normal item', value: 'normal' },
		{ label: 'Highlighted', value: 'highlight', snippet: 'highlighted' },
		{ label: 'Another normal', value: 'normal2' },
		{ label: 'Also highlighted', value: 'highlight2', snippet: 'highlighted' }
	]

	let mixedValue = $state(null)

	// ─── Scroll wrapper demo ──────────────────────────────────────────────────────

	const long = [
		{ label: 'Afghanistan', value: 'af', icon: 'i-glyph:global' },
		{ label: 'Albania', value: 'al', icon: 'i-glyph:global' },
		{ label: 'Algeria', value: 'dz', icon: 'i-glyph:global' },
		{ label: 'Argentina', value: 'ar', icon: 'i-glyph:global' },
		{ label: 'Australia', value: 'au', icon: 'i-glyph:global' },
		{ label: 'Austria', value: 'at', icon: 'i-glyph:global' },
		{ label: 'Belgium', value: 'be', icon: 'i-glyph:global' },
		{ label: 'Brazil', value: 'br', icon: 'i-glyph:global' },
		{ label: 'Canada', value: 'ca', icon: 'i-glyph:global' },
		{ label: 'Chile', value: 'cl', icon: 'i-glyph:global' },
		{ label: 'China', value: 'cn', icon: 'i-glyph:global' },
		{ label: 'Colombia', value: 'co', icon: 'i-glyph:global' },
		{ label: 'Croatia', value: 'hr', icon: 'i-glyph:global' },
		{ label: 'Czech Republic', value: 'cz', icon: 'i-glyph:global' },
		{ label: 'Denmark', value: 'dk', icon: 'i-glyph:global' },
		{ label: 'Egypt', value: 'eg', icon: 'i-glyph:global' },
		{ label: 'Finland', value: 'fi', icon: 'i-glyph:global' },
		{ label: 'France', value: 'fr', icon: 'i-glyph:global' },
		{ label: 'Germany', value: 'de', icon: 'i-glyph:global' },
		{ label: 'Greece', value: 'gr', icon: 'i-glyph:global' },
		{ label: 'Hungary', value: 'hu', icon: 'i-glyph:global' },
		{ label: 'India', value: 'in', icon: 'i-glyph:global' },
		{ label: 'Indonesia', value: 'id', icon: 'i-glyph:global' },
		{ label: 'Iran', value: 'ir', icon: 'i-glyph:global' },
		{ label: 'Ireland', value: 'ie', icon: 'i-glyph:global' },
		{ label: 'Israel', value: 'il', icon: 'i-glyph:global' },
		{ label: 'Italy', value: 'it', icon: 'i-glyph:global' },
		{ label: 'Japan', value: 'jp', icon: 'i-glyph:global' },
		{ label: 'Mexico', value: 'mx', icon: 'i-glyph:global' },
		{ label: 'Netherlands', value: 'nl', icon: 'i-glyph:global' },
		{ label: 'New Zealand', value: 'nz', icon: 'i-glyph:global' },
		{ label: 'Nigeria', value: 'ng', icon: 'i-glyph:global' },
		{ label: 'Norway', value: 'no', icon: 'i-glyph:global' },
		{ label: 'Pakistan', value: 'pk', icon: 'i-glyph:global' },
		{ label: 'Peru', value: 'pe', icon: 'i-glyph:global' },
		{ label: 'Philippines', value: 'ph', icon: 'i-glyph:global' },
		{ label: 'Poland', value: 'pl', icon: 'i-glyph:global' },
		{ label: 'Portugal', value: 'pt', icon: 'i-glyph:global' },
		{ label: 'Romania', value: 'ro', icon: 'i-glyph:global' },
		{ label: 'Russia', value: 'ru', icon: 'i-glyph:global' },
		{ label: 'Saudi Arabia', value: 'sa', icon: 'i-glyph:global' },
		{ label: 'South Africa', value: 'za', icon: 'i-glyph:global' },
		{ label: 'South Korea', value: 'kr', icon: 'i-glyph:global' },
		{ label: 'Spain', value: 'es', icon: 'i-glyph:global' },
		{ label: 'Sweden', value: 'se', icon: 'i-glyph:global' },
		{ label: 'Switzerland', value: 'ch', icon: 'i-glyph:global' },
		{ label: 'Turkey', value: 'tr', icon: 'i-glyph:global' },
		{ label: 'Ukraine', value: 'ua', icon: 'i-glyph:global' },
		{ label: 'United Kingdom', value: 'gb', icon: 'i-glyph:global' },
		{ label: 'United States', value: 'us', icon: 'i-glyph:global' },
		{ label: 'Vietnam', value: 'vn', icon: 'i-glyph:global' }
	]

	let longValue = $state(null)
</script>

<div class="space-y-12 p-8">
	<h1 class="text-surface-z8 text-2xl font-semibold">List — Testbed Demo</h1>
	<p class="text-surface-z5 text-sm">
		Visual test for the new ProxyItem + Wrapper + Navigator implementation.
	</p>

	<!-- ─── Flat list ─────────────────────────────────────────────────────────── -->
	<section class="space-y-3">
		<h2 class="text-surface-z7 font-semibold">Flat list with separator + disabled</h2>
		<p class="text-surface-z5 text-xs">Selected: <code>{flatValue ?? 'none'}</code></p>
		<div class="border-surface-z3 bg-surface-z1 w-56 rounded border">
			<List items={flat} bind:value={flatValue} onselect={(v) => (flatValue = v)} />
		</div>
	</section>

	<!-- ─── Nested collapsible ───────────────────────────────────────────────── -->
	<section class="space-y-3">
		<h2 class="text-surface-z7 font-semibold">Nested collapsible groups</h2>
		<p class="text-surface-z5 text-xs">Selected: <code>{nestedValue ?? 'none'}</code></p>
		<div class="border-surface-z3 bg-surface-z1 w-56 rounded border">
			<List
				items={nested}
				collapsible
				bind:value={nestedValue}
				onselect={(v) => (nestedValue = v)}
			/>
		</div>
	</section>

	<!-- ─── Custom icons ────────────────────────────────────────────────────── -->
	<section class="space-y-3">
		<h2 class="text-surface-z7 font-semibold">Collapsible with custom icons</h2>
		<div class="border-surface-z3 bg-surface-z1 w-56 rounded border">
			<List
				items={nested}
				collapsible
				icons={{ opened: 'i-glyph:folder-open', closed: 'i-glyph:folder' }}
				bind:value={nestedValue}
				onselect={(v) => (nestedValue = v)}
			/>
		</div>
	</section>

	<!-- ─── Navigation links ─────────────────────────────────────────────────── -->
	<section class="space-y-3">
		<h2 class="text-surface-z7 font-semibold">Navigation links (href items)</h2>
		<div class="border-surface-z3 bg-surface-z1 w-56 rounded border">
			<List items={links} collapsible />
		</div>
	</section>

	<!-- ─── Custom itemContent snippet ───────────────────────────────────────── -->
	<section class="space-y-3">
		<h2 class="text-surface-z7 font-semibold">Custom itemContent snippet (with badge)</h2>
		<p class="text-surface-z5 text-xs">Selected: <code>{badgeValue ?? 'none'}</code></p>
		<div class="border-surface-z3 bg-surface-z1 w-56 rounded border">
			<List items={withBadge} bind:value={badgeValue} onselect={(v) => (badgeValue = v)}>
				{#snippet itemContent(proxy)}
					{#if proxy.icon}
						<span class="{proxy.icon} text-surface-z5" aria-hidden="true"></span>
					{/if}
					<span class="flex-1 text-sm">{proxy.label}</span>
					{#if proxy.get('badge')}
						<span class="bg-primary-z6 rounded-full px-1.5 py-0.5 text-xs text-white">
							{proxy.get('badge')}
						</span>
					{/if}
				{/snippet}
			</List>
		</div>
	</section>

	<!-- ─── Per-item snippet ──────────────────────────────────────────────────── -->
	<section class="space-y-3">
		<h2 class="text-surface-z7 font-semibold">Per-item snippet (item.snippet = 'highlighted')</h2>
		<p class="text-surface-z5 text-xs">Selected: <code>{mixedValue ?? 'none'}</code></p>
		<div class="border-surface-z3 bg-surface-z1 w-56 rounded border">
			<List items={mixed} bind:value={mixedValue} onselect={(v) => (mixedValue = v)}>
				{#snippet highlighted(proxy)}
					<span class="i-glyph:star text-warning-z6" aria-hidden="true"></span>
					<span class="text-warning-z7 font-medium">{proxy.label}</span>
				{/snippet}
			</List>
		</div>
	</section>

	<!-- ─── Scroll into view ──────────────────────────────────────────────────── -->
	<section class="space-y-3">
		<h2 class="text-surface-z7 font-semibold">Scroll into view (keyboard navigation)</h2>
		<p class="text-surface-z5 text-xs">
			Selected: <code>{longValue ?? 'none'}</code> — use ↑↓ Home/End to test scroll
		</p>
		<div
			class="border-surface-z3 bg-surface-z1 w-56 rounded border"
			style="max-height: 200px; overflow-y: auto;"
		>
			<List items={long} bind:value={longValue} onselect={(v) => (longValue = v)} />
		</div>
	</section>
</div>

<style>
	/* Separator: inset dashed line */
	:global([data-list-separator]) {
		border: none;
		border-top: 1px dashed;
		margin: 4px 8px;
		opacity: 0.3;
	}

	/* Spacer: small gap */
	:global([data-list-spacer]) {
		height: 8px;
	}

	/* List item base */
	:global([data-list-item]) {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		padding: 6px 12px;
		font-size: 0.875rem;
		cursor: pointer;
		text-align: left;
		background: transparent;
		border: none;
		text-decoration: none;
		color: inherit;
	}

	:global([data-list-item]:hover),
	:global([data-list-item]:focus-visible) {
		background: color-mix(in srgb, currentColor 8%, transparent);
		outline: none;
	}

	:global([data-list-item][data-active]) {
		color: var(--color-primary-600, #3b82f6);
		background: color-mix(in srgb, var(--color-primary-600, #3b82f6) 10%, transparent);
	}

	:global([data-list-item][data-disabled]) {
		opacity: 0.4;
		cursor: not-allowed;
	}

	/* Group label */
	:global([data-list-group]) {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		padding: 6px 12px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		text-align: left;
		background: transparent;
		border: none;
		color: inherit;
	}

	:global([data-list-group]:hover),
	:global([data-list-group]:focus-visible) {
		background: color-mix(in srgb, currentColor 6%, transparent);
		outline: none;
	}

	:global([data-list-group]:disabled) {
		cursor: default;
	}

	:global([data-list-group-text]) {
		flex: 1;
	}

	/* Indentation by level */
	:global([data-level='2']) {
		padding-left: 28px;
	}
	:global([data-level='3']) {
		padding-left: 44px;
	}

	/* Expand icon */
	:global([data-list-expand-icon]) {
		flex-shrink: 0;
		transition: transform 200ms ease;
	}
</style>
