<script>
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<svelte:head>
	<title>Pill - Primitives | Learn Rokkit</title>
	<meta
		name="description"
		content="Removable item wrappers and tags with customizable content"
	/>
</svelte:head>

<article data-article-root>
	<!-- Header -->
	<header>
		<div class="flex items-center space-x-3">
			<div>
				<h1><span>💊</span>Pill Component</h1>
				<p>
					Removable item wrappers and tags with customizable content
				</p>
			</div>
		</div>
	</header>

	<!-- Introduction -->
	<section>
		<h2>Introduction</h2>
		<p>
			The ItemWrapper component wraps the Item component and provides an optional remove functionality. This component can be used for displaying tags, selected items from a list, or other scenarios where a removable visual element is required. You can get all the features of the Item component in the ItemWrapper component. In addition, you can also use a custom component for the content.
		</p>

		<!-- Basic Usage Demo -->
		<div class="mb-8">
			<h3>Basic Usage</h3>
			<p>
				To render a basic ItemWrapper component, pass a string as the `value` prop:
			</p>

			<StoryViewer {...storyBuilder.getExample('intro')} />
		</div>

		<div data-card>
			<h3>Basic Implementation:</h3>
			<div class="space-y-4">
				<div data-content-block>
					<h4>Simple Content</h4>
					<Code {...storyBuilder.getFragment(0)} />
				</div>
				<div data-content-block>
					<h4>Removable Pill</h4>
					<Code {...storyBuilder.getFragment(1)} />
				</div>
				<div data-content-block>
					<h4>With Icon</h4>
					<Code {...storyBuilder.getFragment(2)} />
				</div>
			</div>
		</div>
	</section>

	<!-- Custom Component -->
	<section class="mb-12">
		<h2>Custom Component</h2>
		<p>
			You can also use a custom component for the content of the ItemWrapper. In this example, we will create a custom Status component, which takes a status string and shows color and text for the status.
		</p>

		<StoryViewer {...storyBuilder.getExample('mapping')} />

		<div data-card>
			<h3>Custom Component Implementation:</h3>
			<Code {...storyBuilder.getFragment(3)} />
			<p>
				Set the using property to the Status component and ItemWrapper will use this for the content.
			</p>
		</div>
	</section>

	<!-- Removable -->
	<section class="mb-12">
		<h2>Removable Pills</h2>
		<p>
			To create a removable ItemWrapper, set the `removable` prop to `true`. This will add a remove icon to the ItemWrapper, and when clicked, it will emit a `remove` event that you can handle to perform the actual remove action:
		</p>

		<StoryViewer {...storyBuilder.getExample('removable')} />

		<div data-card>
			<h3>Removable Implementation:</h3>
			<Code {...storyBuilder.getFragment(4)} />
			<p>
				The ItemWrapper component provides a flexible and customizable way to display removable elements in your application. By utilizing the Item component's features, you can create various appearances to suit your specific use cases.
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
					<li><strong>removable</strong>: Boolean to enable remove functionality</li>
					<li><strong>class</strong>: Custom CSS classes</li>
				</ul>
			</div>

			<div data-card>
				<h3>Events</h3>
				<ul class="space-y-3 text-sm">
					<li><strong>remove</strong>: Fired when remove button is clicked</li>
				</ul>
			</div>
		</div>

		<div data-content-block>
			<div class="flex items-start space-x-3">
				<div class="text-2xl">🎯</div>
				<div>
					<h3>Use Cases</h3>
					<p>
						Perfect for tags, selected filters, user selections, or any scenario where you need removable visual elements with rich content display capabilities.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Next Steps -->
	<section data-card-cta>
		<h3>Continue learning</h3>
		<p>
			Pill components are often used in combination with selection components and forms.
		</p>
		<div class="flex flex-wrap gap-3">
			<a
				href="/tutorial/elements/list"
				class="button is-primary"
			>
				List Component
				<span class="ml-2">→</span>
			</a>
			<a
				href="/tutorial/elements/tags"
				class="button is-primary"
			>
				Tags Component
				<span class="ml-2">→</span>
			</a>
		</div>
	</section>
</article>