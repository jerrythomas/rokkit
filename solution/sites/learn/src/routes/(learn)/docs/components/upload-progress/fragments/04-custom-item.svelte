<UploadProgress {files}>
	{#snippet itemContent(proxy)}
		<div class="flex items-center gap-2 p-2">
			<span class={proxy.icon}></span>
			<span>{proxy.label}</span>
			<span class="ml-auto text-xs">{proxy.get('status')}</span>
		</div>
	{/snippet}
</UploadProgress>
