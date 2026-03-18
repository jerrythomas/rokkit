<script>
	// @ts-nocheck
	import { AlertList, Message } from '@rokkit/ui'
	import { alerts } from '@rokkit/states'

	let position = $state('top-right')
	let lastId = $state(null)

	const positions = [
		'top-right',
		'top-center',
		'top-left',
		'bottom-right',
		'bottom-center',
		'bottom-left'
	]

	function push(type, opts = {}) {
		lastId = alerts.push({ type, text: `${type} — ${new Date().toLocaleTimeString()}`, ...opts })
	}
</script>

<AlertList {position} />

<article data-article-root>
	<h1>Alerts &amp; Toast Notifications</h1>
	<p>
		The alerts system has three parts: the <strong>alerts</strong> store (in
		<code>@rokkit/states</code>), the <strong>Message</strong> component (a single notification), and
		<strong>AlertList</strong> (the fixed-position toast container that reads from the store).
	</p>

	<h1>Live Demo</h1>
	<p>
		Push alerts to the store. They appear in the <strong>{position}</strong> corner. Change the position
		using the selector below.
	</p>

	<div style="display:flex; flex-wrap:wrap; gap:0.5rem; margin-bottom:1rem;">
		<button data-button onclick={() => push('info')}>Info</button>
		<button data-button onclick={() => push('success')}>Success</button>
		<button data-button onclick={() => push('warning')}>Warning</button>
		<button data-button onclick={() => push('error')}>Error</button>
		<button data-button onclick={() => push('success', { timeout: 3000 })}>Success (3s)</button>
		<button data-button onclick={() => push('info', { dismissible: true })}>Dismissible</button>
		{#if lastId}
			<button data-button onclick={() => alerts.dismiss(lastId)}>Dismiss Last</button>
		{/if}
		<button data-button onclick={() => alerts.clear()}>Clear All</button>
	</div>

	<div style="display:flex; flex-wrap:wrap; gap:0.5rem; align-items:center;">
		<strong>Position:</strong>
		{#each positions as p}
			<button
				data-button
				data-variant={position === p ? 'primary' : 'default'}
				onclick={() => (position = p)}>{p}</button
			>
		{/each}
	</div>

	<h1>Quick Start</h1>
	<p>Mount <code>AlertList</code> once at the app root, then push from anywhere:</p>

	<pre><code>&lt;!-- App.svelte --&gt;
&lt;script&gt;
  import &#123; AlertList &#125; from '@rokkit/ui'
&lt;/script&gt;

&lt;AlertList position="top-right" /&gt;
&lt;slot /&gt;</code></pre>

	<pre><code>&lt;!-- Anywhere in your app --&gt;
&lt;script&gt;
  import &#123; alerts &#125; from '@rokkit/states'

  // Basic
  alerts.push(&#123; type: 'success', text: 'Saved!' &#125;)

  // Auto-dismiss after 3 s
  alerts.push(&#123; type: 'info', text: 'Processing...', timeout: 3000 &#125;)

  // Persistent with dismiss button
  alerts.push(&#123; type: 'error', text: 'Failed to save', dismissible: true &#125;)

  // Programmatic dismiss
  const id = alerts.push(&#123; type: 'info', text: 'Working...' &#125;)
  alerts.dismiss(id)

  // Clear all
  alerts.clear()
&lt;/script&gt;</code></pre>

	<h1>Message — Standalone</h1>
	<p>
		Use <code>Message</code> without the store for inline notifications inside layouts. All four
		types:
	</p>

	<div style="display:flex; flex-direction:column; gap:0.5rem; margin-bottom:1rem;">
		<Message type="error" text="Something went wrong. Please try again." />
		<Message type="warning" text="Your session expires in 5 minutes." />
		<Message type="info" text="A new version is available. Refresh to update." />
		<Message type="success" text="Your changes have been saved." />
	</div>

	<pre><code>&lt;script&gt;
  import &#123; Message &#125; from '@rokkit/ui'
&lt;/script&gt;

&lt;Message type="error" text="Something went wrong." /&gt;
&lt;Message type="warning" text="Your session expires soon." /&gt;
&lt;Message type="info" text="A new version is available." /&gt;
&lt;Message type="success" text="Changes saved." /&gt;</code></pre>

	<h1>Dismissible Message</h1>
	<p>
		Add <code>dismissible</code> to show an × button. Wire <code>ondismiss</code> to remove it from
		your state:
	</p>

	<pre><code>&lt;script&gt;
  let show = $state(true)
&lt;/script&gt;

&#123;#if show&#125;
  &lt;Message type="info" text="You can dismiss this." dismissible ondismiss=&#123;() =&gt; (show = false)&#125; /&gt;
&#123;/if&#125;</code></pre>

	<h1>Auto-dismiss</h1>
	<p>
		Set <code>timeout</code> (in ms) on a standalone <code>Message</code> or when pushing to the
		store. The component calls <code>ondismiss</code> after the delay:
	</p>

	<pre><code>&lt;!-- Standalone: calls ondismiss after 4 s --&gt;
&lt;Message type="success" text="Saved!" timeout=&#123;4000&#125; ondismiss=&#123;() =&gt; (visible = false)&#125; /&gt;

&lt;!-- Store: auto-removed after 3 s --&gt;
alerts.push(&#123; type: 'success', text: 'Done!', timeout: 3000 &#125;)</code></pre>

	<h1>Alerts Store API</h1>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h1>push(alert) → id</h1>
			<ul>
				<li><strong>type</strong>: <code>'error' | 'info' | 'success' | 'warning'</code> (default: <code>'info'</code>)</li>
				<li><strong>text</strong>: Message string</li>
				<li><strong>dismissible</strong>: Show × button (default: <code>false</code>)</li>
				<li><strong>timeout</strong>: Auto-dismiss delay in ms (default: <code>0</code>)</li>
				<li><strong>actions</strong>: Snippet reference for action buttons</li>
			</ul>
		</div>
		<div data-card>
			<h1>dismiss(id) / clear()</h1>
			<ul>
				<li><code>dismiss(id)</code>: Remove one alert by id, cancels its timer</li>
				<li><code>clear()</code>: Remove all alerts, cancel all timers</li>
				<li><code>alerts.current</code>: Reactive array of active alerts</li>
			</ul>
		</div>
	</div>

	<h1>AlertList Props</h1>
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h1>position</h1>
			<ul>
				<li><code>'top-right'</code> (default)</li>
				<li><code>'top-center'</code></li>
				<li><code>'top-left'</code></li>
				<li><code>'bottom-right'</code></li>
				<li><code>'bottom-center'</code></li>
				<li><code>'bottom-left'</code></li>
			</ul>
		</div>
		<div data-card>
			<h1>Design Notes</h1>
			<ul>
				<li>Mount <code>AlertList</code> once at the root — it reads the global <code>alerts</code> store</li>
				<li>Bottom positions stack newest-first at the screen edge</li>
				<li><code>role="alert"</code> on error/warning; <code>role="status"</code> on info/success</li>
				<li>Container is <code>pointer-events: none</code>; individual toasts restore it</li>
			</ul>
		</div>
	</div>
</article>
