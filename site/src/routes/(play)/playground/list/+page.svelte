<script>
	// @ts-nocheck
	import { List } from '@rokkit/ui'

	// ─── Flat list ────────────────────────────────────────────────────────────────

	const flat = [
		{ label: 'Dashboard', icon: 'i-lucide:layout-dashboard' },
		{ label: 'Analytics', icon: 'i-lucide:bar-chart-2' },
		{ label: 'Reports', icon: 'i-lucide:file-text' },
		{ type: 'separator' },
		{ label: 'Settings', icon: 'i-lucide:settings' },
		{ label: 'Disabled item', icon: 'i-lucide:lock', disabled: true }
	]

	let flatValue = $state(null)

	// ─── Nested collapsible ───────────────────────────────────────────────────────

	const nested = [
		{
			label: 'Components',
			icon: 'i-lucide:box',
			children: [
				{ label: 'Button', value: 'button' },
				{ label: 'Card', value: 'card' },
				{ label: 'Badge', value: 'badge' }
			]
		},
		{ type: 'separator' },
		{
			label: 'Forms',
			icon: 'i-lucide:form-input',
			children: [
				{ label: 'Input', value: 'input' },
				{ label: 'Select', value: 'select' },
				{ label: 'Toggle', value: 'toggle' }
			]
		},
		{ type: 'spacer' },
		{ label: 'Documentation', icon: 'i-lucide:book-open', value: 'docs' }
	]

	let nestedValue = $state(null)

	// ─── Navigation links ─────────────────────────────────────────────────────────

	const links = [
		{ label: 'Introduction', href: '#introduction', icon: 'i-lucide:info' },
		{ label: 'Getting Started', href: '#getting-started', icon: 'i-lucide:rocket' },
		{ label: 'API Reference', href: '#api', icon: 'i-lucide:code-2' },
		{ type: 'separator' },
		{
			label: 'Examples',
			icon: 'i-lucide:layers',
			children: [
				{ label: 'Basic', href: '#basic' },
				{ label: 'Advanced', href: '#advanced' }
			]
		}
	]

	// ─── Custom snippet demo ──────────────────────────────────────────────────────

	const withBadge = [
		{ label: 'Inbox', icon: 'i-lucide:inbox', badge: 12 },
		{ label: 'Sent', icon: 'i-lucide:send', badge: null },
		{ label: 'Drafts', icon: 'i-lucide:file', badge: 3 },
		{ type: 'separator' },
		{ label: 'Trash', icon: 'i-lucide:trash-2', badge: null }
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
		{ label: 'Afghanistan', value: 'af', icon: 'i-lucide:globe' },
		{ label: 'Albania', value: 'al', icon: 'i-lucide:globe' },
		{ label: 'Algeria', value: 'dz', icon: 'i-lucide:globe' },
		{ label: 'Argentina', value: 'ar', icon: 'i-lucide:globe' },
		{ label: 'Australia', value: 'au', icon: 'i-lucide:globe' },
		{ label: 'Austria', value: 'at', icon: 'i-lucide:globe' },
		{ label: 'Belgium', value: 'be', icon: 'i-lucide:globe' },
		{ label: 'Brazil', value: 'br', icon: 'i-lucide:globe' },
		{ label: 'Canada', value: 'ca', icon: 'i-lucide:globe' },
		{ label: 'Chile', value: 'cl', icon: 'i-lucide:globe' },
		{ label: 'China', value: 'cn', icon: 'i-lucide:globe' },
		{ label: 'Colombia', value: 'co', icon: 'i-lucide:globe' },
		{ label: 'Croatia', value: 'hr', icon: 'i-lucide:globe' },
		{ label: 'Czech Republic', value: 'cz', icon: 'i-lucide:globe' },
		{ label: 'Denmark', value: 'dk', icon: 'i-lucide:globe' },
		{ label: 'Egypt', value: 'eg', icon: 'i-lucide:globe' },
		{ label: 'Finland', value: 'fi', icon: 'i-lucide:globe' },
		{ label: 'France', value: 'fr', icon: 'i-lucide:globe' },
		{ label: 'Germany', value: 'de', icon: 'i-lucide:globe' },
		{ label: 'Greece', value: 'gr', icon: 'i-lucide:globe' },
		{ label: 'Hungary', value: 'hu', icon: 'i-lucide:globe' },
		{ label: 'India', value: 'in', icon: 'i-lucide:globe' },
		{ label: 'Indonesia', value: 'id', icon: 'i-lucide:globe' },
		{ label: 'Iran', value: 'ir', icon: 'i-lucide:globe' },
		{ label: 'Ireland', value: 'ie', icon: 'i-lucide:globe' },
		{ label: 'Israel', value: 'il', icon: 'i-lucide:globe' },
		{ label: 'Italy', value: 'it', icon: 'i-lucide:globe' },
		{ label: 'Japan', value: 'jp', icon: 'i-lucide:globe' },
		{ label: 'Mexico', value: 'mx', icon: 'i-lucide:globe' },
		{ label: 'Netherlands', value: 'nl', icon: 'i-lucide:globe' },
		{ label: 'New Zealand', value: 'nz', icon: 'i-lucide:globe' },
		{ label: 'Nigeria', value: 'ng', icon: 'i-lucide:globe' },
		{ label: 'Norway', value: 'no', icon: 'i-lucide:globe' },
		{ label: 'Pakistan', value: 'pk', icon: 'i-lucide:globe' },
		{ label: 'Peru', value: 'pe', icon: 'i-lucide:globe' },
		{ label: 'Philippines', value: 'ph', icon: 'i-lucide:globe' },
		{ label: 'Poland', value: 'pl', icon: 'i-lucide:globe' },
		{ label: 'Portugal', value: 'pt', icon: 'i-lucide:globe' },
		{ label: 'Romania', value: 'ro', icon: 'i-lucide:globe' },
		{ label: 'Russia', value: 'ru', icon: 'i-lucide:globe' },
		{ label: 'Saudi Arabia', value: 'sa', icon: 'i-lucide:globe' },
		{ label: 'South Africa', value: 'za', icon: 'i-lucide:globe' },
		{ label: 'South Korea', value: 'kr', icon: 'i-lucide:globe' },
		{ label: 'Spain', value: 'es', icon: 'i-lucide:globe' },
		{ label: 'Sweden', value: 'se', icon: 'i-lucide:globe' },
		{ label: 'Switzerland', value: 'ch', icon: 'i-lucide:globe' },
		{ label: 'Turkey', value: 'tr', icon: 'i-lucide:globe' },
		{ label: 'Ukraine', value: 'ua', icon: 'i-lucide:globe' },
		{ label: 'United Kingdom', value: 'gb', icon: 'i-lucide:globe' },
		{ label: 'United States', value: 'us', icon: 'i-lucide:globe' },
		{ label: 'Vietnam', value: 'vn', icon: 'i-lucide:globe' }
	]

	let longValue = $state(null)
</script>

<div class="space-y-12 p-8">
	<h1 class="text-2xl font-semibold text-surface-z8">List — Testbed Demo</h1>
	<p class="text-surface-z5 text-sm">Visual test for the new ProxyItem + Wrapper + Navigator implementation.</p>

	<!-- ─── Flat list ─────────────────────────────────────────────────────────── -->
	<section class="space-y-3">
		<h2 class="text-surface-z7 font-semibold">Flat list with separator + disabled</h2>
		<p class="text-surface-z5 text-xs">Selected: <code>{flatValue ?? 'none'}</code></p>
		<div class="w-56 rounded border border-surface-z3 bg-surface-z1">
			<List items={flat} bind:value={flatValue} onselect={(v) => (flatValue = v)} />
		</div>
	</section>

	<!-- ─── Nested collapsible ───────────────────────────────────────────────── -->
	<section class="space-y-3">
		<h2 class="text-surface-z7 font-semibold">Nested collapsible groups</h2>
		<p class="text-surface-z5 text-xs">Selected: <code>{nestedValue ?? 'none'}</code></p>
		<div class="w-56 rounded border border-surface-z3 bg-surface-z1">
			<List items={nested} collapsible bind:value={nestedValue} onselect={(v) => (nestedValue = v)} />
		</div>
	</section>

	<!-- ─── Custom icons ────────────────────────────────────────────────────── -->
	<section class="space-y-3">
		<h2 class="text-surface-z7 font-semibold">Collapsible with custom icons</h2>
		<div class="w-56 rounded border border-surface-z3 bg-surface-z1">
			<List
				items={nested}
				collapsible
				icons={{ opened: 'i-lucide:folder-open', closed: 'i-lucide:folder' }}
				bind:value={nestedValue}
				onselect={(v) => (nestedValue = v)}
			/>
		</div>
	</section>

	<!-- ─── Navigation links ─────────────────────────────────────────────────── -->
	<section class="space-y-3">
		<h2 class="text-surface-z7 font-semibold">Navigation links (href items)</h2>
		<div class="w-56 rounded border border-surface-z3 bg-surface-z1">
			<List items={links} collapsible />
		</div>
	</section>

	<!-- ─── Custom itemContent snippet ───────────────────────────────────────── -->
	<section class="space-y-3">
		<h2 class="text-surface-z7 font-semibold">Custom itemContent snippet (with badge)</h2>
		<p class="text-surface-z5 text-xs">Selected: <code>{badgeValue ?? 'none'}</code></p>
		<div class="w-56 rounded border border-surface-z3 bg-surface-z1">
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
		<div class="w-56 rounded border border-surface-z3 bg-surface-z1">
			<List items={mixed} bind:value={mixedValue} onselect={(v) => (mixedValue = v)}>
				{#snippet highlighted(proxy)}
					<span class="i-lucide:star text-warning-z6" aria-hidden="true"></span>
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
		<div class="w-56 rounded border border-surface-z3 bg-surface-z1" style="max-height: 200px; overflow-y: auto;">
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
	:global([data-level='2']) { padding-left: 28px; }
	:global([data-level='3']) { padding-left: 44px; }

	/* Expand icon */
	:global([data-list-expand-icon]) {
		flex-shrink: 0;
		transition: transform 200ms ease;
	}
</style>
