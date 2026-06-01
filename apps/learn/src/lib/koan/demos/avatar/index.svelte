<script lang="ts">
	import { Avatar } from '@rokkit/ui'
	let { ...spread }: Record<string, unknown> = $props()
</script>

<div class="grid">
	<section>
		<header>Sizes</header>
		<div class="row">
			<Avatar size="xs" name="Ada Lovelace" {...spread} />
			<Avatar size="sm" name="Ada Lovelace" {...spread} />
			<Avatar size="md" name="Ada Lovelace" {...spread} />
			<Avatar size="lg" name="Ada Lovelace" {...spread} />
			<Avatar size="xl" name="Ada Lovelace" {...spread} />
		</div>
	</section>

	<section>
		<header>Initials fallback</header>
		<div class="row">
			<Avatar name="Ada Lovelace" />
			<Avatar name="Linus Torvalds" />
			<Avatar name="Grace Hopper" />
			<Avatar initials="??" />
		</div>
	</section>

	<section>
		<header>Status presence</header>
		<div class="row">
			<Avatar name="Online" status="online" />
			<Avatar name="Away" status="away" />
			<Avatar name="Busy" status="busy" />
			<Avatar name="Offline" status="offline" />
		</div>
	</section>

	<section>
		<header>Shape</header>
		<div class="row">
			<Avatar name="Ada Lovelace" shape="circle" />
			<Avatar name="Ada Lovelace" shape="square" />
		</div>
	</section>
</div>

<style>
	.grid { display: flex; flex-direction: column; gap: 18px; }
	section { display: flex; flex-direction: column; gap: 8px; }
	header { font: 500 11px var(--font-mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-soft); }
	.row { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
</style>
