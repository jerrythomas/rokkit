<script>
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<svelte:head>
	<title>Colors and Theming - Tutorial | Learn Rokkit</title>
	<meta name="description" content="Color palette and theming system" />
</svelte:head>

<article data-article-root>
	<!-- Header -->
	<header>
		<h1><span>🎨</span> Colors</h1>
		<p>Color palette and theming system</p>
	</header>

	<!-- Introduction -->
	<section>
		<h2>Color Palette</h2>
		<p>
			The Rokkit library provides a versatile palette containing various shades of the following
			colors:
		</p>

		<div data-card>
			<h3>Available Colors:</h3>
			<ul class="grid grid-cols-2 gap-2 md:grid-cols-4">
				<li>Neutral</li>
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

		<h3>Color Palette Preview</h3>
		<StoryViewer {...storyBuilder.getExample('example')} />
	</section>

	<!-- Usage -->
	<section>
		<h2>Usage</h2>
		<p>
			Users can apply colors from the Rokkit palette to different elements of their application
			using the following classes:
		</p>

		<h3>Background Colors</h3>
		<Code {...storyBuilder.getFragment(0)} />
		<h3>Border Colors</h3>
		<Code {...storyBuilder.getFragment(1)} />
		<h3>Text Colors</h3>
		<Code {...storyBuilder.getFragment(2)} />

		<h3><span>💡</span>CSS Variables</h3>
		<p>You can also use CSS variables to apply colors directly to elements:</p>
		<Code {...storyBuilder.getFragment(3)} />
	</section>

	<!-- Customization -->
	<section class="mb-12">
		<h2>Customization</h2>
		<p>
			The Rokkit library allows users to customize the palette by calling the <code
				class="bg-neutral-elevated rounded px-2 py-1">themeRules(themename, mapping, colors)</code
			> function.
		</p>

		<h3>Function Parameters</h3>
		<ul class="space-y-3">
			<li>
				<strong class="text-primary-overlay">themename</strong>: Name of the theme to be customized
			</li>
			<li>
				<strong class="text-primary-overlay">mapping</strong>: A map that provides overrides for
				specific colors in the palette
			</li>
			<li>
				<strong class="text-primary-overlay">colors</strong>: An object containing standard defaults
				for all palette colors
			</li>
		</ul>

		<h3>Example Implementation</h3>
		<Code {...storyBuilder.getFragment(4)} />

		<h3>Integration</h3>
		<p>
			You can include the call to the <code class="bg-neutral-elevated rounded px-1"
				>themeRules</code
			>
			function in your
			<code class="bg-neutral-elevated rounded px-1">uno.config.js</code> in the rules section to apply
			the custom theme to your application.
		</p>
	</section>

	<!-- Next Steps -->
	<section data-card-cta>
		<h3>Ready to customize?</h3>
		<p>
			By using the themeRules function, users can tailor the Rokkit palette to suit the specific
			design requirements of their application. They can also utilize CSS variables for more
			granular control over color application.
		</p>
		<div class="flex flex-wrap gap-3">
			<a href="/tutorial/elements/list" class="button is-primary">
				Try with Components
				<span class="ml-2">→</span>
			</a>
		</div>
	</section>
</article>
