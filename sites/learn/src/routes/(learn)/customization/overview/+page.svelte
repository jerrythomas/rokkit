<script>
	// No JS needed for static overview, but you could import navigation helpers if desired
</script>

<article data-article-root>
	<p>
		Rokkit UI is designed for powerful, scalable, and consistent customization across your entire
		application. The core of this system is the <strong>Theme</strong> class, which provides a unified
		API for configuring palettes, semantic color shortcuts, skins, and more—all integrated with UnoCSS
		for compile-time performance.
	</p>

	<h2>Customization Pillars</h2>
	<ul>
		<li>
			<strong>Theme Class:</strong> Central utility for palettes, semantic color roles, and style shortcuts.
		</li>
		<li>
			<strong>Icons:</strong> Unified icon mapping and flexible overrides for consistent visuals.
		</li>
		<li><strong>Styles:</strong> Multiple style paradigms and skin shortcuts for easy theming.</li>
		<li><strong>Colors:</strong> Semantic palette configuration and dark/light mode support.</li>
	</ul>

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
	<h2>Spacing Modes</h2>
	<p>Rokkit supports three global spacing modes to control padding and margin density:</p>
	<ul>
		<li><code>compact</code>: Minimal padding/margins for dense layouts.</li>
		<li><code>comfortable</code>: Default spacing for balanced layouts.</li>
		<li><code>cozy</code>: Extra padding/margins for relaxed, spacious layouts.</li>
	</ul>
	<p>Spacing can be set globally or overridden per component for granular control.</p>

	<h2>Component-Level Variants</h2>
	<p>Each component supports style variants for further customization:</p>
	<ul>
		<li><code>default</code>: Standard appearance.</li>
		<li><code>filled</code>: Opaque backgrounds for emphasis.</li>
		<li><code>outlined</code>: Border-only style for subtlety.</li>
	</ul>
	<p>Variants can be combined with skins and spacing modes for a wide range of visual outcomes.</p>

	<h2>Extending Styles</h2>
	<p>
		To create your own style system, simply define new UnoCSS shortcuts, palettes, and variants.
		Rokkit’s architecture ensures that your customizations are consistent and easy to maintain
		across all components.
	</p>
	<h2>How It Works</h2>
	<ol>
		<li>
			<strong>Configure Theme:</strong>
			<br />
			Use the <code>Theme</code> class to define your palette, generate semantic color shortcuts, and
			create skins.
		</li>
		<li>
			<strong>Customize Icons:</strong>
			<br />
			Map icons globally or override per component for flexibility and consistency.
		</li>
		<li>
			<strong>Choose Styles:</strong>
			<br />
			Select or extend built-in style paradigms (rokkit, material, minimal) and switch between skins.
		</li>
		<li>
			<strong>Semantic Colors:</strong>
			<br />
			Use z-indexed color shortcuts (e.g., <code>bg-neutral-z1</code> to
			<code>bg-neutral-z10</code>) for adaptive theming.
		</li>
	</ol>

	<h2>Learn More</h2>
	<ul>
		<li>
			<a href="theme">Theme Class & Configuration</a>
		</li>
		<li>
			<a href="./icons">Icon Customization</a>
		</li>
		<li>
			<a href="./styles">Styles & Skins</a>
		</li>
		<li>
			<a href="./colors">Colors & Palettes</a>
		</li>
	</ul>

	<h2>Best Practices</h2>
	<ul>
		<li>Use shared keys and shortcuts for icons and colors to maintain a unified look.</li>
		<li>Prefer compile-time customization for optimal build size and speed.</li>
		<li>Extend built-in styles and palettes to match your brand or design system.</li>
		<li>Review the details pages for code examples and advanced usage.</li>
	</ul>
</article>
