<script>
	import { Code } from '$lib/components/Story'
	import howItWorks from './snippets/00-how-it-works.svelte?raw'
</script>

<article data-article-root>
	<p class="text-surface-z6 mb-8 text-[1.0625rem] leading-7">
		Rokkit is a data-first Svelte 5 component library. Every component accepts your data's natural
		shape through a simple field mapping — no adapters, no transformations, no boilerplate.
	</p>

	<h2>Why Rokkit?</h2>
	<p>
		Most UI libraries define rigid data contracts. You reshape your API responses to fit their
		expectations. Rokkit flips this: you tell it which fields in your data map to which roles in the
		UI, and it adapts.
	</p>

	<div class="my-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each [{ icon: 'i-solar:database-bold-duotone', title: 'Data-First', desc: 'Components adapt to your data shape via field mapping. No transformations, no boilerplate.' }, { icon: 'i-solar:code-bold-duotone', title: 'Composable', desc: 'Customize any component with Svelte snippets. Full control over rendering without forking.' }, { icon: 'i-solar:keyboard-bold-duotone', title: 'Accessible', desc: 'Keyboard navigation and ARIA support built in via the navigator pattern. Zero config.' }, { icon: 'i-solar:palette-bold-duotone', title: 'Themeable', desc: 'Data-attribute hooks with clean layout/theme CSS separation. Build or swap themes freely.' }, { icon: 'i-solar:widget-bold-duotone', title: 'Consistent API', desc: 'Every component follows the same pattern: items, fields, value, onchange. Learn once, use everywhere.' }, { icon: 'i-solar:rocket-bold-duotone', title: 'Svelte 5 Native', desc: 'Built on runes, snippets, and $state. No legacy patterns, no compatibility layers.' }] as card}
			<div class="border-surface-z2 rounded-lg border p-4">
				<span class="{card.icon} text-secondary-z7 mb-2 block text-2xl" aria-hidden="true"></span>
				<h3 class="mb-1 text-sm font-semibold">{card.title}</h3>
				<p class="text-surface-z5 text-xs leading-relaxed">{card.desc}</p>
			</div>
		{/each}
	</div>

	<h2>How It Works</h2>
	<p>
		Pass any data structure and a <code>fields</code> mapping. The same pattern works identically across
		List, Select, Table, Tabs, Menu, and every other component.
	</p>
	<Code content={howItWorks} language="svelte" />

	<h2>Community</h2>
	<p>
		Rokkit is open source and welcomes contributions. File issues, submit pull requests, or start a
		discussion on GitHub.
	</p>
	<div class="mb-6 flex gap-3">
		<a
			href="https://github.com/jerrythomas/rokkit"
			target="_blank"
			rel="noopener noreferrer"
			class="border-surface-z3 text-surface-z7 hover:bg-surface-z2 inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium no-underline transition-colors"
		>
			<span class="i-logo:github inline-block text-base" aria-hidden="true"></span>
			GitHub
		</a>
	</div>

	<h2>Where to go next</h2>
	<p>Pick a topic or jump straight to a component:</p>
	<div class="grid grid-cols-2 gap-3">
		{#each [{ label: 'Getting Started', href: '/getting-started', desc: 'Install and build your first component' }, { label: 'Field Mapping', href: '/field-mapping', desc: 'The core concept behind every component' }, { label: 'List', href: '/components/list', desc: 'Data-driven list with field mapping' }, { label: 'Select', href: '/components/select', desc: 'Dropdown with keyboard navigation' }] as link}
			<a
				href={link.href}
				class="border-surface-z2 hover:border-surface-z4 hover:bg-surface-z2 flex flex-col gap-1 rounded-lg border p-4 no-underline transition-colors"
			>
				<span class="text-surface-z8 text-sm font-semibold">{link.label}</span>
				<span class="text-surface-z5 text-xs leading-relaxed">{link.desc}</span>
			</a>
		{/each}
	</div>
</article>
