<script>
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<svelte:head>
	<title>Item - Primitives | Learn Rokkit</title>
	<meta
		name="description"
		content="Versatile component for rendering text, icons, and images with field mapping support"
	/>
</svelte:head>

<article data-article-root>
	<!-- Header -->
	<header>
		<div class="flex items-center space-x-3">
			<div>
				<h1><span>🧩</span>Item Component</h1>
				<p>
					Versatile component for rendering text, icons, and images with field mapping support
				</p>
			</div>
		</div>
	</header>

	<!-- Introduction -->
	<section>
		<h2>Introduction</h2>
		<p>
			We will learn about the versatile `Item` component that can render various content types, including text, icon, state-based icon, or an image along with text. This component accepts a string or an object as a value and an optional `mapping` prop for field mapping.
		</p>

		<!-- Basic Usage Demo -->
		<div class="mb-8">
			<h3>Basic Usage</h3>
			<p>
				To render different types of content, pass various data structures to the `value` prop:
			</p>

			<StoryViewer {...storyBuilder.getExample('intro')} />
		</div>

		<div data-card>
			<h3>Rendering Different Content Types:</h3>
			<div class="space-y-4">
				<div data-content-block>
					<h4>Simple Text</h4>
					<Code {...storyBuilder.getFragment(0)} />
				</div>
				<div data-content-block>
					<h4>Icon and Text</h4>
					<Code {...storyBuilder.getFragment(1)} />
				</div>
				<div data-content-block>
					<h4>Image and Text</h4>
					<Code {...storyBuilder.getFragment(2)} />
				</div>
			</div>
			<p>
				Note that the component only renders the icon, image & text, but does not put a wrapper element around it. In the preview, we have used an item tag to wrap the `Item` component.
			</p>
		</div>
	</section>

	<!-- State-based Icons -->
	<section class="mb-12">
		<h2>State-based Icons</h2>
		<p>
			To render text with a state-based icon, pass an object that includes the text, icon, and state fields:
		</p>

		<StoryViewer {...storyBuilder.getExample('state')} />

		<div data-card>
			<h3>State-based Icon Implementation:</h3>
			<Code {...storyBuilder.getFragment(3)} />
			<p>
				The icon will automatically switch based on the state value, choosing between the 'open' and 'close' icons.
			</p>
		</div>
	</section>

	<!-- Field Mapping -->
	<section class="mb-12">
		<h2>Field Mapping</h2>
		<p>
			The Item component allows you to provide field mappings using the `fields` prop. These mappings enable you to customize the attributes it uses to the content from the provided value.
		</p>

		<StoryViewer {...storyBuilder.getExample('mapping')} />

		<div data-card>
			<h3>Field Mapping Example:</h3>
			<Code {...storyBuilder.getFragment(4)} />
			<p>
				The flexibility of field mapping and the ability to render various combinations of text, icons, and images make this component the default item renderer for many of the data-driven components.
			</p>
		</div>
	</section>

	<!-- Properties -->
	<section class="mb-12">
		<h2>Properties</h2>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div data-card>
				<h3>Core Properties</h3>
				<ul class="space-y-3 text-sm">
					<li><strong>value</strong>: String or object with content data (required)</li>
					<li><strong>fields</strong>: Field mapping object for custom data structures</li>
					<li><strong>class</strong>: Custom CSS classes</li>
				</ul>
			</div>

			<div data-card>
				<h3>Supported Fields</h3>
				<ul class="space-y-3 text-sm">
					<li><strong>text</strong>: Display text</li>
					<li><strong>icon</strong>: Icon name or state-based icon object</li>
					<li><strong>image</strong>: Image URL</li>
					<li><strong>state</strong>: State for conditional icons</li>
				</ul>
			</div>
		</div>

		<div data-content-block>
			<div class="flex items-start space-x-3">
				<div class="text-2xl">💡</div>
				<div>
					<h3>Flexible Data Structures</h3>
					<p>
						The Item component is designed to work with any data structure through field mapping, making it perfect for use in data-driven components like Lists, Menus, and more.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Next Steps -->
	<section data-card-cta>
		<h3>Continue learning</h3>
		<p>
			The Item component is commonly used within data-driven components. Explore how it integrates with other components.
		</p>
		<div class="flex flex-wrap gap-3">
			<a
				href="/tutorial/primitives/pill"
				class="button is-primary"
			>
				Pill Component
				<span class="ml-2">→</span>
			</a>
			<a
				href="/tutorial/elements/list"
				class="button is-primary"
			>
				List Component
				<span class="ml-2">→</span>
			</a>
		</div>
	</section>
</article>