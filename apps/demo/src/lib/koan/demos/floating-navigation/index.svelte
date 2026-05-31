<script lang="ts">
	import { FloatingNavigation } from '@rokkit/ui'

	let { ...spread }: Record<string, unknown> = $props()

	const sections = [
		{ label: 'Introduction', value: 'fn-intro', icon: 'i-glyph:book', href: '#fn-intro' },
		{ label: 'Features', value: 'fn-features', icon: 'i-glyph:star', href: '#fn-features' },
		{ label: 'Contact', value: 'fn-contact', icon: 'i-glyph:letter', href: '#fn-contact' }
	]

	let active = $state<string>('fn-intro')
</script>

<div class="stage">
	<aside>
		<FloatingNavigation
			items={sections}
			bind:value={active}
			position="left"
			pinned
			observe={false}
			{...spread}
		/>
	</aside>
	<div class="scroller">
		<section id="fn-intro">
			<h3>Introduction</h3>
			<p>
				Three faux sections inside the canvas, scrollable independently of the chat-shell.
				The rail on the left expands on hover; clicking a dot smooth-scrolls to that section.
			</p>
		</section>
		<section id="fn-features">
			<h3>Features</h3>
			<p>
				Tweak <code>position</code> to flip the rail to the right, top, or bottom. Toggle
				<code>pinned</code> off to see the auto-collapse behaviour.
			</p>
		</section>
		<section id="fn-contact">
			<h3>Contact</h3>
			<p>
				Active dot is <code>{active}</code> — wired through <code>bind:value</code>. In a
				real page <code>observe</code> would auto-sync this as you scroll the document body.
			</p>
		</section>
	</div>
</div>

<style>
	.stage {
		position: relative;
		display: flex;
		gap: 0;
		border: 1px dashed var(--paper-edge);
		border-radius: 8px;
		background: var(--paper-soft);
		min-height: 320px;
		overflow: hidden;
	}
	aside {
		position: relative;
		width: 56px;
		flex-shrink: 0;
		border-right: 1px solid var(--paper-edge);
	}
	.scroller {
		flex: 1;
		padding: 16px 20px;
		overflow-y: auto;
		max-height: 320px;
		scroll-behavior: smooth;
	}
	section {
		padding: 20px 0;
		border-bottom: 1px dashed var(--paper-edge);
	}
	section:last-child {
		border-bottom: 0;
	}
	h3 {
		margin: 0 0 6px;
		font: 600 14px var(--font-display);
		color: var(--ink);
	}
	p {
		margin: 0;
		font: 400 13px/1.55 var(--font-ui);
		color: var(--ink-mute);
	}
	code {
		font: 400 12px var(--font-mono);
		background: var(--paper);
		padding: 1px 5px;
		border-radius: 3px;
		color: var(--ink);
	}
</style>
