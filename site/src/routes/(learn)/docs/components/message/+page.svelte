<script>
	// @ts-nocheck
	import { AlertList, Message } from '@rokkit/ui'
	import { alerts } from '@rokkit/states'
	import { Code } from '$lib/components/Story'

	let position = $state('top-right')
	let lastId = $state(null)
	let showDismissible = $state(true)

	const positions = ['top-right', 'top-center', 'top-left', 'bottom-right', 'bottom-center', 'bottom-left']

	function push(type, opts = {}) {
		lastId = alerts.push({ type, text: `${type} — ${new Date().toLocaleTimeString()}`, ...opts })
	}
</script>

<AlertList {position} />

<article data-article-root>
	<p>
		The alerts system has three parts: the <strong>alerts</strong> store (in
		<code>@rokkit/states</code>), the <strong>Message</strong> component (a single notification), and
		<strong>AlertList</strong> (the fixed-position toast container that reads from the store).
	</p>

	<h2>Live Demo</h2>
	<p>
		Push alerts to the store. They appear in the <strong>{position}</strong> corner. Change the
		position using the selector below.
	</p>

	<div style="display:flex; flex-wrap:wrap; gap:0.5rem; margin-bottom:1rem;">
		<button data-button onclick={() => push('info')}>Info</button>
		<button data-button onclick={() => push('success')}>Success</button>
		<button data-button onclick={() => push('warning')}>Warning</button>
		<button data-button onclick={() => push('error')}>Error</button>
		<button data-button onclick={() => push('info', { timeout: 1500 })}>Info (1.5s)</button>
		<button data-button onclick={() => push('error', { dismissible: true })}>Persistent (dismissible)</button>
		{#if lastId}
			<button data-button onclick={() => alerts.dismiss(lastId)}>Dismiss Last</button>
		{/if}
		<button data-button onclick={() => alerts.clear()}>Clear All</button>
	</div>

	<div style="display:flex; flex-wrap:wrap; gap:0.5rem; align-items:center;">
		<strong>Position:</strong>
		{#each positions as p (p)}
			<button
				data-button
				data-variant={position === p ? 'primary' : 'default'}
				onclick={() => (position = p)}>{p}</button
			>
		{/each}
	</div>

	<h2>Quick Start</h2>
	<p>Mount <code>AlertList</code> once at the app root, then push alerts from anywhere:</p>

	<Code content={`<!-- App.svelte -->
<script>
  import { AlertList } from '@rokkit/ui'
<\/script>

<AlertList position="top-right" />
<slot />`} language="svelte" />

	<Code content={`<!-- Anywhere in your app -->
<script>
  import { alerts } from '@rokkit/states'

  // Auto-dismisses after 4 s (default)
  alerts.push({ type: 'success', text: 'Saved!' })

  // Custom timeout
  alerts.push({ type: 'info', text: 'Processing...', timeout: 1500 })

  // Persistent — stays until user dismisses
  alerts.push({ type: 'error', text: 'Failed to save', dismissible: true })

  // Programmatic dismiss
  const id = alerts.push({ type: 'info', text: 'Working...' })
  alerts.dismiss(id)

  // Clear all
  alerts.clear()
<\/script>`} language="svelte" />

	<h2>Inline Message</h2>
	<p>
		Use <code>Message</code> without the store for inline notifications inside layouts. All four types:
	</p>

	<div style="display:flex; flex-direction:column; gap:0.5rem; margin-bottom:1rem;">
		<Message type="error" text="Something went wrong. Please try again." />
		<Message type="warning" text="Your session expires in 5 minutes." />
		<Message type="info" text="A new version is available. Refresh to update." />
		<Message type="success" text="Your changes have been saved." />
	</div>

	<Code content={`<script>
  import { Message } from '@rokkit/ui'
<\/script>

<Message type="error" text="Something went wrong." />
<Message type="warning" text="Your session expires soon." />
<Message type="info" text="A new version is available." />
<Message type="success" text="Changes saved." />`} language="svelte" />

	<h2>Dismissible Message</h2>
	<p>
		Add <code>dismissible</code> to show a dismiss button. Wire <code>ondismiss</code> to remove it from your state:
	</p>

	{#if showDismissible}
		<div style="margin-bottom:1rem;">
			<Message
				type="info"
				text="You can dismiss this message."
				dismissible
				timeout={0}
				ondismiss={() => (showDismissible = false)}
			/>
		</div>
	{:else}
		<div style="margin-bottom:1rem;">
			<button data-button onclick={() => (showDismissible = true)}>Restore</button>
		</div>
	{/if}

	<Code content={`<script>
  let show = $state(true)
<\/script>

{#if show}
  <Message type="info" text="You can dismiss this." dismissible ondismiss={() => (show = false)} />
{/if}`} language="svelte" />

	<h2>Auto-dismiss</h2>
	<p>
		Set <code>timeout</code> (in ms) on a standalone <code>Message</code> or when pushing to the
		store. The component calls <code>ondismiss</code> after the delay.
		Non-dismissible toasts auto-dismiss after 4 s by default.
	</p>

	<Code content={`<!-- Standalone: calls ondismiss after 4 s -->
<Message type="success" text="Saved!" timeout={4000} ondismiss={() => (visible = false)} />

<!-- Store: auto-removed after 3 s -->
alerts.push({ type: 'success', text: 'Done!', timeout: 3000 })

<!-- Persistent: stays until user dismisses -->
alerts.push({ type: 'error', text: 'Action required', dismissible: true })`} language="svelte" />

	<h2>Alerts Store API</h2>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h3>push(alert) → id</h3>
			<ul>
				<li>
					<strong>type</strong>: <code>'error' | 'info' | 'success' | 'warning'</code> (default:
					<code>'info'</code>)
				</li>
				<li><strong>text</strong>: Message string</li>
				<li><strong>dismissible</strong>: Show × button — stays until dismissed (default: <code>false</code>)</li>
				<li><strong>timeout</strong>: Auto-dismiss delay in ms (default: <code>4000</code> for non-dismissible, <code>0</code> for dismissible)</li>
				<li><strong>actions</strong>: Snippet reference for action buttons</li>
			</ul>
		</div>
		<div data-card>
			<h3>dismiss(id) / clear()</h3>
			<ul>
				<li><code>dismiss(id)</code>: Remove one alert by id, cancels its timer</li>
				<li><code>clear()</code>: Remove all alerts, cancel all timers</li>
				<li><code>alerts.current</code>: Reactive array of active alerts</li>
			</ul>
		</div>
	</div>

	<h2>AlertList Props</h2>
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h3>position</h3>
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
			<h3>Design Notes</h3>
			<ul>
				<li>Mount <code>AlertList</code> once at the root — it reads the global <code>alerts</code> store</li>
				<li>Bottom positions stack newest-first at the screen edge</li>
				<li><code>role="alert"</code> on error/warning; <code>role="status"</code> on info/success</li>
				<li>Container is <code>pointer-events: none</code>; individual toasts restore it</li>
			</ul>
		</div>
	</div>

	<h2>Message Props</h2>
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h3>Core Props</h3>
			<ul>
				<li><strong>type</strong>: <code>'info' | 'success' | 'warning' | 'error'</code></li>
				<li><strong>text</strong>: Message string</li>
				<li><strong>dismissible</strong>: Show dismiss button (default: <code>false</code>)</li>
				<li><strong>timeout</strong>: Auto-dismiss delay in ms (default: <code>0</code>)</li>
			</ul>
		</div>
		<div data-card>
			<h3>Events & Snippets</h3>
			<ul>
				<li><strong>ondismiss</strong>: Called when dismissed or timeout fires</li>
				<li><strong>icons</strong>: Override state icon map</li>
				<li><strong>actions</strong>: Snippet for action buttons inside the message</li>
			</ul>
		</div>
	</div>
</article>
