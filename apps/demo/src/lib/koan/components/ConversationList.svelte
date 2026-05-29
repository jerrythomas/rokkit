<script lang="ts">
	import type { ConversationMessage } from '../types'
	import { findById } from '../catalog'

	let {
		messages = [] as ConversationMessage[],
		activeId = null as string | null,
		onselect,
		pendingReset = false,
		onConfirmReset,
		onCancelReset
	}: {
		messages?: ConversationMessage[]
		activeId?: string | null
		onselect?: (demoId: string) => void
		pendingReset?: boolean
		onConfirmReset?: () => void
		onCancelReset?: () => void
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
			<li class="msg response" class:active={activeId !== null && msg.matches.includes(activeId)}>
				<span class="label">koan</span>
				{#if msg.matches.length === 1}
					<button
						type="button"
						class="body-link"
						class:active={msg.matches[0] === activeId}
						onclick={() => onselect?.(msg.matches[0])}
					>{msg.copy}</button>
				{:else}
					<p class="body">{msg.copy}</p>
				{/if}
				{#if msg.matches.length > 1}
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
	{#if pendingReset}
		<li class="msg system">
			<span class="label">koan</span>
			<p class="body">Reset everything — themes, history, conversation?</p>
			<div class="actions">
				<button type="button" class="action danger" onclick={onConfirmReset}>Yes, reset</button>
				<button type="button" class="action" onclick={onCancelReset}>Cancel</button>
			</div>
		</li>
	{/if}
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
		padding: 6px 8px 6px 12px;
		border-radius: var(--radius-sm, 4px);
		position: relative;
	}

	.msg.response.active::before {
		content: '';
		position: absolute;
		left: 2px;
		top: 8px;
		bottom: 8px;
		width: 2px;
		@apply bg-primary-z5;
		border-radius: 1px;
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

	.body-link {
		display: block;
		width: 100%;
		margin: 0;
		padding: 0;
		background: transparent;
		border: none;
		text-align: left;
		font: inherit;
		font-size: 13px;
		cursor: pointer;
		@apply text-ink-z2;
		transition: color 120ms ease;
	}
	.body-link:hover {
		@apply text-ink-z1;
		text-decoration: underline;
		text-decoration-color: var(--color-accent-z5);
		text-decoration-thickness: 1px;
		text-underline-offset: 3px;
	}
	.body-link.active {
		@apply text-ink-z1;
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

	.msg.system .label {
		@apply text-accent-z5;
	}

	.msg.system .body {
		@apply text-ink-z2;
		font-size: 13px;
	}

	.actions {
		display: flex;
		gap: 8px;
		margin-top: 6px;
	}

	.action {
		padding: 4px 10px;
		border-radius: var(--radius-sm, 4px);
		font-size: 12px;
		cursor: pointer;
		@apply bg-surface-z1 border border-surface-z2 text-ink-z2;
	}

	.action:hover {
		@apply border-accent-z5 text-ink-z1;
	}

	.action.danger {
		@apply bg-primary-z5 border-primary-z5 text-on-primary;
	}

	.action.danger:hover {
		@apply bg-primary-z6;
	}
</style>
