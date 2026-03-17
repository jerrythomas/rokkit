<script>
	// @ts-nocheck
	import { Code } from '$lib/components/Story'
	import createProject from './snippets/00-create-project.sh?raw'
	import install from './snippets/01-install.sh?raw'
	import unoConfig from './snippets/02-uno-config.js?raw'
	import appCss from './snippets/03-app-css.css?raw'
	import firstPage from './snippets/04-first-page.svelte?raw'
	import themeSwitcher from './snippets/05-theme-switcher.svelte?raw'
</script>

<article data-article-root>
	<p>
		This guide takes you from a fresh SvelteKit project to a working Rokkit app with navigation,
		selection, and theming in about ten minutes.
	</p>

	<h2>1. Create a SvelteKit project</h2>
	<p>If you don't have a project yet:</p>
	<Code content={createProject} language="bash" />

	<h2>2. Install Rokkit</h2>
	<Code content={install} language="bash" />

	<h2>3. Configure UnoCSS</h2>
	<p>
		Create or update <code>uno.config.js</code> at your project root. The <code>presetRokkit</code> helper
		registers the color system and semantic icon names:
	</p>
	<Code content={unoConfig} language="javascript" />

	<h2>4. Add theme CSS</h2>
	<p>In <code>src/app.css</code>:</p>
	<Code content={appCss} language="css" />
	<p>
		In <code>src/app.html</code>, add <code>data-style</code> and <code>data-mode</code> to
		<code>&lt;html&gt;</code>:
	</p>
	<pre><code>{`<html data-style="rokkit" data-mode="dark">`}</code></pre>

	<h2>5. Build your first page</h2>
	<p>
		Create <code>src/routes/+page.svelte</code>. Every Rokkit component follows the same pattern —
		pass <code>items</code>, tell it which <code>fields</code> to use, bind the selected
		<code>value</code>:
	</p>
	<Code content={firstPage} language="svelte" />

	<h2>6. Add the theme switcher</h2>
	<p>
		Drop <code>ThemeSwitcherToggle</code> from <code>@rokkit/app</code> anywhere in your layout to
		give users light/dark/system control:
	</p>
	<Code content={themeSwitcher} language="svelte" />

	<h2>Next steps</h2>
	<ul>
		<li><a href="/docs/data-binding">Data Binding</a> — field mapping, nested data, data sources</li>
		<li><a href="/docs/composability">Composability</a> — snippets, per-item rendering</li>
		<li><a href="/docs/theming">Theming</a> — color system, custom themes, dark mode</li>
		<li>
			<a href="/docs/components/list">Components</a> — full reference for List, Select, Tree, Table,
			and more
		</li>
	</ul>
</article>
