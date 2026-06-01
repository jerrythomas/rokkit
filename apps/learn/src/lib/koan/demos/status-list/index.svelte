<script lang="ts">
	import { StatusList } from '@rokkit/ui'

	let { ...spread }: Record<string, unknown> = $props()

	const staticChecks = [
		{ text: 'At least 8 characters', status: 'pass' },
		{ text: 'Contains an uppercase letter', status: 'fail' },
		{ text: 'Contains a number (recommended)', status: 'warn' },
		{ text: 'Special character check', status: 'unknown' }
	]

	let password = $state('')

	const liveChecks = $derived([
		{ text: 'At least 8 characters', status: password.length >= 8 ? 'pass' : 'fail' },
		{ text: 'Contains an uppercase letter', status: /[A-Z]/.test(password) ? 'pass' : 'fail' },
		{
			text: 'Contains a number (recommended)',
			status: /[0-9]/.test(password) ? 'pass' : 'warn'
		},
		{
			text: 'Contains a special character',
			status: /[^A-Za-z0-9]/.test(password) ? 'pass' : 'unknown'
		}
	])
</script>

<div class="grid">
	<section>
		<header>Static — four status states</header>
		<StatusList items={staticChecks} {...spread} />
	</section>

	<section>
		<header>Live — password strength checker</header>
		<input
			type="password"
			bind:value={password}
			placeholder="Type a password…"
			class="password-input"
		/>
		<StatusList items={liveChecks} {...spread} />
	</section>
</div>

<style>
	.grid {
		display: flex;
		flex-direction: column;
		gap: 18px;
	}
	section {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	header {
		font: 500 11px var(--font-mono);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--ink-soft);
	}
	.password-input {
		padding: 6px 10px;
		border: 1px solid var(--paper-edge);
		border-radius: 4px;
		background: var(--paper);
		color: var(--ink);
		font: 400 13px var(--font-ui);
		max-width: 260px;
	}
	.password-input:focus-visible {
		outline: none;
		border-color: var(--ink-soft);
	}
</style>
