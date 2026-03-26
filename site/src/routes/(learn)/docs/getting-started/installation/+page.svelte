<script>
	import { Code } from '$lib/components/Story'
	import cliInit from '../snippets/06-cli-init.sh?raw'
	import install from '../snippets/00-install.sh?raw'
	import installAlt from '../snippets/01-install-alt.sh?raw'
	import themeSetup from '../snippets/02-theme-setup.css?raw'
	import unoConfig from '../snippets/03-uno-config.js?raw'
	import firstComponent from '../snippets/04-first-component.svelte?raw'
	import samePattern from '../snippets/05-same-pattern.svelte?raw'
</script>

<article data-article-root>
	<p class="text-surface-z6 mb-8 text-[1.0625rem] leading-7">
		Get up and running with Rokkit in minutes. Install the packages, add the theme, and build your
		first data-driven component.
	</p>

	<h2>CLI Setup (Recommended)</h2>
	<p>
		The fastest way to set up Rokkit is the CLI. It runs interactive prompts to configure your
		palette, theme style, and icons, then writes all necessary config files:
	</p>
	<Code content={cliInit} language="bash" />
	<p>
		This generates: <code>rokkit.config.js</code>, <code>uno.config.js</code>,
		<code>src/app.css</code>, and <code>src/app.html</code>. See the
		<a href="/docs/toolchain/cli">CLI reference</a> for all options.
	</p>

	<h2>Manual Installation</h2>
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

	<h2>Next Steps</h2>
	<div class="grid grid-cols-2 gap-3">
		{#each [{ label: 'Field Mapping', href: '/field-mapping', desc: 'Deep dive into the fields prop and data mapping' }, { label: 'Snippets', href: '/snippets', desc: 'Customize component rendering with Svelte snippets' }, { label: 'Components', href: '/components/list', desc: 'Browse the full component library' }, { label: 'Styling', href: '/styling', desc: 'Theming, colors, and visual customization' }] as link (link.href)}
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
