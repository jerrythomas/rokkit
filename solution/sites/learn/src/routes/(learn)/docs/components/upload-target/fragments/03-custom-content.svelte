<UploadTarget onfiles={handleFiles}>
	{#snippet content(dragging)}
		<div class="custom-zone" class:dragging>
			<span class="i-lucide:cloud-upload"></span>
			<p>{dragging ? 'Release to upload' : 'Drag files here'}</p>
		</div>
	{/snippet}
</UploadTarget>
