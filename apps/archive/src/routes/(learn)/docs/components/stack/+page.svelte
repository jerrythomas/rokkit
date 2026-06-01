<script>
	// @ts-nocheck
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<p>
		A flex layout wrapper that arranges children in a vertical or horizontal stack with consistent
		spacing. Use it instead of writing ad-hoc flex utilities every time you need a simple layout.
	</p>

	<h2>Vertical Stack</h2>
	<p>The default direction stacks children top-to-bottom with a configurable gap:</p>

	<StoryViewer {...storyBuilder.getExample('intro')} />

	<Code {...storyBuilder.getFragment(0)} />

	<h2>Horizontal Stack</h2>
	<p>Set <code>direction="horizontal"</code> to arrange children side by side:</p>

	<StoryViewer {...storyBuilder.getExample('horizontal')} />

	<h2>Properties</h2>
	<div data-card>
		<h3>Props</h3>
		<ul>
			<li>
				<strong>direction</strong>: <code>'vertical'</code> (default) | <code>'horizontal'</code> — flex direction
			</li>
			<li>
				<strong>gap</strong>: <code>'none'</code> | <code>'xs'</code> | <code>'sm'</code> | <code>'md'</code>
				(default) | <code>'lg'</code> | <code>'xl'</code> — spacing between children
			</li>
			<li>
				<strong>align</strong>: <code>'start'</code> | <code>'center'</code> | <code>'end'</code> | <code>'stretch'</code>
				— cross-axis alignment
			</li>
			<li>
				<strong>justify</strong>: <code>'start'</code> | <code>'center'</code> | <code>'end'</code> | <code>'between'</code>
				| <code>'around'</code> — main-axis justification
			</li>
			<li><strong>children</strong>: Snippet — content to stack (required)</li>
			<li><strong>class</strong>: Additional CSS classes</li>
		</ul>
	</div>
</article>
