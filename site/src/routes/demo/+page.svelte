<script>
	// @ts-nocheck
</script>

<div class="mx-auto max-w-[760px] px-6 py-10 lg:px-10">
	<!-- Page header -->
	<div class="border-surface-z2 mb-8 border-b pb-8">
		<h1 class="text-surface-z8 mb-3 text-[1.75rem] font-bold tracking-tight">Introduction</h1>
		<p class="text-surface-z5 text-base leading-relaxed">
			Rokkit is a data-first Svelte 5 component library. Every component accepts your data's natural
			shape through a simple field mapping — no adapters, no transformations, no boilerplate.
		</p>
	</div>

	<!-- Image placeholder -->
	<div
		class="border-surface-z3 bg-surface-z2 mb-8 flex h-48 items-center justify-center rounded-xl border border-dashed"
	>
		<div class="text-surface-z4 flex flex-col items-center gap-2">
			<span class="i-glyph:widget inline-block text-5xl" aria-hidden="true"></span>
			<span class="text-sm">Component preview image</span>
		</div>
	</div>

	<h2 class="border-surface-z2 text-surface-z8 mt-10 mb-3 border-b pb-2 text-xl font-semibold">
		Why Rokkit?
	</h2>
	<p class="text-surface-z6 mb-4 leading-7">
		Most UI libraries define rigid data contracts. You reshape your API responses to fit their
		expectations. Rokkit flips this: you tell it which fields in your data map to which roles in the
		UI, and it adapts.
	</p>

	<h3 class="text-surface-z8 mt-6 mb-2 text-base font-semibold">Data-First</h3>
	<p class="text-surface-z6 mb-4 leading-7">
		Pass any object structure with a <code class="bg-surface-z3 rounded px-1.5 py-0.5 font-mono text-sm"
			>fields</code
		> mapping. The same pattern works across List, Select, Table, Tabs, MultiSelect — learn it once, use
		it everywhere.
	</p>
	<div class="border-surface-z2 bg-surface-z2 mb-4 overflow-hidden rounded-lg border">
		<pre class="text-surface-z7 overflow-x-auto p-4 font-mono text-sm leading-relaxed"><code
				>const users = await fetch('/api/users').then(r =&gt; r.json())
const fields = &#123; text: 'name', value: 'id' &#125;

// No .map(), no adapter needed
&lt;List items=&#123;users&#125; &#123;fields&#125; bind:value /&gt;</code
			></pre>
	</div>

	<h3 class="text-surface-z8 mt-6 mb-2 text-base font-semibold">Composable</h3>
	<p class="text-surface-z6 mb-4 leading-7">
		Every component is extensible via Svelte snippets. Customize rendering without forking or
		wrapping. The component's data logic stays intact while you control every pixel of the output.
	</p>

	<h3 class="text-surface-z8 mt-6 mb-2 text-base font-semibold">Accessible</h3>
	<p class="text-surface-z6 mb-4 leading-7">
		Full keyboard navigation and ARIA support are built in via the navigator pattern. Focus
		management, arrow key routing, and screen reader announcements come with every component — no
		configuration required.
	</p>

	<h3 class="text-surface-z8 mt-6 mb-2 text-base font-semibold">Themeable</h3>
	<p class="text-surface-z6 mb-4 leading-7">
		Components expose <code class="bg-surface-z3 rounded px-1.5 py-0.5 font-mono text-sm">data-*</code>
		attribute hooks for styling, with clean separation between layout CSS and visual theme CSS. Ship with
		the included Rokkit theme or build your own.
	</p>

	<h2 class="border-surface-z2 text-surface-z8 mt-10 mb-3 border-b pb-2 text-xl font-semibold">
		Live Demos
	</h2>
	<p class="text-surface-z6 mb-4 leading-7">
		Explore real-world usage patterns with live, interactive examples:
	</p>
	<div class="grid grid-cols-2 gap-3">
		{#each [
			{ label: 'Dashboard', href: '/demo/dashboard', desc: 'KPI cards, charts, and sortable tables in an analytics layout' },
			{ label: 'Crossfilter', href: '/demo/crossfilter', desc: 'Linked interactive filters — histogram brush, bar filters' },
			{ label: 'Components', href: '/demo/showcase', desc: 'All components: menus, lists, selects, charts, forms' },
			{ label: 'Theming', href: '/theming/colors', desc: 'Semantic color palettes and surface depth' }
		] as link (link.href)}
			<a
				href={link.href}
				class="border-surface-z2 hover:border-surface-z4 hover:bg-surface-z2 flex flex-col gap-1 rounded-lg border p-4 no-underline transition-colors"
			>
				<span class="text-surface-z8 text-sm font-semibold">{link.label}</span>
				<span class="text-surface-z5 text-xs leading-relaxed">{link.desc}</span>
			</a>
		{/each}
	</div>
</div>
