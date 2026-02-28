<script>
	// @ts-nocheck
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<p>
		A contextual action menu that opens on click. Supports icons, grouped items,
		keyboard navigation, and custom alignment.
	</p>

	<h2>Basic Example</h2>
	<p>A simple action menu with icons:</p>

	<StoryViewer {...storyBuilder.getExample('intro')} />

	<Code {...storyBuilder.getFragment(0)} />

	<h2>Grouped Items</h2>
	<p>
		Organize menu items into visual groups using <code>children</code>. Groups have headers but
		keyboard navigation moves through all leaf items.
	</p>

	<StoryViewer {...storyBuilder.getExample('groups')} />

	<h2>Properties</h2>
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h3>Core Properties</h3>
			<ul>
				<li><strong>options</strong>: Array of menu items</li>
				<li><strong>label</strong>: Button label</li>
				<li><strong>icon</strong>: Button icon</li>
				<li><strong>onselect</strong>: Callback on item selection</li>
			</ul>
		</div>

		<div data-card>
			<h3>Display Options</h3>
			<ul>
				<li><strong>align</strong>: Dropdown alignment (left, right)</li>
				<li><strong>direction</strong>: Open direction (down, up)</li>
				<li><strong>showArrow</strong>: Show dropdown arrow</li>
				<li><strong>disabled</strong>: Disable the menu</li>
			</ul>
		</div>
	</div>

</article>
