<script lang="ts">
	import { Tooltip, Button } from '@rokkit/ui'

	let { ...spread }: Record<string, unknown> = $props()
</script>

<div class="grid">
	<section>
		<header>Default — top, 300ms delay</header>
		<div class="row">
			<Tooltip content="Saves your changes" position="top" {...spread}>
				<Button>Save</Button>
			</Tooltip>
			<Tooltip content="Removes the selected item" position="top" {...spread}>
				<Button>Delete</Button>
			</Tooltip>
		</div>
	</section>

	<section>
		<header>Four sides</header>
		<div class="row">
			<Tooltip content="Top side" position="top" {...spread}>
				<Button>Top</Button>
			</Tooltip>
			<Tooltip content="Right side" position="right" {...spread}>
				<Button>Right</Button>
			</Tooltip>
			<Tooltip content="Bottom side" position="bottom" {...spread}>
				<Button>Bottom</Button>
			</Tooltip>
			<Tooltip content="Left side" position="left" {...spread}>
				<Button>Left</Button>
			</Tooltip>
		</div>
	</section>

	<section>
		<header>Rich tooltip content</header>
		<div class="row">
			<Tooltip position="bottom" {...spread}>
				<Button icon="i-mdi:information-outline">Status</Button>
				{#snippet tooltipContent()}
					<div class="rich-tip">
						<div><strong>Build:</strong> passing</div>
						<div><strong>Deploy:</strong> queued</div>
						<div><strong>Tests:</strong> 3507 / 3507</div>
					</div>
				{/snippet}
			</Tooltip>
		</div>
	</section>

	<section>
		<header>Zero delay — snappy</header>
		<div class="row">
			<Tooltip content="No hover delay" delay={0} {...spread}>
				<Button>Hover me</Button>
			</Tooltip>
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
	.rich-tip {
		display: flex;
		flex-direction: column;
		gap: 2px;
		font: 400 12px/1.5 var(--font-ui);
		text-align: left;
	}
	.rich-tip strong {
		color: var(--ink);
	}
</style>
