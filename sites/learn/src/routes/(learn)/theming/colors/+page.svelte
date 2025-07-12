<script>
	import { StoryViewer } from '$lib/components/Story'
	import { stories } from './stories.js'
</script>

<svelte:head>
	<title>Colors and Theming - Tutorial | Learn Rokkit</title>
	<meta name="description" content="Color palette and theming system" />
</svelte:head>

<div class="w-full space-y-8">
	<!-- Header -->
	<header class="border-neutral-subtle border-b pb-8">
		<div class="flex items-center space-x-3">
			<div class="text-4xl">🎨</div>
			<div>
				<h1 class="text-neutral-overlay text-4xl font-bold">Colors</h1>
				<p class="text-neutral-elevated mt-2 text-xl">
					Color palette and theming system
				</p>
			</div>
		</div>
	</header>

	<!-- Introduction -->
	<section>
		<h2 class="text-neutral-overlay mb-6 text-3xl font-bold">Color Palette</h2>
		<p class="text-neutral-floating mb-4 text-lg">
			The Rokkit library provides a versatile palette containing various shades of the following colors:
		</p>

		<div class="bg-neutral-subtle mb-6 rounded-lg p-6">
			<h3 class="text-neutral-overlay mb-4 text-xl font-semibold">Available Colors:</h3>
			<ul class="grid grid-cols-2 gap-2 md:grid-cols-4">
				<li class="flex items-center space-x-2">
					<span class="text-primary-500">•</span>
					<span>Neutral</span>
				</li>
				<li class="flex items-center space-x-2">
					<span class="text-primary-500">•</span>
					<span>Primary</span>
				</li>
				<li class="flex items-center space-x-2">
					<span class="text-primary-500">•</span>
					<span>Secondary</span>
				</li>
				<li class="flex items-center space-x-2">
					<span class="text-primary-500">•</span>
					<span>Accent</span>
				</li>
				<li class="flex items-center space-x-2">
					<span class="text-primary-500">•</span>
					<span>Success</span>
				</li>
				<li class="flex items-center space-x-2">
					<span class="text-primary-500">•</span>
					<span>Warning</span>
				</li>
				<li class="flex items-center space-x-2">
					<span class="text-primary-500">•</span>
					<span>Danger</span>
				</li>
				<li class="flex items-center space-x-2">
					<span class="text-primary-500">•</span>
					<span>Info</span>
				</li>
			</ul>
		</div>

		<p class="text-neutral-floating mb-6">
			Each color in the palette has shades ranging from 50 to 950, allowing users to customize the appearance of their applications with a wide range of color options.
		</p>

		<p class="text-neutral-floating mb-6">
			The preview section shows the current palette with all the colors and their respective shades. Try clicking on the dark/light mode toggle to see how the palette looks in different modes.
		</p>

		<!-- Interactive Demo -->
		<div class="mb-8">
			<h3 class="mb-4 text-2xl font-bold">Color Palette Preview</h3>
			{#await stories}
				<p>Loading...</p>
			{:then groupedStories}
				<StoryViewer {...groupedStories.example} />
			{/await}
		</div>
	</section>

	<!-- Usage -->
	<section class="mb-12">
		<h2 class="text-neutral-overlay mb-6 text-3xl font-bold">Usage</h2>
		<p class="text-neutral-floating mb-4 text-lg">
			Users can apply colors from the Rokkit palette to different elements of their application using the following classes:
		</p>

		<div class="space-y-4">
			<div class="border-neutral-subtle rounded-lg border p-4">
				<h3 class="text-primary-overlay mb-2 font-semibold">Background Colors</h3>
				<code class="bg-neutral-elevated rounded px-2 py-1 text-sm">bg-{'{color}'}-{'{shade}'}</code>
				<p class="text-neutral-floating mt-2 text-sm">
					Example: <code class="bg-neutral-elevated rounded px-1">bg-primary-500</code>
				</p>
			</div>

			<div class="border-neutral-subtle rounded-lg border p-4">
				<h3 class="text-primary-overlay mb-2 font-semibold">Border Colors</h3>
				<code class="bg-neutral-elevated rounded px-2 py-1 text-sm">border-{'{color}'}-{'{shade}'}</code>
				<p class="text-neutral-floating mt-2 text-sm">
					Example: <code class="bg-neutral-elevated rounded px-1">border-primary-500</code>
				</p>
			</div>

			<div class="border-neutral-subtle rounded-lg border p-4">
				<h3 class="text-primary-overlay mb-2 font-semibold">Text Colors</h3>
				<code class="bg-neutral-elevated rounded px-2 py-1 text-sm">text-{'{color}'}-{'{shade}'}</code>
				<p class="text-neutral-floating mt-2 text-sm">
					Example: <code class="bg-neutral-elevated rounded px-1">text-primary-500</code>
				</p>
			</div>
		</div>

		<div class="border-amber-subtle bg-amber-inset rounded-lg border p-6 mt-6">
			<div class="flex items-start space-x-3">
				<div class="text-2xl">💡</div>
				<div>
					<h3 class="text-amber-overlay mb-2 text-lg font-semibold">CSS Variables</h3>
					<p class="text-amber-floating">
						You can also use CSS variables to apply colors directly to elements. The format is 
						<code class="bg-amber-subtle rounded px-1">--{'{color}'}-{'{shade}'}</code>. For example: 
						<code class="bg-amber-subtle rounded px-1">background-color: var(--primary-500);</code>
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Customization -->
	<section class="mb-12">
		<h2 class="text-neutral-overlay mb-6 text-3xl font-bold">Customization</h2>
		<p class="text-neutral-floating mb-4 text-lg">
			The Rokkit library allows users to customize the palette by calling the <code class="bg-neutral-elevated rounded px-2 py-1">themeRules(themename, mapping, colors)</code> function.
		</p>

		<div class="space-y-6">
			<div class="border-neutral-subtle rounded-lg border p-6">
				<h3 class="mb-4 text-lg font-semibold">Function Parameters</h3>
				<ul class="space-y-3">
					<li>
						<strong class="text-primary-overlay">themename</strong>: Name of the theme to be customized
					</li>
					<li>
						<strong class="text-primary-overlay">mapping</strong>: A map that provides overrides for specific colors in the palette
					</li>
					<li>
						<strong class="text-primary-overlay">colors</strong>: An object containing standard defaults for all palette colors
					</li>
				</ul>
			</div>

			<div class="border-neutral-subtle rounded-lg border p-6">
				<h3 class="mb-4 text-lg font-semibold">Example Implementation</h3>
				<div class="bg-neutral-elevated rounded-md p-4">
					<code class="text-sm">
						<div class="text-gray-500">// Customizing the palette</div>
						<div><span class="text-blue-600">const</span> mapping = {'{'}</div>
						<div class="ml-4">primary: <span class="text-green-600">'norway'</span> <span class="text-gray-500">// Override Primary color with custom color</span></div>
						<div>{'}'}</div>
						<div><span class="text-blue-600">const</span> colors = {'{'}</div>
						<div class="ml-4">norway: {'{'}</div>
						<div class="ml-8">DEFAULT: <span class="text-green-600">'#83A666'</span>,</div>
						<div class="ml-8">50: <span class="text-green-600">'#E1EADA'</span>,</div>
						<div class="ml-8">100: <span class="text-green-600">'#D7E2CE'</span>,</div>
						<div class="ml-8">200: <span class="text-green-600">'#C2D3B4'</span>,</div>
						<div class="ml-8">300: <span class="text-green-600">'#ADC49A'</span>,</div>
						<div class="ml-8">400: <span class="text-green-600">'#98B580'</span>,</div>
						<div class="ml-8">500: <span class="text-green-600">'#83A666'</span>,</div>
						<div class="ml-8">600: <span class="text-green-600">'#6F9054'</span>,</div>
						<div class="ml-8">700: <span class="text-green-600">'#5B7645'</span>,</div>
						<div class="ml-8">800: <span class="text-green-600">'#475C36'</span>,</div>
						<div class="ml-8">900: <span class="text-green-600">'#334227'</span>,</div>
						<div class="ml-8">950: <span class="text-green-600">'#29361F'</span></div>
						<div class="ml-4">{'}'}</div>
						<div class="ml-4"><span class="text-gray-500">// Include other palette colors with custom values as needed</span></div>
						<div>{'}'}</div>
						<div><span class="text-blue-600">themeRules</span>(<span class="text-green-600">'custom'</span>, mapping, colors)</div>
					</code>
				</div>
			</div>

			<div class="border-neutral-subtle rounded-lg border p-6">
				<h3 class="mb-4 text-lg font-semibold">Integration</h3>
				<p class="text-neutral-floating">
					You can include the call to the <code class="bg-neutral-elevated rounded px-1">themeRules</code> function in your 
					<code class="bg-neutral-elevated rounded px-1">uno.config.js</code> in the rules section to apply the custom theme to your application.
				</p>
			</div>
		</div>
	</section>

	<!-- Next Steps -->
	<section class="bg-primary-inset rounded-lg p-6">
		<h3 class="text-primary-overlay mb-3 text-xl font-semibold">Ready to customize?</h3>
		<p class="text-primary-floating mb-4">
			By using the themeRules function, users can tailor the Rokkit palette to suit the specific design requirements of their application. They can also utilize CSS variables for more granular control over color application.
		</p>
		<div class="flex flex-wrap gap-3">
			<a
				href="/tutorial/elements/list"
				class="bg-primary-overlay hover:bg-primary-hover focus:ring-primary-subtle inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
			>
				Try with Components
				<span class="ml-2">→</span>
			</a>
		</div>
	</section>
</div>