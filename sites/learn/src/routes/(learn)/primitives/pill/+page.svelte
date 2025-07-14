<script>
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<h1>Introduction</h1>
	<p>
		The ItemWrapper component wraps the Item component and provides an optional remove
		functionality. This component can be used for displaying tags, selected items from a list, or
		other scenarios where a removable visual element is required. You can get all the features of
		the Item component in the ItemWrapper component. In addition, you can also use a custom
		component for the content.
	</p>

	<!-- Basic Usage Demo -->
	<div class="mb-8">
		<h1>Basic Usage</h1>
		<p>To render a basic ItemWrapper component, pass a string as the `value` prop:</p>

		<StoryViewer {...storyBuilder.getExample('intro')} />
	</div>

	<div data-card>
		<h1>Basic Implementation:</h1>
		<div class="space-y-4">
			<div data-content-block>
				<h1>Simple Content</h1>
				<Code {...storyBuilder.getFragment(0)} />
			</div>
			<div data-content-block>
				<h1>Removable Pill</h1>
				<Code {...storyBuilder.getFragment(1)} />
			</div>
			<div data-content-block>
				<h1>With Icon</h1>
				<Code {...storyBuilder.getFragment(2)} />
			</div>
		</div>
	</div>
	<h1>Custom Component</h1>
	<p>
		You can also use a custom component for the content of the ItemWrapper. In this example, we will
		create a custom Status component, which takes a status string and shows color and text for the
		status.
	</p>

	<StoryViewer {...storyBuilder.getExample('mapping')} />

	<div data-card>
		<h1>Custom Component Implementation:</h1>
		<Code {...storyBuilder.getFragment(3)} />
		<p>
			Set the using property to the Status component and ItemWrapper will use this for the content.
		</p>
	</div>
	<h1>Removable Pills</h1>
	<p>
		To create a removable ItemWrapper, set the `removable` prop to `true`. This will add a remove
		icon to the ItemWrapper, and when clicked, it will emit a `remove` event that you can handle to
		perform the actual remove action:
	</p>

	<StoryViewer {...storyBuilder.getExample('removable')} />

	<div data-card>
		<h1>Removable Implementation:</h1>
		<Code {...storyBuilder.getFragment(4)} />
		<p>
			The ItemWrapper component provides a flexible and customizable way to display removable
			elements in your application. By utilizing the Item component's features, you can create
			various appearances to suit your specific use cases.
		</p>
	</div>
	<h1>Properties</h1>
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h1>Core Properties</h1>
			<ul class="space-y-3 text-sm">
				<li><strong>value</strong>: String or object with content data (required)</li>
				<li><strong>fields</strong>: Field mapping object for custom data structures</li>
				<li><strong>removable</strong>: Boolean to enable remove functionality</li>
				<li><strong>class</strong>: Custom CSS classes</li>
			</ul>
		</div>

		<div data-card>
			<h1>Events</h1>
			<ul class="space-y-3 text-sm">
				<li><strong>remove</strong>: Fired when remove button is clicked</li>
			</ul>
		</div>
	</div>

	<div data-content-block>
		<div class="flex items-start space-x-3">
			<div class="text-2xl">🎯</div>
			<div>
				<h1>Use Cases</h1>
				<p>
					Perfect for tags, selected filters, user selections, or any scenario where you need
					removable visual elements with rich content display capabilities.
				</p>
			</div>
		</div>
	</div>

	<!-- Next Steps -->
	<section data-card-cta>
		<h2>Continue learning</h2>
		<p>Pill components are often used in combination with selection components and forms.</p>
		<div class="flex flex-wrap gap-3">
			<a href="/elements/list" class="button is-primary">
				List Component
				<span class="ml-2">→</span>
			</a>
			<a href="/elements/tags" class="button is-primary">
				Tags Component
				<span class="ml-2">→</span>
			</a>
		</div>
	</section>
</article>
