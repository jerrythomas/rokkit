<script>
	// @ts-nocheck
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<p>
		A file upload status orchestrator that composes a header with either a List or Grid layout.
		Each file is rendered as an <code>UploadFileStatus</code> by default, showing progress, status,
		and action buttons. Override per-file rendering with a custom <code>itemContent</code> snippet.
	</p>

	<h2>Basic File List</h2>
	<p>
		Pass an array of file objects. Each object needs fields for the file name, a unique value,
		status, progress, size, and MIME type. The component displays a header with file count and
		status summary.
	</p>

	<Code {...storyBuilder.getFragment(0)} />

	<StoryViewer {...storyBuilder.getExample('intro')} />

	<h2>Grid View</h2>
	<p>
		Switch to a tile layout with <code>view="grid"</code>. The same file data renders as a grid of
		cards instead of a vertical list.
	</p>

	<StoryViewer {...storyBuilder.getExample('grid')} />

	<h2>Action Buttons</h2>
	<p>
		Control which action buttons appear based on the file's status. Pass arrays of status values to
		<code>cancelWhen</code>, <code>retryWhen</code>, and <code>removeWhen</code>. Each action fires
		a callback with the raw file object.
	</p>

	<Code {...storyBuilder.getFragment(2)} />

	<StoryViewer {...storyBuilder.getExample('actions')} />

	<h2>Custom Item Content</h2>
	<p>
		Replace the default <code>UploadFileStatus</code> rendering with a custom
		<code>itemContent</code> snippet. The snippet receives a <code>ProxyItem</code> — use
		<code>proxy.label</code>, <code>proxy.get('status')</code>, etc. to access file data.
	</p>

	<Code {...storyBuilder.getFragment(3)} />

	<StoryViewer {...storyBuilder.getExample('custom')} />

	<h2>Combined Workflow</h2>
	<p>
		Use <code>UploadTarget</code> to accept files, then feed them into <code>UploadProgress</code>
		to track upload status. This example simulates uploading with a timer.
	</p>

	<StoryViewer {...storyBuilder.getExample('workflow')} />

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h2>Props</h2>
			<ul>
				<li><strong>files</strong> — array of file data objects</li>
				<li><strong>fields</strong> — field mapping (status, progress, size, type, error)</li>
				<li><strong>view</strong> — <code>'list'</code> or <code>'grid'</code></li>
				<li><strong>cancelWhen</strong> — statuses that show cancel button</li>
				<li><strong>retryWhen</strong> — statuses that show retry button</li>
				<li><strong>removeWhen</strong> — statuses that show remove button</li>
				<li><strong>labels</strong> — label overrides</li>
				<li><strong>class</strong> — additional CSS classes</li>
			</ul>
		</div>
		<div data-card>
			<h2>Events &amp; Snippets</h2>
			<ul>
				<li><strong>oncancel</strong> — called with raw file object</li>
				<li><strong>onretry</strong> — called with raw file object</li>
				<li><strong>onremove</strong> — called with raw file object</li>
				<li><strong>onclear</strong> — called when clear all is clicked</li>
				<li><strong>itemContent</strong> — snippet <code>(proxy: ProxyItem)</code> for custom file rendering</li>
			</ul>
		</div>
	</div>
</article>
