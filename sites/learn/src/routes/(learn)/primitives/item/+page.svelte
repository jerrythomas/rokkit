<script>
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<h1>Introduction</h1>
	<p>
		We will learn about the versatile `Item` component that can render various content types,
		including text, icon, state-based icon, or an image along with text. This component accepts a
		string or an object as a value and an optional `mapping` prop for field mapping.
	</p>

	<!-- Basic Usage Demo -->
	<div class="mb-8">
		<h1>Basic Usage</h1>
		<p>To render different types of content, pass various data structures to the `value` prop:</p>

		<StoryViewer {...storyBuilder.getExample('intro')} />
	</div>

	<div data-card>
		<h1>Rendering Different Content Types:</h1>
		<div class="space-y-4">
			<div data-content-block>
				<h1>Simple Text</h1>
				<Code {...storyBuilder.getFragment(0)} />
			</div>
			<div data-content-block>
				<h1>Icon and Text</h1>
				<Code {...storyBuilder.getFragment(1)} />
			</div>
			<div data-content-block>
				<h1>Image and Text</h1>
				<Code {...storyBuilder.getFragment(2)} />
			</div>
		</div>
		<p>
			Note that the component only renders the icon, image & text, but does not put a wrapper
			element around it. In the preview, we have used an item tag to wrap the `Item` component.
		</p>
	</div>
	<h1>State-based Icons</h1>
	<p>
		To render text with a state-based icon, pass an object that includes the text, icon, and state
		fields:
	</p>

	<StoryViewer {...storyBuilder.getExample('state')} />

	<div data-card>
		<h1>State-based Icon Implementation:</h1>
		<Code {...storyBuilder.getFragment(3)} />
		<p>
			The icon will automatically switch based on the state value, choosing between the 'open' and
			'close' icons.
		</p>
	</div>
	<h1>Field Mapping</h1>
	<p>
		The Item component allows you to provide field mappings using the `fields` prop. These mappings
		enable you to customize the attributes it uses to the content from the provided value.
	</p>

	<StoryViewer {...storyBuilder.getExample('mapping')} />

	<div data-card>
		<h1>Field Mapping Example:</h1>
		<Code {...storyBuilder.getFragment(4)} />
		<p>
			The flexibility of field mapping and the ability to render various combinations of text,
			icons, and images make this component the default item renderer for many of the data-driven
			components.
		</p>
	</div>
	<h1>Properties</h1>
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h1>Core Properties</h1>
			<ul class="space-y-3 text-sm">
				<li><strong>value</strong>: String or object with content data (required)</li>
				<li><strong>fields</strong>: Field mapping object for custom data structures</li>
				<li><strong>class</strong>: Custom CSS classes</li>
			</ul>
		</div>

		<div data-card>
			<h1>Supported Fields</h1>
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
				<h1>Flexible Data Structures</h1>
				<p>
					The Item component is designed to work with any data structure through field mapping,
					making it perfect for use in data-driven components like Lists, Menus, and more.
				</p>
			</div>
		</div>
	</div>

	<!-- Next Steps -->
	<section data-card-cta>
		<h2>Continue learning</h2>
		<p>
			The Item component is commonly used within data-driven components. Explore how it integrates
			with other components.
		</p>
		<div class="flex flex-wrap gap-3">
			<a href="/primitives/pill" class="button is-primary">
				Pill Component
				<span class="ml-2">→</span>
			</a>
			<a href="/elements/list" class="button is-primary">
				List Component
				<span class="ml-2">→</span>
			</a>
		</div>
	</section>
</article>
