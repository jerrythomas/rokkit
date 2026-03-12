<script>
	// @ts-nocheck
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<p>
		The Carousel component displays content in a sliding panel with navigation controls. It supports
		keyboard navigation, swipe gestures, autoplay, and multiple transition effects.
	</p>

	<h2>Basic Example</h2>
	<p>A carousel with custom slide content, dots, and arrow navigation:</p>

	<StoryViewer {...storyBuilder.getExample('intro')} />

	<Code {...storyBuilder.getFragment(0)} />

	<h2>Transitions</h2>
	<p>
		Choose between <code>slide</code>, <code>fade</code>, and <code>none</code> transition effects:
	</p>

	<StoryViewer {...storyBuilder.getExample('transitions')} />

	<h2>Properties</h2>
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h3>Core Properties</h3>
			<ul>
				<li><strong>count</strong>: Number of slides</li>
				<li><strong>current</strong>: Active slide index (bindable)</li>
				<li><strong>slide</strong>: Snippet receiving the slide index</li>
				<li><strong>loop</strong>: Wrap around at boundaries (default: true)</li>
			</ul>
		</div>

		<div data-card>
			<h3>Display Options</h3>
			<ul>
				<li><strong>transition</strong>: slide, fade, or none</li>
				<li><strong>showDots</strong>: Show dot indicators (default: true)</li>
				<li><strong>showArrows</strong>: Show navigation arrows (default: true)</li>
				<li><strong>autoplay</strong>: Auto-advance slides</li>
				<li><strong>interval</strong>: Autoplay interval in ms (default: 5000)</li>
			</ul>
		</div>
	</div>

	<h2>Keyboard &amp; Gestures</h2>
	<ul>
		<li><strong>ArrowLeft / ArrowRight</strong>: Navigate between slides</li>
		<li><strong>Home / End</strong>: Jump to first / last slide</li>
		<li><strong>Swipe left / right</strong>: Touch navigation on mobile</li>
	</ul>
</article>
