<script>
	// @ts-nocheck
	import { Code } from '$lib/components/Story'
	import initCmd from './snippets/00-init.sh?raw'
	import doctorCmd from './snippets/01-doctor.sh?raw'
	import doctorManualFix from './snippets/02-doctor-manual-fix.js?raw'
	import iconTools from './snippets/03-icon-tools.sh?raw'
	import rokkitConfig from './snippets/04-rokkit-config.js?raw'
	import appCssOutput from './snippets/05-app-css-output.css?raw'
	import installCmd from './snippets/06-install.sh?raw'
	import upgradeCmd from './snippets/07-upgrade.sh?raw'
	import skinCmd from './snippets/08-skin.sh?raw'
	import skinConfig from './snippets/09-skin-config.js?raw'
	import themeCmd from './snippets/10-theme.sh?raw'
	import themeStub from './snippets/11-theme-stub.css?raw'
</script>

<article data-article-root>
	<p class="text-surface-z6 mb-8 text-[1.0625rem] leading-7">
		The Rokkit CLI automates project setup and ongoing maintenance. It handles config file
		generation, dependency verification, and icon bundling.
	</p>

	<h2>Installation</h2>
	<p>
		Run without installing using <code>npx</code>, or install globally to use <code>rokkit</code>
		directly:
	</p>
	<Code content={installCmd} language="bash" />

	<h2>rokkit init</h2>
	<p>
		Interactive setup for an existing SvelteKit project. Run from the project root. Prompts you for
		palette, icon collections, theme styles, and theme switching mode:
	</p>
	<Code content={initCmd} language="bash" />

	<h3>Prompts</h3>
	<table>
		<thead>
			<tr><th>Prompt</th><th>Type</th><th>Choices</th></tr>
		</thead>
		<tbody>
			<tr
				><td><code>palette</code></td><td>select</td><td
					><code>default</code> (orange/pink/sky), <code>vibrant</code> (blue/purple/sky),
					<code>seaweed</code> (sky/green/blue), <code>custom</code></td
				></tr
			>
			<tr
				><td><code>primary / secondary / accent / surface</code></td><td>text</td><td
					>Tailwind palette names — only shown when <code>palette</code> is <code>custom</code></td
				></tr
			>
			<tr
				><td><code>icons</code></td><td>select</td><td
					><code>rokkit</code> (built-in only), <code>custom</code> (add a custom collection)</td
				></tr
			>
			<tr
				><td><code>iconPath</code></td><td>text</td><td
					>Path to custom icon JSON — only shown when <code>icons</code> is <code>custom</code></td
				></tr
			>
			<tr
				><td><code>themes</code></td><td>multiselect</td><td
					><code>rokkit</code> (default), <code>minimal</code>, <code>material</code></td
				></tr
			>
			<tr
				><td><code>switcher</code></td><td>select</td><td
					><code>system</code> (prefers-color-scheme), <code>manual</code> (light/dark toggle),
					<code>full</code> (light/dark + style variants)</td
				></tr
			>
		</tbody>
	</table>

	<h3>Files written</h3>
	<table>
		<thead>
			<tr><th>File</th><th>What happens</th></tr>
		</thead>
		<tbody>
			<tr
				><td><code>rokkit.config.js</code></td><td
					>Written with your color palette, themes, and switcher settings. Skipped if it already
					exists.</td
				></tr
			>
			<tr
				><td><code>uno.config.js</code></td><td
					>Written with <code>presetRokkit()</code>. Skipped if already present — run
					<code>rokkit doctor</code> for migration hints.</td
				></tr
			>
			<tr
				><td><code>src/app.css</code></td><td
					>Prepends <code>@unocss/reset/tailwind.css</code>, <code>@rokkit/themes/dist/base</code>,
					and each selected theme (e.g. <code>@rokkit/themes/dist/rokkit</code>). Creates the file
					if missing.</td
				></tr
			>
			<tr
				><td><code>src/app.html</code></td><td
					>Injects a flash-prevention script after <code>&lt;body&gt;</code> to restore saved
					theme/mode before paint. Skipped when switcher is <code>system</code> or when already present.</td
				></tr
			>
		</tbody>
	</table>

	<h3>Generated rokkit.config.js</h3>
	<p>
		This file is read automatically by <code>presetRokkit()</code> — no arguments needed in your UnoCSS
		config:
	</p>
	<Code content={rokkitConfig} language="javascript" />

	<h3>Generated app.css imports</h3>
	<Code content={appCssOutput} language="css" />

	<h2>rokkit doctor</h2>
	<p>
		Validates your Rokkit setup is correctly configured. Run when something looks broken or after
		manual changes:
	</p>
	<Code content={doctorCmd} language="bash" />

	<h3>Checks</h3>
	<table>
		<thead>
			<tr><th>ID</th><th>What it verifies</th><th>Auto-fixable</th></tr>
		</thead>
		<tbody>
			<tr
				><td><code>config-exists</code></td><td><code>rokkit.config.js</code> present</td><td
					>Yes — generates an empty config</td
				></tr
			>
			<tr
				><td><code>uno-uses-preset</code></td><td
					><code>uno.config.js</code> uses <code>presetRokkit()</code></td
				><td>No — manual fix required</td></tr
			>
			<tr
				><td><code>css-imports</code></td><td
					><code>app.css</code> has <code>@rokkit/themes/dist/base</code> import</td
				><td>Yes — prepends missing imports</td></tr
			>
			<tr
				><td><code>html-init-script</code></td><td
					><code>app.html</code> has flash-prevention script</td
				><td>Yes — injects script after <code>&lt;body&gt;</code></td></tr
			>
		</tbody>
	</table>
	<p>Exit codes: <code>0</code> = all checks pass, <code>1</code> = one or more failures.</p>

	<h3>Manual fix: uno-uses-preset</h3>
	<p>
		<code>doctor --fix</code> will not overwrite an existing <code>uno.config.js</code>. Add
		<code>presetRokkit</code> manually:
	</p>
	<Code content={doctorManualFix} language="javascript" />

	<h2>rokkit upgrade</h2>
	<p>
		Check for available updates to all <code>@rokkit/*</code> packages in your project. Compares
		installed versions against the latest published releases:
	</p>
	<Code content={upgradeCmd} language="bash" />
	<p>
		Without <code>--apply</code>, upgrade prints a diff and the install command to run. With
		<code>--apply</code>, it detects your package manager (bun, pnpm, yarn, or npm from lockfiles)
		and runs the install automatically.
	</p>

	<h2>rokkit skin</h2>
	<p>
		Manage color skins — named palettes defined in <code>rokkit.config.js</code>. A skin maps each
		semantic color role to a Tailwind palette name:
	</p>
	<Code content={skinCmd} language="bash" />
	<p>
		<code>skin create</code> adds a scaffold entry with all nine token keys (<code>primary</code>,
		<code>secondary</code>, <code>accent</code>, <code>surface</code>, <code>success</code>,
		<code>warning</code>, <code>danger</code>, <code>error</code>, <code>info</code>) set to
		default color names. Edit the values then activate with <code>data-skin="&lt;name&gt;"</code>:
	</p>
	<Code content={skinConfig} language="javascript" />

	<h2>rokkit theme</h2>
	<p>
		Manage visual styles — full CSS theme files that control every component's appearance. Built-in
		themes come from <code>@rokkit/themes</code>; custom themes live in <code>src/themes/</code>:
	</p>
	<Code content={themeCmd} language="bash" />
	<p>
		<code>theme create</code> generates a complete CSS stub at <code>src/themes/&lt;name&gt;.css</code
		> with one <code>[data-style='&lt;name&gt;']</code> block for every component. Import it in
		<code>src/app.css</code> and activate with <code>data-style="&lt;name&gt;"</code> on the body:
	</p>
	<Code content={themeStub} language="css" />

	<h2>Icon Tools</h2>
	<p>
		For icon library authors. Bundle your own SVG folders into Iconify-compatible JSON files. Not
		required for standard Rokkit projects.
	</p>
	<Code content={iconTools} language="bash" />
	<table>
		<thead>
			<tr><th>Command</th><th>Output</th><th>Use when</th></tr>
		</thead>
		<tbody>
			<tr
				><td><code>rokkit bundle</code></td><td>One JSON file per subfolder</td><td
					>Embedding icons in an app</td
				></tr
			>
			<tr
				><td><code>rokkit build</code></td><td
					>Full Iconify package (with <code>prefix</code>, <code>icons</code>, width/height)</td
				><td>Publishing as a standalone package</td></tr
			>
		</tbody>
	</table>
	<table>
		<thead>
			<tr><th>Flag</th><th>Short</th><th>Default</th><th>Description</th></tr>
		</thead>
		<tbody>
			<tr
				><td><code>--input</code></td><td><code>-i</code></td><td><code>./src</code></td><td
					>Source folder with SVG subfolders</td
				></tr
			>
			<tr
				><td><code>--output</code></td><td><code>-o</code></td><td><code>./lib</code></td><td
					>Output folder for JSON files</td
				></tr
			>
			<tr
				><td><code>--config</code></td><td><code>-c</code></td><td><code>config.json</code></td><td
					>Config file relative to input folder</td
				></tr
			>
		</tbody>
	</table>

	<h2>Related</h2>
	<ul>
		<li>
			<a href="/docs/getting-started/quick-start">Quick Start</a> — step-by-step from install to first
			component
		</li>
		<li>
			<a href="/docs/toolchain/icon-sets">Icon Sets</a> — available collections and UnoCSS integration
		</li>
	</ul>
</article>
