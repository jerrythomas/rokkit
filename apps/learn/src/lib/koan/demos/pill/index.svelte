<script lang="ts">
	import { Pill } from '@rokkit/ui'
	let tags = $state(['svelte', 'typescript', 'rokkit', 'data-first'])
	function remove(v: unknown) { tags = tags.filter((t) => t !== v) }
</script>

<div class="grid">
	<section>
		<header>Simple pill</header>
		<div class="row">
			<Pill value="svelte" />
			<Pill value="typescript" />
			<Pill value="data-first" />
		</div>
	</section>

	<section>
		<header>Removable tags</header>
		<div class="row">
			{#each tags as t (t)}
				<Pill value={t} removable onremove={remove} />
			{/each}
			{#if tags.length === 0}<em>All removed — reload to reset.</em>{/if}
		</div>
	</section>

	<section>
		<header>Disabled</header>
		<div class="row">
			<Pill value="locked" disabled removable />
		</div>
	</section>
</div>

<style>
	.grid { display: flex; flex-direction: column; gap: 18px; }
	section { display: flex; flex-direction: column; gap: 8px; }
	header { font: 500 11px var(--font-mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-soft); }
	.row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
</style>
