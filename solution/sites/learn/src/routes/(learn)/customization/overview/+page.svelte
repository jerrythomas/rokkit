<script>
	// No JS needed for static overview, but you could import navigation helpers if desired
</script>

<article data-article-root>
	<p>
		<strong>
			Rokkit’s customization system lets you create beautiful, branded, and accessible
			interfaces—without fighting your tools.
		</strong>
		With a unified Theme API, semantic color and icon mapping, and instant skin switching, you can adapt
		your app’s look and feel in minutes.
	</p>

	<h2>The Theme System</h2>
	<p>
		The Theme system is the foundation for all UI customization. It consists of five main
		dimensions:
	</p>
	<ul>
		<li>
			<strong>Mode:</strong> Light or dark appearance, controlled by <code>data-mode</code> (e.g.,
			<code>data-mode="light"</code>).
		</li>
		<li>
			<strong>Palette:</strong> Your brand’s color identity and status colors (surface, primary,
			secondary, accent, info, warning, error, success), controlled by <code>data-palette</code>.
			You can define your own colors and map them to these roles.
		</li>
		<li>
			<strong>Style:</strong> The visual style for your components (e.g., Rokkit, Material,
			Minimal), controlled by <code>data-style</code>.
		</li>
		<li>
			<strong>Density:</strong> Controls spacing and compactness (compact, base, cozy), controlled
			by <code>data-density</code>.
		</li>
		<li>
			<strong>Icons:</strong> The icon set and mapping for your application, controlled by your theme
			configuration. You can use built-in icon sets, provide your own, and map icons globally or per
			component.
		</li>
	</ul>
	<p>
		These attributes are typically set on the <code>&lt;body&gt;</code> tag. All Rokkit components are
		unstyled by default and the built in styles respond to these attributes, enabling instant, global
		changes to your app’s appearance.
	</p>

	<h2>Palette</h2>
	<p>
		The <strong>Palette</strong> is the heart of your application's color system. It is divided into
		two groups:
	</p>

	<h3>Branding Colors</h3>
	<table>
		<thead>
			<tr>
				<th>Color</th>
				<th>Description</th>
			</tr>
		</thead>
		<tbody class="text-on-surface">
			<tr>
				<td><code class="bg-surface-500">surface</code></td>
				<td>Backgrounds and surfaces</td>
			</tr>
			<tr>
				<td><code class="bg-primary-500">primary</code></td>
				<td>Main brand color</td>
			</tr>
			<tr>
				<td><code class="bg-secondary-500">secondary</code></td>
				<td>Secondary accent</td>
			</tr>
			<tr>
				<td><code class="bg-accent-500">accent</code></td>
				<td>Additional highlight or accent</td>
			</tr>
		</tbody>
	</table>
	<h3>Status Colors</h3>
	<table>
		<thead>
			<tr>
				<th>Color</th>
				<th>Description</th>
			</tr>
		</thead>
		<tbody class="text-on-surface">
			<tr>
				<td><code class="bg-info-500">info</code></td>
				<td>Informational highlights</td>
			</tr>
			<tr>
				<td><code class="bg-success-500">success</code></td>
				<td>Success/confirmation</td>
			</tr>
			<tr>
				<td><code class="bg-warning-500">warning</code></td>
				<td>Warnings or cautions</td>
			</tr>
			<tr>
				<td><code class="bg-error-500">error</code></td>
				<td>Errors or destructive actions</td>
			</tr>
		</tbody>
	</table>

	<p>
		You can map each of these roles to any color in your palette—either using Rokkit’s built-in
		color sets or your own custom colors. This mapping allows you to instantly adapt your UI to your
		brand and accessibility needs, while keeping all components consistent.
	</p>

	<section>
		<h2>Styles</h2>
		<p>
			Rokkit UI comes with three built-in visual styles ("skins") that you can use out of the box:
		</p>
		<ul>
			<li>
				<strong>Rokkit</strong>: The default, data-driven style focused on clarity and
				composability.
			</li>
			<li>
				<strong>Material</strong>: Inspired by Material Design, offering familiar elevation and
				surface cues.
			</li>
			<li><strong>Minimal</strong>: A clean, understated look for maximum content focus.</li>
		</ul>
		<p>
			Developers can also roll out their own custom styles—either from scratch or by extending one
			of the built-in styles—using UnoCSS shortcuts, custom palettes, and variants. This makes it
			easy to match your brand or create a unique look for your application.
		</p>
	</section>

	<h2>How It All Fits Together</h2>
	<pre>
 [Theme]
   ↓
[Palette/Skins]   [Icon Mapping]
   ↓                  ↓
[Semantic Colors]   [Icon Shortcuts]
   ↓                  ↓
[Components: Buttons, Lists, Forms, etc.]
	</pre>
	<ul>
		<li>
			<strong>Theme:</strong> Central configuration for palettes, skins, icons, spacing, and variants.
		</li>
		<li>
			<strong>Palette/Skins:</strong> Bundles of color roles and style rules for instant theme switching.
		</li>
		<li>
			<strong>Semantic Colors:</strong> Use roles like <code>primary</code>, <code>info</code>,
			<code>danger</code>—not hardcoded colors.
		</li>
		<li>
			<strong>Icon Mapping:</strong> Unified icon keys, global and per-component overrides.
		</li>
	</ul>

	<h2>Customization Workflow</h2>
	<ol>
		<li>
			<strong>Configure your Theme:</strong> Define your palette, skins, spacing, and variants in one
			place.
		</li>
		<li>
			<strong>Customize Colors & Icons:</strong> Map semantic roles to your brand colors and icon sets.
		</li>
		<li>
			<strong>Apply Skins & Variants:</strong> Switch skins or variants globally or per component.
		</li>
		<li>
			<strong>Use in Components:</strong> All Rokkit components respond to your theme, palette, and icon
			mapping.
		</li>
	</ol>

	<h2>Built-in Style Paradigms</h2>
	<p>Rokkit ships with three foundational style paradigms:</p>
	<ul>
		<li>
			<strong>rokkit</strong>: The default, data-driven style focused on clarity and composability.
		</li>
		<li>
			<strong>material</strong>: Inspired by Material Design, offering familiar elevation and
			surface cues.
		</li>
		<li><strong>minimal</strong>: A clean, understated look for maximum content focus.</li>
	</ul>
	<p>You can use these out-of-the-box or extend them to create your own custom style systems.</p>

	<h2>Component-Level Variants</h2>
	<p>Each component supports style variants for further customization:</p>
	<ul>
		<li><code>default</code>: Standard appearance.</li>
		<li><code>filled</code>: Opaque backgrounds for emphasis.</li>
		<li><code>outlined</code>: Border-only style for subtlety.</li>
	</ul>
	<p>Variants can be combined with skins and spacing modes for a wide range of visual outcomes.</p>

	<h2>Key Concepts</h2>
	<ul>
		<li>
			<strong>Theme API:</strong> One place to manage palettes, skins, icons, spacing, and variants.
		</li>
		<li>
			<strong>Palette Mapping:</strong> Map semantic roles to any color set (built-in or custom).
		</li>
		<li><strong>Skin Shortcuts:</strong> Switch between multiple branded looks instantly.</li>
		<li>
			<strong>Icon Shortcuts:</strong> Use shared icon keys for consistency and easy overrides.
		</li>
		<li>
			<strong>Variants & Spacing:</strong> Control density and appearance at both global and component
			levels.
		</li>
	</ul>

	<h2>Try It Live</h2>
	<ul>
		<li>
			<a href="/playground">Playground</a>: Experiment with palette, skin, and icon switching in
			real time.
		</li>
		<li>
			<a href="/customization/details">API Reference</a>: Dive into the Theme API and configuration
			recipes.
		</li>
		<li>
			<a href="/customization/colors">Colors</a>: Learn about semantic color mapping and skin
			switching.
		</li>
		<li>
			<a href="/customization/icons">Icons</a>: See how to map and override icons globally or per
			component.
		</li>
	</ul>

	<h2>Next Steps</h2>
	<ul>
		<li>
			Start with the <a href="/customization/details">API Reference</a> to configure your first theme.
		</li>
		<li>
			Explore <a href="/customization/colors">Colors</a> and
			<a href="/customization/icons">Icons</a> for deeper customization.
		</li>
		<li>Try the <a href="/playground">Playground</a> to see your changes in action.</li>
	</ul>
</article>

<style>
	td > code {
		@apply rounded-full px-3 py-1;
	}
</style>
