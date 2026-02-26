<script>
	// @ts-nocheck
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<h1>Overview</h1>
	<p>
		The Code component renders syntax-highlighted code blocks with an integrated copy-to-clipboard
		button. It supports multiple languages and themes.
	</p>

	<h2>Basic Example</h2>
	<p>A JavaScript code block with syntax highlighting:</p>

	<StoryViewer {...storyBuilder.getExample('intro')} />

	<Code {...storyBuilder.getFragment(0)} />

	<h2>Properties</h2>
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h3>Core Properties</h3>
			<ul>
				<li><strong>code</strong>: The code string to display</li>
				<li><strong>language</strong>: Programming language (default: text)</li>
				<li><strong>theme</strong>: Color theme — light or dark</li>
			</ul>
		</div>

		<div data-card>
			<h3>Display Options</h3>
			<ul>
				<li><strong>showLineNumbers</strong>: Show line numbers</li>
				<li><strong>showCopyButton</strong>: Show copy button (default: true)</li>
				<li><strong>icons</strong>: Custom icons for copy states</li>
				<li><strong>class</strong>: Additional CSS classes</li>
			</ul>
		</div>
	</div>

	<section data-card-cta>
		<h2>Continue learning</h2>
		<p>Code is used throughout the learn site. Explore other primitive components below.</p>
		<span>
			<a href="/primitives/button" class="button is-primary">
				Button
				<span class="ml-2">→</span>
			</a>
			<a href="/primitives/card" class="button is-primary">
				Card
				<span class="ml-2">→</span>
			</a>
		</span>
	</section>
</article>
