<script>
	// @ts-nocheck
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<p>
		The Stepper component displays a multi-step progress indicator. Steps can be completed, active,
		or pending. Users can click steps to navigate between them, with optional linear progression
		constraints.
	</p>

	<h2>Basic Example</h2>
	<p>Click a step circle to navigate, or use the button to advance through the wizard:</p>

	<StoryViewer {...storyBuilder.getExample('intro')} />

	<Code {...storyBuilder.getFragment(0)} />

	<h2>Properties</h2>
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h3>Core Properties</h3>
			<ul>
				<li><strong>steps</strong>: Array of step objects</li>
				<li><strong>current</strong>: Active step index (bindable)</li>
				<li><strong>currentStage</strong>: Sub-stage within step (bindable)</li>
				<li><strong>onclick</strong>: Callback on step click</li>
			</ul>
		</div>

		<div data-card>
			<h3>Configuration</h3>
			<ul>
				<li><strong>linear</strong>: Only allow forward progression</li>
				<li><strong>orientation</strong>: horizontal or vertical</li>
				<li><strong>icons</strong>: Custom icon for completed state</li>
				<li><strong>content</strong>: Snippet for step content area</li>
			</ul>
		</div>
	</div>

	<h2>Step Object</h2>
	<div data-card>
		<ul>
			<li><strong>text</strong>: Label shown below the circle</li>
			<li><strong>label</strong>: Custom text inside circle (default: step number)</li>
			<li><strong>completed</strong>: Whether the step is finished</li>
			<li><strong>disabled</strong>: Prevents clicking</li>
			<li><strong>stages</strong>: Number of sub-stages (shows dots)</li>
		</ul>
	</div>
</article>
