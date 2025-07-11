<script>
	import { StoryRoot } from '$lib/components/Story'
</script>

<div class="w-full space-y-8">
	<!-- Header -->
	<header class="border-neutral-subtle border-b pb-8">
		<div class="flex items-center space-x-3">
			<div class="text-4xl">📋</div>
			<div>
				<h1 class="text-neutral-overlay text-4xl font-bold">List Component</h1>
				<p class="text-neutral-elevated mt-2 text-xl">
					Data-driven list component with field mapping and customization
				</p>
			</div>
		</div>
	</header>

	<!-- Introduction -->
	<section>
		<h2 class="text-neutral-overlay mb-6 text-3xl font-bold">Introduction</h2>
		<p class="text-neutral-floating mb-4 text-lg">
			Lists are useful for displaying information and selection. This is a flexible component with
			pointer and keyboard navigation support.
		</p>

		<div class="text-neutral-elevated mb-6 rounded-lg">
			<h3 class="text-neutral-overlay mb-4 text-xl font-semibold">Notable features:</h3>
			<ul class="marker:text-primary-500 space-y-2 list-disc pl-6">
				<li>Get started with a simple array of objects</li>
				<li>Attributes like text, icon/image or url can be mapped to attributes in the data</li>
				<li>
					Default item components like Item & Link are available, however custom components can also
					be used
				</li>
				<li>
					It is also possible to configure a different component to be used for different items based
					on an attribute in the data
				</li>
				<li>Keyboard navigation support for arrow keys and enter key</li>
				<li>Supports multiple selection</li>
				<li>Provides a default renderer for items, but can be customized using snippets</li>
			</ul>
		</div>

		<!-- Basic Example -->
		<div class="mb-8">
			<h3 class="mb-4 text-2xl font-bold">Basic Example</h3>
			<p class="mb-4">
				Here's a simple example of a List component with an array of objects. Click on any item to
				see how selection works:
			</p>

			<StoryRoot
				slug="elements/list/intro"
				title="Basic List Demo"
				description="A simple list component with text objects and selection"
			/>
		</div>
	</section>

	<!-- Object Array and Properties -->
	<section class="mb-12">
		<h2 class="text-neutral-overlay mb-6 text-3xl font-bold">Object Array</h2>
		<p class="text-neutral-floating mb-4 text-lg">
			Here's another example which uses an array of objects with more complex data.
		</p>
		<p class="mb-6">
			List expects `text` attribute on each item. Optionally an `image` or `icon` attributes can be
			provided for each item. In this example, the value attribute has been included. Click on any
			item in the list to see the data of the selected item.
		</p>

		<StoryRoot
			slug="elements/list/snippets"
			title="Object Array Demo"
			description="List component with complex object data and snippets"
		/>

		<!-- Properties Documentation -->
		<div class="grid grid-cols-1 gap-6 mt-8 md:grid-cols-2">
			<div class="border-neutral-subtle rounded-lg border p-6">
				<h3 class="mb-4 text-lg font-semibold">Properties</h3>
				<ul class="space-y-2 text-sm">
					<li><strong>items</strong>: Supply the data for the list</li>
					<li><strong>value</strong>: Current selected value of the list</li>
					<li><strong>fields</strong>: Adapt to your data by providing a custom field mapping</li>
				</ul>
			</div>

			<div class="border-neutral-subtle rounded-lg border p-6">
				<h3 class="mb-4 text-lg font-semibold">Events</h3>
				<ul class="space-y-2 text-sm">
					<li><strong>select</strong>: Triggered when an item is selected</li>
					<li><strong>move</strong>: Triggered when the current item changes (example navigating)</li>
				</ul>
			</div>
		</div>

		<!-- Snippets Documentation -->
		<div class="border-neutral-subtle rounded-lg border p-6 mt-6">
			<h3 class="mb-4 text-lg font-semibold">Available Snippets</h3>
			<ul class="space-y-2 text-sm">
				<li><strong>header</strong>: Add a custom header, say a search box to the list</li>
				<li><strong>footer</strong>: Add a custom footer, say a toolbar to the list</li>
				<li><strong>empty</strong>: Provide custom empty state message</li>
				<li><strong>stub</strong>: Provide the default template for the list item</li>
			</ul>
		</div>
	</section>

	<!-- Field Mapping -->
	<section class="mb-12">
		<h2 class="text-neutral-overlay mb-6 text-3xl font-bold">Field Mapping</h2>
		<p class="text-neutral-floating mb-4 text-lg">
			The List component is flexible and can adapt to your data structure. Instead of altering your
			attributes to conform to the List's structure, you can use the `fields` property to specify
			which attributes should be used by the List component.
		</p>

		<div class="mb-6 space-y-4">
			<p>A snippet of one of the items is below:</p>
			<div class="rounded-md bg-neutral-900 p-4 dark:bg-neutral-800">
				<code class="text-sm text-green-400">
					<div>{'{'}</div>
					<div class="ml-4">"name": "Fruits",</div>
					<div class="ml-4">"photo": "/examples/fruits.jpg"</div>
					<div>{'}'}</div>
				</code>
			</div>

			<p>
				In this we want to show `name` and the `photo` attributes as the text and image
				respectively. To do this we can configure fields as below:
			</p>

			<div class="rounded-md bg-neutral-900 p-4 dark:bg-neutral-800">
				<code class="text-sm text-green-400">
					<div><span class="text-yellow-300">let</span> fields = {'{'}</div>
					<div class="ml-4">text: <span class="text-green-400">'name'</span>,</div>
					<div class="ml-4">image: <span class="text-green-400">'photo'</span></div>
					<div>{'}'}</div>
				</code>
			</div>
		</div>

		<StoryRoot
			slug="elements/list/mapping"
			title="Field Mapping Demo"
			description="List component demonstrating custom field mapping"
		/>
	</section>

	<!-- Advanced Usage -->
	<section class="mb-12">
		<h2 class="text-neutral-overlay mb-6 text-3xl font-bold">Advanced Usage</h2>
		<p class="text-neutral-floating mb-4 text-lg">
			Sometimes, we may want to use different views for different items. This can be achieved by
			setting both fields and using properties.
		</p>

		<div class="mb-6 space-y-4">
			<p>
				Let's say that we want to show a larger image with some descriptive text for some of the
				items, and for some of them, we want the image to be on the left and for some we want it on
				the right. This simple variation can be done using `css`, but in this case, we are going to
				create two custom components, Odd & Even.
			</p>

			<p>
				We will be using the following configuration to tell the `list` to use the `type` attribute
				to identify the component to be used:
			</p>

			<div class="rounded-md bg-neutral-900 p-4 dark:bg-neutral-800">
				<code class="text-sm text-green-400">
					<div><span class="text-yellow-300">let</span> fields = {'{ component: \'type\' }'}</div>
				</code>
			</div>

			<p>
				Now that we have mapped the `component` attribute, let's create two custom components and
				tell list to use these components:
			</p>

			<div class="rounded-md bg-neutral-900 p-4 dark:bg-neutral-800">
				<code class="text-sm">
					<div class="text-blue-400">&lt;script&gt;</div>
					<div class="ml-4 text-yellow-300">import</div>
					<div class="ml-4">Odd <span class="text-yellow-300">from</span> <span class="text-green-400">'./Odd.svelte'</span></div>
					<div class="ml-4 text-yellow-300">import</div>
					<div class="ml-4">Even <span class="text-yellow-300">from</span> <span class="text-green-400">'./Even.svelte'</span></div>
					<div class="text-blue-400">&lt;/script&gt;</div>
					<div></div>
					<div class="text-blue-400">&lt;List {'{items}'} {'{fields}'}&gt;</div>
					<div class="ml-4">{'{'}<span class="text-purple-400">#snippet</span> <span class="text-yellow-300">odd</span>(node){'}'}</div>
					<div class="ml-8">&lt;<span class="text-blue-400">Odd</span> value={'{node.value}'} /&gt;</div>
					<div class="ml-4">{'{'}<span class="text-purple-400">/snippet</span>{'}'}</div>
					<div class="ml-4">{'{'}<span class="text-purple-400">#snippet</span> <span class="text-yellow-300">even</span>(node){'}'}</div>
					<div class="ml-8">&lt;<span class="text-blue-400">Even</span> value={'{node.value}'} /&gt;</div>
					<div class="ml-4">{'{'}<span class="text-purple-400">/snippet</span>{'}'}</div>
					<div class="text-blue-400">&lt;/List&gt;</div>
				</code>
			</div>

			<p>
				If we want the `Odd` component to be used as default we can change the snippet to use `stub`:
			</p>

			<div class="rounded-md bg-neutral-900 p-4 dark:bg-neutral-800">
				<code class="text-sm">
					<div class="text-blue-400">&lt;List {'{items}'} {'{fields}'}&gt;</div>
					<div class="ml-4">{'{'}<span class="text-purple-400">#snippet</span> <span class="text-yellow-300">stub</span>(node){'}'}</div>
					<div class="ml-8">&lt;<span class="text-blue-400">Odd</span> value={'{node.value}'} /&gt;</div>
					<div class="ml-4">{'{'}<span class="text-purple-400">/snippet</span>{'}'}</div>
					<div class="ml-4">{'{'}<span class="text-purple-400">#snippet</span> <span class="text-yellow-300">even</span>(node){'}'}</div>
					<div class="ml-8">&lt;<span class="text-blue-400">Even</span> value={'{node.value}'} /&gt;</div>
					<div class="ml-4">{'{'}<span class="text-purple-400">/snippet</span>{'}'}</div>
					<div class="text-blue-400">&lt;/List&gt;</div>
				</code>
			</div>
		</div>

		<StoryRoot
			slug="elements/list/mixed"
			title="Advanced Usage Demo"
			description="List component with custom components for different item types"
		/>
	</section>

	<!-- Next Steps -->
	<section class="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-6">
		<h3 class="text-primary-overlay mb-3 text-xl font-semibold">Ready for more?</h3>
		<p class="text-primary-floating mb-4">
			Now that you understand how the List component works, explore other data-driven components
			like Tables and Tabs, or learn about form components.
		</p>
		<div class="flex flex-wrap gap-3">
			<a
				href="/tutorial/elements/table"
				class="bg-primary-overlay hover:bg-primary-hover focus:ring-primary-subtle inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
			>
				Tables
				<span class="ml-2">→</span>
			</a>
			<a
				href="/tutorial/elements/tabs"
				class="bg-primary-overlay hover:bg-primary-hover focus:ring-primary-subtle inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
			>
				Tabs
				<span class="ml-2">→</span>
			</a>
		</div>
	</section>
</div>