<article data-article-root>
	<p class="text-surface-z6 mb-8 text-[1.0625rem] leading-7">
		Rokkit ships curated icon sets for navigation, status, actions, and auth providers. All sets are
		in Iconify JSON format and integrate with UnoCSS via <code>presetRokkit</code>.
	</p>

	<h2>Available Collections</h2>
	<table>
		<thead>
			<tr><th>Collection</th><th>UnoCSS prefix</th><th>Contents</th></tr>
		</thead>
		<tbody>
			<tr
				><td><code>@rokkit/icons/auth.json</code></td><td><code>i-logo:</code></td><td
					>Auth platforms, social providers, auth methods with variants</td
				></tr
			>
			<tr
				><td><code>@rokkit/icons/app.json</code></td><td><code>i-app:</code></td><td
					>Application-level icons (navigation, actions)</td
				></tr
			>
			<tr
				><td><code>@rokkit/icons/components.json</code></td><td><code>i-component:</code></td><td
					>Component-specific icons</td
				></tr
			>
			<tr
				><td><code>@rokkit/icons/ui.json</code></td><td><code>i-base:</code></td><td
					>Base UI icons</td
				></tr
			>
			<tr
				><td><code>@rokkit/icons/solid.json</code></td><td><code>i-solid:</code></td><td
					>Solid fill variants</td
				></tr
			>
			<tr
				><td><code>@rokkit/icons/light.json</code></td><td><code>i-light:</code></td><td
					>Light stroke variants</td
				></tr
			>
		</tbody>
	</table>

	<h2>Configuration</h2>
	<p>Register collections in <code>rokkit.config.js</code>:</p>
	<pre><code
			>{`icons: {
  logo: '@rokkit/icons/auth.json',
  app:  '@rokkit/icons/app.json',
  component: '@rokkit/icons/components.json',
}`}</code
		></pre>

	<h2>Browse Icons</h2>
	<p>
		Use the <a href="/playground/icons">Icon Browser playground</a> to visually explore all collections,
		see auth icon variants grouped by category, and copy icon class names.
	</p>
</article>
