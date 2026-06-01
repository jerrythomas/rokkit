<script>
	// @ts-nocheck
	import { UploadProgress } from '@rokkit/ui'

	const files = [
		{
			label: 'photo.jpg',
			value: '1',
			size: 245760,
			type: 'image/jpeg',
			status: 'uploading',
			progress: 65
		},
		{
			label: 'document.pdf',
			value: '2',
			size: 1048576,
			type: 'application/pdf',
			status: 'done',
			progress: 100
		},
		{
			label: 'report.xlsx',
			value: '3',
			size: 524288,
			type: 'application/vnd.ms-excel',
			status: 'error',
			progress: 30
		}
	]
</script>

<UploadProgress {files}>
	{#snippet itemContent(proxy)}
		<div class="flex items-center gap-3 rounded border px-3 py-2">
			<span class={proxy.icon} class:text-lg={true}></span>
			<div class="flex-1">
				<div class="font-medium">{proxy.label}</div>
				<div class="text-surface-z5 text-xs">{proxy.get('status')}</div>
			</div>
			{#if proxy.get('progress') > 0 && proxy.get('progress') < 100}
				<div class="font-mono text-sm">{proxy.get('progress')}%</div>
			{/if}
		</div>
	{/snippet}
</UploadProgress>
