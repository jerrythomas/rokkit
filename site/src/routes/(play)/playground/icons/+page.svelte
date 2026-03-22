<script>
	// @ts-nocheck
	import authIcons from '@rokkit/icons/auth.json'
	import appIcons from '@rokkit/icons/app.json'
	import baseIcons from '@rokkit/icons/ui.json'
	import glyphIcons from '@rokkit/icons/glyph.json'
	import semanticIcons from '@rokkit/icons/semantic.json'

	const AUTH_CATEGORIES = {
		'Auth Platforms': [
			'supabase',
			'firebase',
			'convex',
			'auth0',
			'amplify',
			'cognito',
			'clerk',
			'okta',
			'keycloak',
			'nextauth',
			'pocketbase',
			'appwrite',
			'azure',
			'microsoft'
		],
		'Social Auth': ['google', 'github', 'apple', 'twitter', 'facebook'],
		'Auth Methods': ['email', 'phone', 'password', 'magic', 'incognito', 'authy', 'passkey', 'mfa']
	}

	const AUTH_VARIANT_ORDER = [
		'',
		'-white',
		'-black',
		'-outline',
		'-duotone',
		'-duotone-outline',
		'-logo',
		'-logo-white',
		'-logo-black',
		'-wordmark',
		'-wordmark-white'
	]

	const GLYPH_VARIANTS = ['', '-outline', '-solid', '-duotone-outline']

	function getAuthFamilies(bases, icons) {
		return bases
			.map((base) => {
				const variants = AUTH_VARIANT_ORDER.map((suffix) => ({
					suffix,
					key: base + suffix,
					icon: icons[base + suffix]
				})).filter((v) => v.icon)
				return { base, variants }
			})
			.filter((f) => f.variants.length > 0)
	}

	function getGlyphFamilies(icons, query = '') {
		const bases = [
			...new Set(
				Object.keys(icons).map((n) => n.replace(/-duotone-outline$|-outline$|-solid$/, ''))
			)
		].sort()
		return bases
			.filter((base) => !query || base.includes(query))
			.map((base) => ({
				base,
				variants: GLYPH_VARIANTS.map((suffix) => ({
					suffix,
					key: base + suffix,
					icon: icons[base + suffix] ?? null
				}))
			}))
	}

	function iconList(collection) {
		return Object.entries(collection.icons).map(([name, icon]) => ({ name, icon }))
	}

	let copied = $state(null)

	function copyName(prefix, name) {
		const cls = `i-${prefix}:${name}`
		navigator.clipboard.writeText(cls)
		copied = cls
		setTimeout(() => (copied = null), 1500)
	}

	const TABS = ['Auth', 'App', 'Base', 'Glyph', 'Semantic']
	let activeTab = $state('Auth')
	let search = $state('')

	function filtered(list) {
		if (!search) return list
		const q = search.toLowerCase()
		return list.filter((i) => i.name.includes(q))
	}

	function iconSVG(icon, collection) {
		const w = icon.width ?? collection.width ?? 24
		const h = icon.height ?? collection.height ?? 24
		return `<svg width="24" height="${Math.round((24 * h) / w)}" viewBox="0 0 ${w} ${h}" fill="none" xmlns="http://www.w3.org/2000/svg">${icon.body}</svg>`
	}

	const COLLECTIONS = {
		Auth: { collection: authIcons, prefix: 'logo' },
		App: { collection: appIcons, prefix: 'app' },
		Base: { collection: baseIcons, prefix: 'base' },
		Glyph: { collection: glyphIcons, prefix: 'glyph' },
		Semantic: { collection: semanticIcons, prefix: 'semantic' }
	}
</script>

<div class="h-full overflow-y-auto space-y-6 p-6">
	<div class="flex items-center justify-between gap-4">
		<div>
			<h1 class="text-surface-z8 text-xl font-semibold">Icon Browser</h1>
			<p class="text-surface-z5 mt-0.5 text-sm">Click any icon to copy its class name</p>
		</div>
		{#if copied}
			<div
				class="bg-success-z3 text-success-z8 rounded-md px-3 py-1.5 font-mono text-xs transition-opacity"
			>
				Copied: {copied}
			</div>
		{/if}
	</div>

	<div class="border-surface-z3 flex gap-1 border-b">
		{#each TABS as tab (tab)}
			<button
				class="rounded-t-md px-4 py-2 text-sm font-medium transition-colors {activeTab === tab
					? 'bg-surface-z2 text-surface-z8 border-surface-z3 border border-b-0'
					: 'text-surface-z5 hover:text-surface-z7'}"
				onclick={() => {
					activeTab = tab
					search = ''
				}}>{tab}</button
			>
		{/each}
	</div>

	{#if activeTab === 'Auth'}
		{#each Object.entries(AUTH_CATEGORIES) as [category, bases] (category)}
			{@const families = getAuthFamilies(bases, authIcons.icons)}
			{#if families.length}
				<section class="space-y-3">
					<h2 class="text-surface-z5 text-xs font-semibold tracking-widest uppercase">
						{category}
					</h2>
					<div class="space-y-2">
						{#each families as family (family.base)}
							<div class="flex flex-wrap items-center gap-1">
								<span class="text-surface-z4 w-28 shrink-0 font-mono text-xs">{family.base}</span>
								{#each family.variants as v (v.key)}
									<button
										class="group bg-surface-z2 hover:bg-surface-z3 hover:border-surface-z4 relative flex h-10 w-10
                      items-center justify-center rounded-md border border-transparent transition-colors"
										title={v.key}
										onclick={() => copyName('logo', v.key)}
									>
										{@html iconSVG(v.icon, authIcons)}
										<span
											class="text-surface-z4 pointer-events-none absolute -bottom-5 left-1/2 -translate-x-1/2
                      text-[9px] whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100"
										>
											{v.suffix || 'default'}
										</span>
									</button>
								{/each}
							</div>
						{/each}
					</div>
				</section>
			{/if}
		{/each}
	{:else if activeTab === 'Glyph'}
		{@const families = getGlyphFamilies(glyphIcons.icons, search)}
		<div class="flex items-center gap-3">
			<input
				bind:value={search}
				placeholder="Search glyphs…"
				class="bg-surface-z2 border-surface-z3 text-surface-z8 placeholder:text-surface-z4 focus:border-primary-z5 w-64 rounded-md border
          px-3 py-1.5 text-sm focus:outline-none"
			/>
			<span class="text-surface-z4 text-xs">{families.length} icons</span>
		</div>
		<div class="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2">
			{#each families as family (family.base)}
				<div
					class="bg-surface-z2 hover:bg-surface-z3 hover:border-surface-z4 flex flex-col gap-1 rounded-md border border-transparent px-2 py-1.5 transition-colors"
				>
					<div class="flex gap-0.5">
						{#each family.variants as v (v.key)}
							{#if v.icon}
								<button
									class="hover:bg-surface-z4 flex h-8 w-8 shrink-0 items-center justify-center rounded transition-colors"
									title={v.key}
									onclick={() => copyName('glyph', v.key)}
								>
									{@html iconSVG(v.icon, glyphIcons)}
								</button>
							{:else}
								<div class="h-8 w-8 shrink-0"></div>
							{/if}
						{/each}
					</div>
					<span class="text-surface-z5 truncate font-mono text-[10px] leading-tight"
						>{family.base}</span
					>
				</div>
			{/each}
		</div>
	{:else if activeTab === 'Semantic'}
		{@const families = getGlyphFamilies(semanticIcons.icons, search)}
		<div class="flex items-center gap-3">
			<input
				bind:value={search}
				placeholder="Search semantic…"
				class="bg-surface-z2 border-surface-z3 text-surface-z8 placeholder:text-surface-z4 focus:border-primary-z5 w-64 rounded-md border
          px-3 py-1.5 text-sm focus:outline-none"
			/>
			<span class="text-surface-z4 text-xs">{families.length} icons</span>
		</div>
		<div class="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2">
			{#each families as family (family.base)}
				<div
					class="bg-surface-z2 hover:bg-surface-z3 hover:border-surface-z4 flex flex-col gap-1 rounded-md border border-transparent px-2 py-1.5 transition-colors"
				>
					<div class="flex gap-0.5">
						{#each family.variants as v (v.key)}
							{#if v.icon}
								<button
									class="hover:bg-surface-z4 flex h-8 w-8 shrink-0 items-center justify-center rounded transition-colors"
									title={v.key}
									onclick={() => copyName('semantic', v.key)}
								>
									{@html iconSVG(v.icon, semanticIcons)}
								</button>
							{:else}
								<div class="h-8 w-8 shrink-0"></div>
							{/if}
						{/each}
					</div>
					<span class="text-surface-z5 truncate font-mono text-[10px] leading-tight"
						>{family.base}</span
					>
				</div>
			{/each}
		</div>
	{:else}
		{@const { collection, prefix } = COLLECTIONS[activeTab]}
		{@const icons = filtered(iconList(collection))}
		<div class="flex items-center gap-3">
			<input
				bind:value={search}
				placeholder="Search icons…"
				class="bg-surface-z2 border-surface-z3 text-surface-z8 placeholder:text-surface-z4 focus:border-primary-z5 w-64 rounded-md border
          px-3 py-1.5 text-sm focus:outline-none"
			/>
			<span class="text-surface-z4 text-xs">{icons.length} icons</span>
		</div>
		<div class="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-2">
			{#each icons as { name, icon } (name)}
				<button
					class="bg-surface-z2 hover:bg-surface-z3 hover:border-surface-z4 group flex flex-col items-center
            gap-1.5 rounded-md border border-transparent p-2 transition-colors"
					title="i-{prefix}:{name}"
					onclick={() => copyName(prefix, name)}
				>
					<div class="flex h-8 w-8 items-center justify-center">
						{@html iconSVG(icon, collection)}
					</div>
					<span
						class="text-surface-z5 group-hover:text-surface-z7 line-clamp-2 text-center
            font-mono text-[10px] leading-tight break-all">{name}</span
					>
				</button>
			{/each}
		</div>
	{/if}
</div>
