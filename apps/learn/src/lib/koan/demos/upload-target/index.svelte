<script lang="ts">
	import { UploadTarget } from '@rokkit/ui'

	let { ...spread }: Record<string, unknown> = $props()

	let accepted = $state<string[]>([])
	let rejected = $state<{ name: string; reason: string }[]>([])

	function handleFiles(files: File[]) {
		for (const f of files) accepted.push(`${f.name} (${(f.size / 1024).toFixed(1)} KB)`)
	}

	function handleError(payload: unknown) {
		const { file, reason } = payload as { file: File; reason: string }
		rejected.push({ name: file.name, reason })
	}
</script>

<div class="grid">
	<section>
		<header>Drop zone — images up to 5 MB, multiple files</header>
		<UploadTarget
			accept="image/*"
			maxSize={5 * 1024 * 1024}
			multiple
			onfiles={handleFiles}
			onerror={handleError}
			{...spread}
		/>
	</section>

	{#if accepted.length > 0}
		<section>
			<header>Accepted ({accepted.length})</header>
			<ul class="result">
				{#each accepted as line (line)}
					<li>{line}</li>
				{/each}
			</ul>
		</section>
	{/if}

	{#if rejected.length > 0}
		<section>
			<header>Rejected ({rejected.length})</header>
			<ul class="result rejected">
				{#each rejected as r (r.name)}
					<li>
						<code>{r.name}</code> — {r.reason === 'type' ? 'wrong type' : 'too large'}
					</li>
				{/each}
			</ul>
		</section>
	{/if}
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
	.result {
		margin: 0;
		padding-left: 18px;
		font: 400 12.5px/1.55 var(--font-ui);
		color: var(--ink-mute);
	}
	.result code {
		font: 400 12px var(--font-mono);
		color: var(--ink);
		background: var(--paper-soft);
		padding: 1px 5px;
		border-radius: 3px;
	}
</style>
