<script lang="ts">
	import { Message, Button } from '@rokkit/ui'
	let { ...spread }: Record<string, unknown> = $props()

	let dismissed = $state(false)
</script>

<div class="grid">
	<section>
		<header>Four kinds</header>
		<Message type="info" text="A regular informational nudge." {...spread} />
		<Message type="success" text="Your changes were saved successfully." {...spread} />
		<Message type="warning" text="You're approaching your storage quota." {...spread} />
		<Message type="error" text="Couldn't connect to the server. Retry?" {...spread} />
	</section>

	<section>
		<header>Dismissible (manual)</header>
		{#if !dismissed}
			<Message type="info" text="This one has a close button. Click X to dismiss." dismissible ondismiss={() => (dismissed = true)} />
		{:else}
			<p><Button onclick={() => (dismissed = false)}>Show it again</Button></p>
		{/if}
	</section>

	<section>
		<header>Rich content</header>
		<Message type="warning">
			<strong>Heads up.</strong> The migration runs at 2 AM UTC. <a href="https://example.com">Read the runbook →</a>
		</Message>
	</section>
</div>

<style>
	.grid { display: flex; flex-direction: column; gap: 18px; }
	section { display: flex; flex-direction: column; gap: 8px; }
	header { font: 500 11px var(--font-mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-soft); }
	p { margin: 0; }
</style>
