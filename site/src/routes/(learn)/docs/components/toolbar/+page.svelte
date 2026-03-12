<script>
	// @ts-nocheck
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<p>
		The Toolbar component provides a grouped action bar with buttons, separators, and spacers. It
		follows the WAI-ARIA toolbar pattern with arrow-key navigation.
	</p>

	<h2>Basic Example</h2>
	<p>A text formatting toolbar with separators between groups:</p>

	<StoryViewer {...storyBuilder.getExample('intro')} />

	<Code {...storyBuilder.getFragment(0)} />

	<h2>Separators & Spacers</h2>
	<p>
		Use <code>itemType: 'separator'</code> for visual dividers and <code>itemType: 'spacer'</code> to
		push items to the right. Both are automatically skipped during keyboard navigation.
	</p>

	<StoryViewer {...storyBuilder.getExample('separators')} />

	<h2>Properties</h2>
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h3>Core Properties</h3>
			<ul>
				<li><strong>items</strong>: Array of toolbar items</li>
				<li><strong>fields</strong>: Field mapping for custom data</li>
				<li><strong>onclick</strong>: Callback when item is clicked</li>
				<li><strong>position</strong>: Toolbar position (top, bottom, left, right)</li>
			</ul>
		</div>

		<div data-card>
			<h3>Display Options</h3>
			<ul>
				<li><strong>compact</strong>: Reduce padding</li>
				<li><strong>sticky</strong>: Stick to viewport edge</li>
				<li><strong>showDividers</strong>: Show group dividers</li>
				<li><strong>disabled</strong>: Disable all items</li>
			</ul>
		</div>
	</div>
</article>
