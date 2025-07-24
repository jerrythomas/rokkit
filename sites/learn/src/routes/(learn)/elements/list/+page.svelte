<script>
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<h1>Introduction</h1>
	<p>
		Lists are useful for displaying information and selection. This is a flexible component with
		pointer and keyboard navigation support.
	</p>

	<h2>Notable features:</h2>
	<ul>
		<li>Get started with a simple array of objects</li>
		<li>Attributes like text, icon/image or url can be mapped to attributes in the data</li>
		<li>
			Default item components like Item & Link are available, however custom components can also be
			used
		</li>
		<li>
			It is also possible to configure a different component to be used for different items based on
			an attribute in the data
		</li>
		<li>Keyboard navigation support for arrow keys and enter key</li>
		<li>Supports multiple selection</li>
		<li>Provides a default renderer for items, but can be customized using snippets</li>
	</ul>

	<h2>Basic Example</h2>
	<p>
		Here's a simple example of a List component with an array of objects. Click on any item to see
		how selection works:
	</p>

	<StoryViewer {...storyBuilder.getExample('intro')} />

	<h2>Object Array</h2>
	<p>Here's another example which uses an array of objects with more complex data.</p>
	<p>
		List expects `text` attribute on each item. Optionally an `image` or `icon` attributes can be
		provided for each item. In this example, the value attribute has been included. Click on any
		item in the list to see the data of the selected item.
	</p>

	<StoryViewer {...storyBuilder.getExample('snippets')} />

	<!-- Properties Documentation -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h2>Properties</h2>
			<ul>
				<li><strong>items</strong>: Supply the data for the list</li>
				<li><strong>value</strong>: Current selected value of the list</li>
				<li><strong>fields</strong>: Adapt to your data by providing a custom field mapping</li>
			</ul>
		</div>

		<div data-card>
			<h2>Events</h2>
			<ul>
				<li><strong>select</strong>: Triggered when an item is selected</li>
				<li>
					<strong>move</strong>: Triggered when the current item changes (example navigating)
				</li>
			</ul>
		</div>
	</div>

	<!-- Snippets Documentation -->
	<div data-card>
		<h3>Available Snippets</h3>
		<ul>
			<li><strong>header</strong>: Add a custom header, say a search box to the list</li>
			<li><strong>footer</strong>: Add a custom footer, say a toolbar to the list</li>
			<li><strong>empty</strong>: Provide custom empty state message</li>
			<li><strong>stub</strong>: Provide the default template for the list item</li>
		</ul>
	</div>

	<h2>Field Mapping</h2>
	<p>
		The List component is flexible and can adapt to your data structure. Instead of altering your
		attributes to conform to the List's structure, you can use the `fields` property to specify
		which attributes should be used by the List component.
	</p>

	<p>A snippet of one of the items is below:</p>
	<Code {...storyBuilder.getFragment(0)} />

	<p>
		In this we want to show `name` and the `photo` attributes as the text and image respectively. To
		do this we can configure fields as below:
	</p>

	<Code {...storyBuilder.getFragment(1)} />

	<StoryViewer {...storyBuilder.getExample('mapping')} />

	<h2>Advanced Usage</h2>
	<p>
		Sometimes, we may want to use different views for different items. This can be achieved by
		setting both fields and using properties.
	</p>

	<p>
		Let's say that we want to show a larger image with some descriptive text for some of the items,
		and for some of them, we want the image to be on the left and for some we want it on the right.
		This simple variation can be done using `css`, but in this case, we are going to create two
		custom components, Odd & Even.
	</p>

	<p>
		We will be using the following configuration to tell the `list` to use the `type` attribute to
		identify the component to be used:
	</p>

	<Code {...storyBuilder.getFragment(2)} />

	<p>
		Now that we have mapped the `component` attribute, let's create two custom components and tell
		list to use these components:
	</p>

	<Code {...storyBuilder.getFragment(3)} />

	<p>
		If we want the `Odd` component to be used as default we can change the snippet to use `stub`:
	</p>

	<Code {...storyBuilder.getFragment(4)} />

	<StoryViewer {...storyBuilder.getExample('mixed')} />

	<!-- Next Steps -->
	<section data-card-cta>
		<h2>Ready for more?</h2>
		<p>
			Now that you understand how the List component works, explore other data-driven components
			like Tables and Tabs, or learn about form components.
		</p>
		<span>
			<a href="/elements/table" class="button is-primary">
				Tables
				<span class="ml-2">→</span>
			</a>
			<a href="/elements/tabs" class="button is-primary">
				Tabs
				<span class="ml-2">→</span>
			</a>
		</span>
	</section>
</article>
