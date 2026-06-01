<script>
	// @ts-nocheck
	import { UploadTarget } from '@rokkit/ui'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	let lastFiles = $state('')
	let lastError = $state('')

	let props = $state({ accept: '', maxSize: 0, multiple: true, disabled: false })

	const schema = {
		type: 'object',
		properties: {
			accept: { type: 'string' },
			maxSize: { type: 'number' },
			multiple: { type: 'boolean' },
			disabled: { type: 'boolean' }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{ scope: '#/accept', label: 'Accept', props: { placeholder: 'image/*,.pdf' } },
			{ scope: '#/maxSize', label: 'Max size (bytes)' },
			{ scope: '#/multiple', label: 'Multiple' },
			{ scope: '#/disabled', label: 'Disabled' },
			{ type: 'separator' }
		]
	}

	function handleFiles(files) {
		lastFiles = files.map((f) => f.name).join(', ')
		lastError = ''
	}

	function handleError(err) {
		lastError = `${err.file.name}: ${err.reason}`
	}
</script>

<PlaySection>
	{#snippet preview()}
		<div class="flex flex-wrap gap-6">
			<div>
				<h4 class="text-surface-z5 m-0 mb-2 text-xs tracking-wide uppercase">Default</h4>
				<div class="w-[320px]">
					<UploadTarget multiple onfiles={handleFiles} onerror={handleError} />
				</div>
			</div>
			<div>
				<h4 class="text-surface-z5 m-0 mb-2 text-xs tracking-wide uppercase">Constrained</h4>
				<div class="w-[320px]">
					<UploadTarget
						accept={props.accept || undefined}
						maxSize={props.maxSize || Infinity}
						multiple={props.multiple}
						disabled={props.disabled}
						onfiles={handleFiles}
						onerror={handleError}
					/>
				</div>
			</div>
		</div>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
		<InfoField label="Files" value={lastFiles} />
		<InfoField label="Error" value={lastError} />
	{/snippet}
</PlaySection>
