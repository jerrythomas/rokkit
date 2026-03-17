<script>
	import { Code } from '$lib/components/Story'
	import navigableExample from './snippets/00-navigable.svelte?raw'
	import otherActions from './snippets/01-other-actions.svelte?raw'
</script>

<article data-article-root>
	<p class="text-surface-z6 mb-8 text-[1.0625rem] leading-7">
		Svelte actions are plain functions applied to DOM elements via the <code>use:</code> directive.
		They run when the element mounts, set up event listeners or observers, and clean up
		automatically on destroy. <code>@rokkit/actions</code> provides actions for keyboard navigation,
		gestures, and visual effects.
	</p>

	<h2>How actions work</h2>
	<p>
		Apply an action with <code>use:actionName</code> or <code>use:actionName={'{'}options{'}'}</code>.
		The action sets up its behavior on mount and tears down on destroy — no lifecycle management
		needed:
	</p>
	<pre><code>&lt;div use:someAction={'{'}options{'}'} onsomeevent={'{'}handler{'}'}&gt;...&lt;/div&gt;</code></pre>

	<h2>navigable — keyboard navigation</h2>
	<p>
		The lightweight keyboard navigation action. Add <code>use:navigable</code> to any container and
		handle the custom events it dispatches. Events fire on <strong>keyup</strong> (not keydown).
		Default orientation is vertical (ArrowUp/Down = previous/next):
	</p>
	<Code content={navigableExample} language="svelte" />
	<p>Events dispatched by <code>navigable</code>:</p>
	<table>
		<thead>
			<tr><th>Event</th><th>Vertical (default)</th><th>Horizontal</th></tr>
		</thead>
		<tbody>
			<tr><td><code>previous</code></td><td>ArrowUp</td><td>ArrowLeft</td></tr>
			<tr><td><code>next</code></td><td>ArrowDown</td><td>ArrowRight</td></tr>
			<tr><td><code>select</code></td><td>Enter, Space</td><td>Enter, Space</td></tr>
			<tr><td><code>collapse</code></td><td>ArrowLeft (nested)</td><td>ArrowUp (nested)</td></tr>
			<tr><td><code>expand</code></td><td>ArrowRight (nested)</td><td>ArrowDown (nested)</td></tr>
		</tbody>
	</table>
	<p>
		Options: <code>orientation</code> (<code>'vertical'|'horizontal'</code>), <code>nested</code>
		(boolean — enable collapse/expand), <code>enabled</code> (boolean — disable all key handling).
	</p>

	<h2>Visual and interaction actions</h2>
	<p>
		Additional actions for visual effects and interaction patterns:
	</p>
	<Code content={otherActions} language="svelte" />

	<h2>All exported actions</h2>
	<table>
		<thead>
			<tr><th>Action</th><th>Purpose</th></tr>
		</thead>
		<tbody>
			<tr><td><code>navigable</code></td><td>Lightweight keyboard nav — dispatches previous/next/select/collapse/expand on keyup</td></tr>
			<tr><td><code>navigator</code></td><td>Full-featured nav paired with a Rokkit controller from @rokkit/states</td></tr>
			<tr><td><code>keyboard</code></td><td>Bind keyboard shortcuts with a keymap object</td></tr>
			<tr><td><code>pannable</code></td><td>Pointer drag with pan/panstart/panend events</td></tr>
			<tr><td><code>swipeable</code></td><td>Touch/pointer swipe detection (swipeleft/swiperight/swipeup/swipedown)</td></tr>
			<tr><td><code>fillable</code></td><td>Fill container on pointer drag — dispatches fill events with progress value</td></tr>
			<tr><td><code>dismissable</code></td><td>Dismiss on click-outside or Escape key</td></tr>
			<tr><td><code>themable</code></td><td>Apply data-style attribute dynamically from the vibe store</td></tr>
			<tr><td><code>skinnable</code></td><td>Apply data-palette attribute dynamically from the vibe store</td></tr>
			<tr><td><code>reveal</code></td><td>Scroll-triggered reveal animation via IntersectionObserver</td></tr>
			<tr><td><code>hoverLift</code></td><td>Lift/depth animation on hover</td></tr>
			<tr><td><code>magnetic</code></td><td>Cursor-attraction magnetic effect</td></tr>
			<tr><td><code>ripple</code></td><td>Material-style ripple on click/tap</td></tr>
			<tr><td><code>delegateKeyboardEvents</code></td><td>Forward keyboard events from a container to a target element</td></tr>
		</tbody>
	</table>

	<h2>Related</h2>
	<ul>
		<li>
			<a href="/docs/utilities/states">@rokkit/states</a> — Controllers that pair with the
			<code>navigator</code> action
		</li>
		<li>
			<a href="/docs/utilities/navigator">Navigator</a> — How the navigator action and controllers
			work together
		</li>
	</ul>
</article>
