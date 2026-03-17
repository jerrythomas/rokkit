<script>
	// @ts-nocheck
	import { Code } from '$lib/components/Story'
	import howItWorks from './introduction/snippets/00-how-it-works.svelte?raw'
	import install from './snippets/00-install.sh?raw'
	import installAlt from './snippets/01-install-alt.sh?raw'
	import themeSetup from './snippets/02-theme-setup.css?raw'
	import unoConfig from './snippets/03-uno-config.js?raw'
	import firstComponent from './snippets/04-first-component.svelte?raw'
	import samePattern from './snippets/05-same-pattern.svelte?raw'
	import cliInit from './snippets/06-cli-init.sh?raw'
</script>

<article data-article-root>
	<h1>Getting Started</h1>
	<p class="text-surface-z6 mb-8 text-[1.0625rem] leading-7">
		Rokkit is a data-first Svelte 5 component library. Every component accepts your data's natural
		shape through a simple field mapping — no adapters, no transformations, no boilerplate.
	</p>

	<h2>Introduction</h2>
	<p>
		Most UI libraries define rigid data contracts. You reshape your API responses to fit their
		expectations. Rokkit flips this: you tell it which fields in your data map to which roles in the
		UI, and it adapts.
	</p>

	<div class="my-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each [{ icon: 'i-glyph:database', title: 'Data-First', desc: 'Components adapt to your data shape via field mapping. No transformations, no boilerplate.' }, { icon: 'i-glyph:code', title: 'Composable', desc: 'Customize any component with Svelte snippets. Full control over rendering without forking.' }, { icon: 'i-glyph:keyboard', title: 'Accessible', desc: 'Keyboard navigation and ARIA support built in via the navigator pattern. Zero config.' }, { icon: 'i-glyph:palette', title: 'Themeable', desc: 'Data-attribute hooks with clean layout/theme CSS separation. Build or swap themes freely.' }, { icon: 'i-glyph:widget', title: 'Consistent API', desc: 'Every component follows the same pattern: items, fields, value, onchange. Learn once, use everywhere.' }, { icon: 'i-glyph:rocket', title: 'Svelte 5 Native', desc: 'Built on runes, snippets, and $state. No legacy patterns, no compatibility layers.' }] as card}
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

	<h2>Installation</h2>
	<p class="text-surface-z6 mb-8 text-[1.0625rem] leading-7">
		Get up and running with Rokkit in minutes. Install the packages, add the theme, and build your
		first data-driven component.
	</p>
	<p>Install Rokkit UI and the default theme:</p>
	<Code content={install} language="bash" />
	<p>Or with other package managers:</p>
	<Code content={installAlt} language="bash" />

	<h2>Theme Setup</h2>
	<p>
		Import the Rokkit theme CSS in your app's entry point. The base CSS provides layout rules, and
		the theme CSS adds visual styling via <code>data-*</code> selectors.
	</p>
	<Code content={themeSetup} language="css" />

	<h2>UnoCSS Integration</h2>
	<p>
		Rokkit uses UnoCSS for its semantic color system. Add the Rokkit theme rules to your UnoCSS
		config:
	</p>
	<Code content={unoConfig} language="javascript" />

	<h2>Your First Component</h2>
	<p>
		Every Rokkit component follows the same pattern: pass your data as <code>items</code>, tell the
		component which fields to use via <code>fields</code>, and bind the selected
		<code>value</code>.
	</p>
	<Code content={firstComponent} language="svelte" />

	<p>
		That's it — no data transformation, no adapter layer. The <code>fields</code> prop maps your
		<code>name</code>
		property to the display text and <code>id</code> to the selection value.
	</p>

	<h2>Same Pattern, Every Component</h2>
	<p>
		The identical <code>items</code> + <code>fields</code> pattern works across all Rokkit components.
		Switch from a List to a Select or Table by changing one import:
	</p>
	<Code content={samePattern} language="svelte" />

	<h2>Quick Start</h2>
	<p>The fastest way to add Rokkit to an existing SvelteKit project is with the CLI:</p>
	<Code content={cliInit} language="bash" />
	<p>
		The CLI sets up UnoCSS, imports theme CSS, and adds <code>data-style</code> to
		<code>&lt;html&gt;</code> automatically. See the
		<a href="/docs/getting-started/quick-start">Quick Start guide</a> for a full step-by-step
		walkthrough.
	</p>
</article>
