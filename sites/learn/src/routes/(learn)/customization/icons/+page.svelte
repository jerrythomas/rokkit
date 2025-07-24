<script>
	import { Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<p>
		Rokkit UI provides a unified, data-driven icon system that makes icon customization simple,
		consistent, and scalable across your entire application. All components use shared icon keys, so
		you only need to define your icon mapping once for your whole app.
	</p>

	<h2>Global Icon Mapping</h2>
	<p>
		Define your icon shortcuts in your UnoCSS config to ensure all components use your chosen icon
		set. This guarantees consistency and enables compile-time performance.
	</p>
	<Code {...storyBuilder.getFragment(0)} />

	<h2>Per-Component Icon Overrides</h2>
	<p>
		If you need to customize icons for a specific component, pass an <code>icons</code> object using
		the <strong>base icon names</strong> as keys:
	</p>
	<Code {...storyBuilder.getFragment(1)} />
	<p>
		<strong>Note:</strong> Use the <em>base</em> icon names (e.g., <code>add</code>,
		<code>remove</code>), not the full keys like <code>action-add</code>.
	</p>

	<h2>Advanced: Custom Icon Collections</h2>
	<p>
		You can use custom icon collections or external icon sets (SVG, Iconify, JSON, etc.) by
		configuring UnoCSS presets:
	</p>
	<Code {...storyBuilder.getFragment(2)} />

	<h2>Best Practices</h2>
	<ul>
		<li>Use shared icon keys for consistency across all components.</li>
		<li>Prefer global mapping via UnoCSS for performance and maintainability.</li>
		<li>Override icons per component only when necessary for special cases.</li>
		<li>Leverage custom icon collections for branding or advanced use cases.</li>
	</ul>

	<h2>Further Reading</h2>
	<ul>
		<li>
			<a href="/customization/overview" class="text-primary-600 underline">Customization Overview</a
			>
		</li>
		<li>
			<a href="/customization/details" class="text-primary-600 underline">Customization Details</a>
		</li>
		<li>
			<a href="/customization/colors" class="text-primary-600 underline">Colors & Palettes</a>
		</li>
		<li>
			<a href="/customization/styles" class="text-primary-600 underline"
				>Style & Skin Customization</a
			>
		</li>
	</ul>
</article>
