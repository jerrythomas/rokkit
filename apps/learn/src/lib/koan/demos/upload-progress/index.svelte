<script lang="ts">
	import { UploadProgress } from '@rokkit/ui'
	import { onMount } from 'svelte'

	let { ...spread }: Record<string, unknown> = $props()

	type FileRow = {
		id: string
		label: string
		size: number
		type: string
		progress: number
		status: string
		error?: string
	}

	let files = $state<FileRow[]>([
		{ id: '1', label: 'spec.pdf', size: 240_000, type: 'application/pdf', progress: 100, status: 'completed' },
		{ id: '2', label: 'logo.svg', size: 12_000, type: 'image/svg+xml', progress: 42, status: 'uploading' },
		{ id: '3', label: 'video.mp4', size: 8_400_000, type: 'video/mp4', progress: 0, status: 'failed', error: 'Network timeout' },
		{ id: '4', label: 'avatar.png', size: 86_000, type: 'image/png', progress: 0, status: 'queued' }
	])

	onMount(() => {
		const id = setInterval(() => {
			const target = files.find((f) => f.status === 'uploading')
			if (target) {
				target.progress = Math.min(100, target.progress + 6)
				if (target.progress === 100) target.status = 'completed'
			}
		}, 600)
		return () => clearInterval(id)
	})

	function handleRetry(file: unknown) {
		const f = file as FileRow
		const row = files.find((x) => x.id === f.id)
		if (row) {
			row.status = 'uploading'
			row.progress = 4
			row.error = undefined
		}
	}

	function handleRemove(file: unknown) {
		const f = file as FileRow
		files = files.filter((x) => x.id !== f.id)
	}

	function handleCancel(file: unknown) {
		const f = file as FileRow
		const row = files.find((x) => x.id === f.id)
		if (row) {
			row.status = 'cancelled'
			row.progress = 0
		}
	}
</script>

<div class="grid">
	<section>
		<header>Mixed statuses — uploading animates, retry / remove fire</header>
		<UploadProgress
			{files}
			cancelWhen={['uploading', 'queued']}
			retryWhen={['failed', 'cancelled']}
			removeWhen={['completed', 'failed', 'cancelled']}
			oncancel={handleCancel}
			onretry={handleRetry}
			onremove={handleRemove}
			{...spread}
		/>
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
</style>
