<script>
	import { Code } from '$lib/components/Story'
	import initCmd from './snippets/00-init.sh?raw'
	import doctorCmd from './snippets/01-doctor.sh?raw'
	import doctorManualFix from './snippets/02-doctor-manual-fix.js?raw'
	import iconTools from './snippets/03-icon-tools.sh?raw'
</script>

<article data-article-root>
	<p class="text-surface-z6 mb-8 text-[1.0625rem] leading-7">
		The Rokkit CLI automates project setup and ongoing maintenance. It handles config file
		generation, dependency verification, and icon bundling.
	</p>

	<h2>rokkit init</h2>
	<p>Interactive setup for new projects. Run once after creating your SvelteKit app:</p>
	<Code content={initCmd} language="bash" />
	<p>The init command runs interactive prompts for:</p>
	<ul>
		<li>
			<strong>Color palette</strong> — built-in or custom primary/secondary/accent/surface colors
		</li>
		<li><strong>Icon collection</strong> — which icon set to use (e.g., Solar icons)</li>
		<li>
			<strong>Theme styles</strong> — which styles to include: <code>rokkit</code>,
			<code>minimal</code>, <code>material</code>
		</li>
		<li>
			<strong>Switcher mode</strong> — <code>system</code> (follows OS), <code>manual</code>, or
			<code>full</code> (all options)
		</li>
	</ul>
	<p>Files written by <code>rokkit init</code>:</p>
	<ul>
		<li><code>rokkit.config.js</code> — palette and style configuration</li>
		<li><code>uno.config.js</code> — UnoCSS config with <code>presetRokkit()</code></li>
		<li><code>src/app.css</code> — theme CSS imports</li>
		<li>
			<code>src/app.html</code> — <code>data-style</code> and <code>data-mode</code> attributes on
			<code>&lt;html&gt;</code>
		</li>
	</ul>

	<h2>rokkit doctor</h2>
	<p>
		Verifies your Rokkit setup is correctly configured. Run when something looks broken or after
		manual changes:
	</p>
	<Code content={doctorCmd} language="bash" />
	<p>Doctor checks:</p>
	<table>
		<thead>
			<tr><th>Check</th><th>What it verifies</th><th>Auto-fixable</th></tr>
		</thead>
		<tbody>
			<tr
				><td><code>config-exists</code></td><td
					><code>rokkit.config.js</code> present</td
				><td>Yes</td></tr
			>
			<tr
				><td><code>css-imported</code></td><td
					>Theme CSS imported in <code>app.css</code></td
				><td>Yes</td></tr
			>
			<tr
				><td><code>html-has-attrs</code></td><td
					><code>data-style</code> on <code>&lt;html&gt;</code> in <code>app.html</code></td
				><td>Yes</td></tr
			>
			<tr
				><td><code>uno-uses-preset</code></td><td
					><code>presetRokkit()</code> in <code>uno.config.js</code></td
				><td>No — manual fix required</td></tr
			>
		</tbody>
	</table>
	<p>Exit codes: <code>0</code> = all checks pass, <code>1</code> = one or more failures.</p>
	<p>
		The <code>uno-uses-preset</code> check cannot be auto-fixed because UnoCSS config files vary
		too much in structure. Manual fix:
	</p>
	<Code content={doctorManualFix} language="javascript" />

	<h2>Icon tools</h2>
	<p>For icon library authors. Bundle and build custom icon collections for use with Rokkit:</p>
	<Code content={iconTools} language="bash" />
	<ul>
		<li>
			<strong>bundle</strong> — Packages SVG icons into a distributable icon collection
		</li>
		<li>
			<strong>build</strong> — Generates icon metadata (names, categories) from SVG source files
		</li>
	</ul>

	<h2>Related</h2>
	<ul>
		<li>
			<a href="/docs/getting-started/installation">Installation</a> — Setting up a new project with
			the CLI
		</li>
		<li>
			<a href="/docs/utilities/unocss">UnoCSS</a> — <code>presetRokkit</code> reference
		</li>
	</ul>
</article>
