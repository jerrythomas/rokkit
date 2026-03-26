<script>
	// @ts-nocheck
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<p>
		A small indicator for counts, statuses, and notifications. Can be used standalone or wrapped
		around another element to position it as an overlay badge.
	</p>

	<h2>Variants</h2>
	<p>
		Five color variants: <code>default</code>, <code>primary</code>, <code>success</code>,
		<code>warning</code>, and <code>error</code>. When a count exceeds <code>max</code> (default 99),
		it shows as <code>99+</code>:
	</p>

	<StoryViewer {...storyBuilder.getExample('intro')} />

	<Code {...storyBuilder.getFragment(0)} />

	<h2>Wrapping Elements</h2>
	<p>
		Pass children to position the badge as an absolute overlay in the top-right corner of the wrapped
		element:
	</p>

	<StoryViewer {...storyBuilder.getExample('wrapper')} />

	<h2>Dot Mode</h2>
	<p>Set <code>dot</code> to show a small indicator circle without any count text:</p>

	<StoryViewer {...storyBuilder.getExample('dot')} />

	<h2>Properties</h2>
	<div data-card>
		<h3>Props</h3>
		<ul>
			<li><strong>count</strong>: Number to display inside the badge</li>
			<li><strong>max</strong>: Maximum before showing "max+" (default: 99)</li>
			<li>
				<strong>variant</strong>: <code>'default'</code> (default) | <code>'primary'</code> | <code>'success'</code>
				| <code>'warning'</code> | <code>'error'</code>
			</li>
			<li><strong>dot</strong>: Boolean — render as a small dot without text</li>
			<li><strong>children</strong>: Snippet — when provided, badge positions over the child</li>
			<li><strong>class</strong>: Additional CSS classes</li>
		</ul>
	</div>
</article>
