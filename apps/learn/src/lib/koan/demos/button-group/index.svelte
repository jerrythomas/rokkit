<script lang="ts">
	import { Button, ButtonGroup } from '@rokkit/ui'

	let { ...spread }: Record<string, unknown> = $props()

	let filter = $state<'all' | 'active' | 'archived'>('all')
</script>

<div class="grid">
	<section>
		<header>Split action — primary + secondary + overflow</header>
		<ButtonGroup {...spread}>
			<Button>Save</Button>
			<Button>Save as…</Button>
			<Button icon="i-mdi:chevron-down" aria-label="More options" />
		</ButtonGroup>
	</section>

	<section>
		<header>Segmented filter — single active value</header>
		<ButtonGroup {...spread}>
			<Button onclick={() => (filter = 'all')}>All</Button>
			<Button onclick={() => (filter = 'active')}>Active</Button>
			<Button onclick={() => (filter = 'archived')}>Archived</Button>
		</ButtonGroup>
		<p class="hint">Active filter: <code>{filter}</code></p>
	</section>

	<section>
		<header>Sizes — sm / md / lg</header>
		<div class="row">
			<ButtonGroup size="sm">
				<Button>Prev</Button>
				<Button>Next</Button>
			</ButtonGroup>
			<ButtonGroup size="md">
				<Button>Prev</Button>
				<Button>Next</Button>
			</ButtonGroup>
			<ButtonGroup size="lg">
				<Button>Prev</Button>
				<Button>Next</Button>
			</ButtonGroup>
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
	.row {
		display: flex;
		flex-wrap: wrap;
		gap: 14px;
		align-items: center;
	}
	.hint {
		margin: 0;
		font: 400 12px var(--font-ui);
		color: var(--ink-mute);
	}
</style>
