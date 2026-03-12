<script>
	// @ts-nocheck
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<p>
		A drop zone for file uploads. Accepts drag-and-drop or click-to-browse, and validates files
		against <code>accept</code> (MIME type / extension) and <code>maxSize</code> constraints before passing
		them through.
	</p>

	<h2>Basic Example</h2>
	<p>
		Drop a file onto the zone or click to open the file browser. Accepted files arrive via the
		<code>onfiles</code> callback.
	</p>

	<Code {...storyBuilder.getFragment(0)} />

	<StoryViewer {...storyBuilder.getExample('intro')} />

	<h2>Accept Filtering</h2>
	<p>
		The <code>accept</code> prop takes a comma-separated string of MIME types and file extensions
		(e.g. <code>image/*,.pdf</code>). Files that don't match are rejected and reported via
		<code>onerror</code>.
	</p>

	<Code {...storyBuilder.getFragment(1)} />

	<StoryViewer {...storyBuilder.getExample('accept')} />

	<h2>Max File Size</h2>
	<p>
		Set <code>maxSize</code> in bytes to reject files that exceed the limit. Oversized files trigger
		<code>onerror</code> with <code>reason: 'size'</code>.
	</p>

	<StoryViewer {...storyBuilder.getExample('maxsize')} />

	<h2>Custom Content</h2>
	<p>
		Override the default drop zone UI with a <code>content</code> snippet. The snippet receives a
		<code>dragging</code> boolean so you can style the active drag state.
	</p>

	<Code {...storyBuilder.getFragment(2)} />

	<StoryViewer {...storyBuilder.getExample('custom')} />

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h2>Props</h2>
			<ul>
				<li><strong>accept</strong> — MIME types / extensions (comma-separated)</li>
				<li><strong>maxSize</strong> — max file size in bytes</li>
				<li><strong>multiple</strong> — allow selecting multiple files</li>
				<li><strong>disabled</strong> — disable the drop zone</li>
				<li><strong>labels</strong> — label overrides</li>
				<li><strong>class</strong> — additional CSS classes</li>
			</ul>
		</div>
		<div data-card>
			<h2>Events &amp; Snippets</h2>
			<ul>
				<li><strong>onfiles</strong> — called with validated <code>File[]</code></li>
				<li>
					<strong>onerror</strong> — called per rejected file with <code>{`{file, reason}`}</code>
				</li>
				<li><strong>content</strong> — snippet <code>(dragging: boolean)</code> for custom UI</li>
			</ul>
		</div>
	</div>
</article>
