<script>
	import { StoryViewer } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<p>
		Use the tabs below to interactively change the skin applied to all components. This demo shows
		how <code>skin-default</code>, <code>skin-vibrant</code>, and <code>skin-seaweed</code> affect colors
		and styles.
	</p>
	<StoryViewer {...storyBuilder.getExample('example')} />
</article>
