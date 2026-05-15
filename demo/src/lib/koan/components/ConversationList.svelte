<script lang="ts">
	import type { ConversationMessage } from '../types'
	import { findById } from '../catalog'

	let {
		messages = [] as ConversationMessage[],
		activeId = null as string | null,
		onselect
	}: {
		messages?: ConversationMessage[]
		activeId?: string | null
		onselect?: (demoId: string) => void
	} = $props()
</script>

<ol class="conversation">
	{#each messages as msg (msg.id)}
		{#if msg.kind === 'user'}
			<li class="msg user">
				<span class="label">you</span>
				<span class="body">{msg.query}</span>
			</li>
		{:else}
			<li class="msg response">
				<span class="label">koan</span>
				<p class="body">{msg.copy}</p>
				{#if msg.matches.length > 0}
					<div class="links">
						{#each msg.matches as demoId (demoId)}
							{@const demo = findById(demoId)}
							{#if demo}
								<button
									type="button"
									class="anchor"
									class:active={demoId === activeId}
									onclick={() => onselect?.(demoId)}
								>
									<span aria-hidden="true">{demo.icon}</span>
									<span>{demo.title}</span>
								</button>
							{/if}
						{/each}
					</div>
				{/if}
			</li>
		{/if}
	{/each}
</ol>

<style>
	.conversation {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.msg {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 6px 8px;
		border-radius: var(--radius-sm, 4px);
	}

	.msg + .msg {
		margin-top: 2px;
	}

	.msg.response + .msg.user {
		margin-top: 10px;
	}

	.label {
		font-size: 10px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.msg.user .label {
		@apply text-ink-z4;
	}

	.msg.response .label {
		@apply text-accent-z5;
	}

	.body {
		font-size: 13px;
		margin: 0;
		@apply text-ink-z2;
	}

	.links {
		display: flex;
		flex-direction: column;
		gap: 4px;
		margin-top: 4px;
	}

	.anchor {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 8px;
		border: none;
		background: transparent;
		border-radius: var(--radius-sm, 4px);
		font: inherit;
		font-size: 13px;
		cursor: pointer;
		text-align: left;
		@apply text-accent-z5 bg-surface-z1;
		transition: background 120ms ease;
	}

	.anchor:hover {
		@apply bg-surface-z2 text-ink-z1;
	}

	.anchor.active {
		@apply bg-accent-z1 text-accent-z5;
		font-weight: 500;
	}
</style>
