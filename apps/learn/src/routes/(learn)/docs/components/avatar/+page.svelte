<script>
	// @ts-nocheck
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<p>
		A circular or square user image with automatic initials fallback. When no image is provided (or
		the image fails to load), the component renders initials derived from the <code>name</code> prop.
		An optional status dot shows presence state.
	</p>

	<h2>Basic Usage</h2>
	<p>
		Pass a <code>name</code> prop to auto-derive initials, or supply explicit <code>initials</code>:
	</p>

	<StoryViewer {...storyBuilder.getExample('intro')} />

	<Code {...storyBuilder.getFragment(0)} />

	<h2>Size Variants</h2>
	<p>Five sizes from <code>xs</code> to <code>xl</code>:</p>

	<StoryViewer {...storyBuilder.getExample('sizes')} />

	<h2>Status Indicator</h2>
	<p>
		Add a <code>status</code> prop to show a presence dot: <code>online</code>, <code>away</code>,
		<code>busy</code>, or <code>offline</code>:
	</p>

	<StoryViewer {...storyBuilder.getExample('status')} />

	<h2>Properties</h2>
	<div data-card>
		<h3>Props</h3>
		<ul>
			<li><strong>src</strong>: Image URL — displays an img element when set</li>
			<li><strong>alt</strong>: Alt text for the image (defaults to name)</li>
			<li><strong>name</strong>: Full name — used to auto-derive initials</li>
			<li><strong>initials</strong>: Explicit initials string (overrides name-derived initials)</li>
			<li>
				<strong>size</strong>: <code>'xs'</code> | <code>'sm'</code> | <code>'md'</code>
				(default) | <code>'lg'</code> | <code>'xl'</code>
			</li>
			<li>
				<strong>status</strong>: <code>'online'</code> | <code>'offline'</code> | <code>'away'</code>
				| <code>'busy'</code> — adds a colored status dot
			</li>
			<li>
				<strong>shape</strong>: <code>'circle'</code> (default) | <code>'square'</code>
			</li>
			<li><strong>class</strong>: Additional CSS classes</li>
		</ul>
	</div>
</article>
