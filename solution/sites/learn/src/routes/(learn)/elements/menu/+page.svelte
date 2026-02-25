<script>
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<h1>Overview</h1>
	<p>
		The Menu component provides a dropdown list of actions triggered by a button. It supports
		keyboard navigation, grouped items, and custom item rendering.
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

	<section data-card-cta>
		<h2>Continue learning</h2>
		<p>Menu works well with Select for form inputs and Toolbar for action bars.</p>
		<span>
			<a href="/elements/select" class="button is-primary">
				Select
				<span class="ml-2">→</span>
			</a>
			<a href="/elements/toolbar" class="button is-primary">
				Toolbar
				<span class="ml-2">→</span>
			</a>
		</span>
	</section>
</article>
