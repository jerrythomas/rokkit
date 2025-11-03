<script>
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<h1>Color Palette</h1>
	<p>
		The Rokkit library provides a versatile palette containing various shades of the following
		colors:
	</p>

	<div data-card>
		<h1>Available Colors:</h1>
		<ul class="grid grid-cols-2 gap-2 md:grid-cols-4">
			<li>Surface</li>
			<li>Primary</li>
			<li>Secondary</li>
			<li>Accent</li>
			<li>Success</li>
			<li>Warning</li>
			<li>Danger</li>
			<li>Info</li>
		</ul>
	</div>

	<p>
		Each color in the palette has shades ranging from 50 to 950, allowing users to customize the
		appearance of their applications with a wide range of color options.
	</p>

	<p>
		The preview section shows the current palette with all the colors and their respective shades.
		Try clicking on the dark/light mode toggle to see how the palette looks in different modes.
	</p>

	<!-- Interactive Demo -->

	<h1>Color Palette Preview</h1>
	<StoryViewer {...storyBuilder.getExample('example')} />
	<h1>Usage</h1>
	<p>
		Users can apply colors from the Rokkit palette to different elements of their application using
		the following classes:
	</p>

	<h1>Background Colors</h1>
	<Code {...storyBuilder.getFragment(0)} />
	<h1>Border Colors</h1>
	<Code {...storyBuilder.getFragment(1)} />
	<h1>Text Colors</h1>
	<Code {...storyBuilder.getFragment(2)} />

	<h1><span>💡</span>CSS Variables</h1>
	<p>You can also use CSS variables to apply colors directly to elements:</p>
	<Code {...storyBuilder.getFragment(3)} />
	<h1>Customization</h1>
	<p>
		The Rokkit library allows users to customize the palette by calling the <code
			class="bg-surface-z6 rounded px-2 py-1">themeRules(themename, mapping, colors)</code
		> function.
	</p>

	<h1>Function Parameters</h1>
	<ul class="space-y-3">
		<li>
			<strong class="text-primary-z8">themename</strong>: Name of the theme to be customized
		</li>
		<li>
			<strong class="text-primary-z8">mapping</strong>: A map that provides overrides for specific
			colors in the palette
		</li>
		<li>
			<strong class="text-primary-z8">colors</strong>: An object containing standard defaults for
			all palette colors
		</li>
	</ul>

	<h1>Example Implementation</h1>
	<Code {...storyBuilder.getFragment(4)} />

	<h1>Integration</h1>
	<p>
		You can include the call to the <code class="bg-surface-z6 rounded px-1">themeRules</code>
		function in your
		<code class="bg-surface-z6 rounded px-1">uno.config.js</code> in the rules section to apply the custom
		theme to your application.
	</p>

	<!-- Next Steps -->
	<section data-card-cta>
		<h2>Ready to customize?</h2>
		<p>
			By using the themeRules function, users can tailor the Rokkit palette to suit the specific
			design requirements of their application. They can also utilize CSS variables for more
			granular control over color application.
		</p>
		<div class="flex flex-wrap gap-3">
			<a href="/elements/list" class="button is-primary">
				Try with Components
				<span class="ml-2">→</span>
			</a>
		</div>
	</section>
</article>
