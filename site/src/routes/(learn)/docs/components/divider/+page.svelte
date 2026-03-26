<script>
	// @ts-nocheck
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<p>
		A separator that visually divides content. Supports horizontal and vertical orientations, with an
		optional centered label.
	</p>

	<h2>Basic Usage</h2>
	<p>Use a plain horizontal divider to separate sections of content:</p>

	<StoryViewer {...storyBuilder.getExample('intro')} />

	<Code {...storyBuilder.getFragment(0)} />

	<h2>Vertical Divider</h2>
	<p>Set <code>orientation="vertical"</code> to place a vertical separator between inline elements:</p>

	<StoryViewer {...storyBuilder.getExample('vertical')} />

	<h2>Properties</h2>
	<div data-card>
		<h3>Props</h3>
		<ul>
			<li><strong>orientation</strong>: <code>'horizontal'</code> (default) | <code>'vertical'</code> — separator axis</li>
			<li><strong>label</strong>: Optional string shown in the center of the divider</li>
			<li><strong>class</strong>: Additional CSS classes</li>
		</ul>
	</div>
</article>
