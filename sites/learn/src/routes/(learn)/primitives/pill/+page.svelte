<script>
	import { StoryViewer } from '$lib/components/Story'
	import { stories } from './stories.js'
</script>

<svelte:head>
	<title>Pill - Primitives | Learn Rokkit</title>
	<meta
		name="description"
		content="Removable item wrappers and tags with customizable content"
	/>
</svelte:head>

<div class="w-full space-y-8">
	<!-- Header -->
	<header class="border-neutral-subtle border-b pb-8">
		<div class="flex items-center space-x-3">
			<div class="text-4xl">💊</div>
			<div>
				<h1 class="text-neutral-overlay text-4xl font-bold">Pill Component</h1>
				<p class="text-neutral-elevated mt-2 text-xl">
					Removable item wrappers and tags with customizable content
				</p>
			</div>
		</div>
	</header>

	<!-- Introduction -->
	<section>
		<h2 class="text-neutral-overlay mb-6 text-3xl font-bold">Introduction</h2>
		<p class="text-neutral-floating mb-4 text-lg">
			The ItemWrapper component wraps the Item component and provides an optional remove functionality. This component can be used for displaying tags, selected items from a list, or other scenarios where a removable visual element is required. You can get all the features of the Item component in the ItemWrapper component. In addition, you can also use a custom component for the content.
		</p>

		<!-- Basic Usage Demo -->
		<div class="mb-8">
			<h3 class="mb-4 text-2xl font-bold">Basic Usage</h3>
			<p class="mb-4">
				To render a basic ItemWrapper component, pass a string as the `value` prop:
			</p>

			{#await stories}
				<p>Loading...</p>
			{:then groupedStories}
				<StoryViewer {...groupedStories.intro} />
			{/await}
		</div>

		<div class="bg-neutral-subtle rounded-lg p-6 mb-6">
			<h3 class="text-neutral-overlay mb-4 text-xl font-semibold">Basic Implementation:</h3>
			<div class="space-y-4">
				<div class="bg-neutral-elevated rounded-md p-4">
					<h4 class="mb-2 font-semibold">Simple Content</h4>
					<code class="text-sm">
						<div class="text-blue-400">&lt;ItemWrapper value="Sample Content" /&gt;</div>
					</code>
				</div>
				<div class="bg-neutral-elevated rounded-md p-4">
					<h4 class="mb-2 font-semibold">Removable Pill</h4>
					<code class="text-sm">
						<div class="text-blue-400">&lt;ItemWrapper value="Removable" removable={'{true}'} on:remove={'{handleRemove}'} /&gt;</div>
					</code>
				</div>
				<div class="bg-neutral-elevated rounded-md p-4">
					<h4 class="mb-2 font-semibold">With Icon</h4>
					<code class="text-sm">
						<div class="text-blue-400">&lt;ItemWrapper</div>
						<div class="text-blue-400 ml-4">value={'{'}{'{'} text: 'With icon', icon: 'i-rokkit:heart-filled' {'}'}{'}'}  </div>
						<div class="text-blue-400 ml-4">removable={'{true}'}</div>
						<div class="text-blue-400">/&gt;</div>
					</code>
				</div>
			</div>
		</div>
	</section>

	<!-- Custom Component -->
	<section class="mb-12">
		<h2 class="text-neutral-overlay mb-6 text-3xl font-bold">Custom Component</h2>
		<p class="text-neutral-floating mb-4 text-lg">
			You can also use a custom component for the content of the ItemWrapper. In this example, we will create a custom Status component, which takes a status string and shows color and text for the status.
		</p>

		{#await stories}
			<p>Loading...</p>
		{:then groupedStories}
			<StoryViewer {...groupedStories.mapping} />
		{/await}

		<div class="bg-neutral-subtle rounded-lg p-6 mt-6">
			<h3 class="text-neutral-overlay mb-4 text-xl font-semibold">Custom Component Implementation:</h3>
			<div class="bg-neutral-elevated rounded-md p-4">
				<code class="text-sm">
					<div class="text-blue-400">&lt;script&gt;</div>
					<div class="ml-4">import {'{'} Pill {'}'} from '@rokkit/ui'</div>
					<div class="ml-4">import {'{'} FieldMapper {'}'} from '@rokkit/core'</div>
					<div class="ml-4">import Status from './Status.svelte'</div>
					<div></div>
					<div class="ml-4">let mapping = new FieldMapper({'{'}{'}'}, {'{'} default: Status {'}'})</div>
					<div class="text-blue-400">&lt;/script&gt;</div>
					<div></div>
					<div class="text-blue-400">&lt;Pill value="success" {'{mapping}'} /&gt;</div>
				</code>
			</div>
			<p class="text-neutral-floating mt-2 text-sm">
				Set the using property to the Status component and ItemWrapper will use this for the content.
			</p>
		</div>
	</section>

	<!-- Removable -->
	<section class="mb-12">
		<h2 class="text-neutral-overlay mb-6 text-3xl font-bold">Removable Pills</h2>
		<p class="text-neutral-floating mb-4 text-lg">
			To create a removable ItemWrapper, set the `removable` prop to `true`. This will add a remove icon to the ItemWrapper, and when clicked, it will emit a `remove` event that you can handle to perform the actual remove action:
		</p>

		{#await stories}
			<p>Loading...</p>
		{:then groupedStories}
			<StoryViewer {...groupedStories.removable} />
		{/await}

		<div class="bg-neutral-subtle rounded-lg p-6 mt-6">
			<h3 class="text-neutral-overlay mb-4 text-xl font-semibold">Removable Implementation:</h3>
			<div class="bg-neutral-elevated rounded-md p-4">
				<code class="text-sm">
					<div class="text-blue-400">&lt;script&gt;</div>
					<div class="ml-4">let items = [</div>
					<div class="ml-8">{'{'} text: 'Sample Removable 1' {'}'},</div>
					<div class="ml-8">{'{'} text: 'Sample Removable 2' {'}'},</div>
					<div class="ml-8">{'{'} text: 'Sample Removable 3' {'}'}</div>
					<div class="ml-4">]</div>
					<div></div>
					<div class="ml-4">function handleRemove(index) {'{'}</div>
					<div class="ml-8">items.splice(index, 1)</div>
					<div class="ml-8">items = [...items]</div>
					<div class="ml-4">{'}'}</div>
					<div class="text-blue-400">&lt;/script&gt;</div>
					<div></div>
					<div class="text-blue-400">{'{#each items as item, index}'}</div>
					<div class="ml-4 text-blue-400">&lt;ItemWrapper</div>
					<div class="ml-8 text-blue-400">value={'{item.text}'}</div>
					<div class="ml-8 text-blue-400">removable={'{true}'}</div>
					<div class="ml-8 text-blue-400">on:remove={'{() => handleRemove(index)}'}</div>
					<div class="ml-4 text-blue-400">/&gt;</div>
					<div class="text-blue-400">{'{/each}'}</div>
				</code>
			</div>
			<p class="text-neutral-floating mt-2 text-sm">
				The ItemWrapper component provides a flexible and customizable way to display removable elements in your application. By utilizing the Item component's features, you can create various appearances to suit your specific use cases.
			</p>
		</div>
	</section>

	<!-- Properties -->
	<section class="mb-12">
		<h2 class="text-neutral-overlay mb-6 text-3xl font-bold">Properties</h2>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div class="border-neutral-subtle rounded-lg border p-6">
				<h3 class="mb-4 text-lg font-semibold">Core Properties</h3>
				<ul class="space-y-3 text-sm">
					<li><strong>value</strong>: String or object with content data (required)</li>
					<li><strong>fields</strong>: Field mapping object for custom data structures</li>
					<li><strong>removable</strong>: Boolean to enable remove functionality</li>
					<li><strong>class</strong>: Custom CSS classes</li>
				</ul>
			</div>

			<div class="border-neutral-subtle rounded-lg border p-6">
				<h3 class="mb-4 text-lg font-semibold">Events</h3>
				<ul class="space-y-3 text-sm">
					<li><strong>remove</strong>: Fired when remove button is clicked</li>
				</ul>
			</div>
		</div>

		<div class="border-green-subtle bg-green-inset rounded-lg border p-6 mt-6">
			<div class="flex items-start space-x-3">
				<div class="text-2xl">🎯</div>
				<div>
					<h3 class="text-green-overlay mb-2 text-lg font-semibold">Use Cases</h3>
					<p class="text-green-floating">
						Perfect for tags, selected filters, user selections, or any scenario where you need removable visual elements with rich content display capabilities.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Next Steps -->
	<section class="bg-primary-inset rounded-lg p-6">
		<h3 class="text-primary-overlay mb-3 text-xl font-semibold">Continue learning</h3>
		<p class="text-primary-floating mb-4">
			Pill components are often used in combination with selection components and forms.
		</p>
		<div class="flex flex-wrap gap-3">
			<a
				href="/tutorial/elements/list"
				class="bg-primary-overlay hover:bg-primary-hover focus:ring-primary-subtle inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
			>
				List Component
				<span class="ml-2">→</span>
			</a>
			<a
				href="/tutorial/elements/tags"
				class="bg-primary-overlay hover:bg-primary-hover focus:ring-primary-subtle inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
			>
				Tags Component
				<span class="ml-2">→</span>
			</a>
		</div>
	</section>
</div>