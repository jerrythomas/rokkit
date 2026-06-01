<script lang="ts">
	import { Badge, Button } from '@rokkit/ui'
	let { ...spread }: Record<string, unknown> = $props()
</script>

<div class="grid">
	<section>
		<header>Numeric counts</header>
		<div class="row">
			<Badge count={3} {...spread} />
			<Badge count={42} {...spread} />
			<Badge count={150} max={99} {...spread} />
		</div>
	</section>

	<section>
		<header>Variants</header>
		<div class="row">
			<Badge count={5} variant="default" />
			<Badge count={5} variant="primary" />
			<Badge count={5} variant="success" />
			<Badge count={5} variant="warning" />
			<Badge count={5} variant="error" />
		</div>
	</section>

	<section>
		<header>Dot (no content)</header>
		<div class="row">
			<Badge dot variant="success" />
			<Badge dot variant="error" />
		</div>
	</section>

	<section>
		<header>Wrapping a target</header>
		<div class="row">
			<Badge count={9} variant="error">
				<Button icon="i-mdi:bell" aria-label="Notifications" />
			</Badge>
			<Badge dot variant="primary">
				<Button icon="i-mdi:email" aria-label="Mail" />
			</Badge>
		</div>
	</section>
</div>

<style>
	.grid { display: flex; flex-direction: column; gap: 18px; }
	section { display: flex; flex-direction: column; gap: 8px; }
	header { font: 500 11px var(--font-mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-soft); }
	.row { display: flex; flex-wrap: wrap; gap: 16px; align-items: center; }
</style>
