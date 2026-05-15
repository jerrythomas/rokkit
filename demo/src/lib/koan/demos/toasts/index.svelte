<script lang="ts">
	import { Button, AlertList } from '@rokkit/ui'
	import { alerts } from '@rokkit/states'

	type Tone = 'success' | 'warning' | 'error' | 'info'

	const messages: Record<Tone, string> = {
		success: 'Changes saved successfully.',
		warning: 'Your session expires in 5 minutes.',
		error: 'Failed to connect — please retry.',
		info: 'A new version is available.'
	}

	function show(tone: Tone) {
		alerts.push({ type: tone, text: messages[tone] })
	}
</script>

<section class="toasts-demo">
	<AlertList position="top-right" />
	<div class="actions">
		<Button variant="primary" onclick={() => show('success')}>Show success</Button>
		<Button variant="default" onclick={() => show('warning')}>Show warning</Button>
		<Button variant="danger" onclick={() => show('error')}>Show error</Button>
		<Button variant="secondary" onclick={() => show('info')}>Show info</Button>
	</div>
	<p class="intro">
		Toasts surface short, time-limited feedback after an action. Each tone signals a different
		intent — success, warning, error, info.
	</p>
</section>

<style>
	.toasts-demo {
		display: flex;
		flex-direction: column;
		gap: 24px;
		max-width: 720px;
		margin: 0 auto;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
	}

	.intro {
		@apply text-ink-z3;
		font-family: var(--font-script, 'Caveat', cursive);
		font-size: 22px;
		margin: 0;
		text-align: center;
	}
</style>
