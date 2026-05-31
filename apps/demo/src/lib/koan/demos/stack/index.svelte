<script lang="ts">
	import { Stack } from '@rokkit/ui'

	let { ...spread }: Record<string, unknown> = $props()
</script>

<div class="grid">
	<section>
		<header>Vertical — gap=sm</header>
		<Stack gap="sm" {...spread}>
			<div class="tile">Item one</div>
			<div class="tile">Item two</div>
			<div class="tile">Item three</div>
		</Stack>
	</section>

	<section>
		<header>Horizontal — gap=md, align=center</header>
		<Stack direction="horizontal" gap="md" align="center" {...spread}>
			<span class="i-mdi:home tile-icon" aria-hidden="true"></span>
			<span class="tile-label">Home</span>
			<span class="i-mdi:chevron-right tile-icon" aria-hidden="true"></span>
			<span class="tile-label">Settings</span>
		</Stack>
	</section>

	<section>
		<header>Horizontal — justify=between</header>
		<Stack direction="horizontal" justify="between" align="center" {...spread}>
			<strong class="tile-title">Section title</strong>
			<button class="ghost-button" type="button">Action</button>
		</Stack>
	</section>

	<section>
		<header>Gap scale comparison (vertical)</header>
		<div class="scale-row">
			{#each ['xs', 'sm', 'md', 'lg', 'xl'] as g}
				<div class="scale-col">
					<Stack gap={g as 'xs' | 'sm' | 'md' | 'lg' | 'xl'}>
						<div class="dot"></div>
						<div class="dot"></div>
						<div class="dot"></div>
					</Stack>
					<span class="scale-label">{g}</span>
				</div>
			{/each}
		</div>
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
	.tile {
		padding: 8px 14px;
		border: 1px solid var(--paper-edge);
		border-radius: 6px;
		background: var(--paper);
		font: 400 13px var(--font-ui);
		color: var(--ink);
	}
	.tile-icon {
		width: 16px;
		height: 16px;
		color: var(--ink-soft);
	}
	.tile-label {
		font: 400 13px var(--font-ui);
		color: var(--ink);
	}
	.tile-title {
		font: 600 14px var(--font-display);
		color: var(--ink);
	}
	.ghost-button {
		padding: 4px 12px;
		border: 1px solid var(--paper-edge);
		border-radius: 4px;
		background: var(--paper);
		color: var(--ink);
		font: 500 12px var(--font-ui);
		cursor: pointer;
	}
	.scale-row {
		display: flex;
		gap: 22px;
		align-items: flex-start;
	}
	.scale-col {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
	}
	.dot {
		width: 22px;
		height: 6px;
		border-radius: 3px;
		background: var(--ink-soft);
	}
	.scale-label {
		font: 500 10px var(--font-mono);
		letter-spacing: 0.1em;
		color: var(--ink-mute);
		text-transform: uppercase;
	}
</style>
