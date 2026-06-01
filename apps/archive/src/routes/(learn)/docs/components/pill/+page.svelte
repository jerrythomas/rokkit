<script>
	// @ts-nocheck
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<!-- Basic Usage Demo -->
	<div class="mb-8">
		<h2>Basic Usage</h2>
		<p>To render a basic Pill component, pass a string as the `value` prop:</p>

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
	<h2>Custom Component</h2>
	<p>
		You can also use a custom component for the content of the Pill. In this example, we will create
		a custom Status component, which takes a status string and shows color and text for the status.
	</p>

	<StoryViewer {...storyBuilder.getExample('mapping')} />

	<div data-card>
		<h3>Custom Component Implementation:</h3>
		<Code {...storyBuilder.getFragment(3)} />
		<p>Set the using property to the Status component and Pill will use this for the content.</p>
	</div>
	<h2>Removable Pills</h2>
	<p>
		To create a removable Pill, set the `removable` prop to `true`. This will add a remove icon to
		the Pill, and when clicked, it will emit a `remove` event that you can handle to perform the
		actual remove action:
	</p>

	<StoryViewer {...storyBuilder.getExample('removable')} />

	<div data-card>
		<h3>Removable Implementation:</h3>
		<Code {...storyBuilder.getFragment(4)} />
		<p>
			The Pill component provides a flexible and customizable way to display removable elements in
			your application. By utilizing the Item component's features, you can create various
			appearances to suit your specific use cases.
		</p>
	</div>
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
					Perfect for tags, selected filters, user selections, or any scenario where you need
					removable visual elements with rich content display capabilities.
				</p>
			</div>
		</div>
	</div>
</article>
