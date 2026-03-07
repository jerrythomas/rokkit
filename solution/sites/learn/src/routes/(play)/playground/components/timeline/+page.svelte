<script>
	// @ts-nocheck
	import { Timeline } from '@rokkit/ui'
	import PlaySection from '$lib/components/PlaySection.svelte'

	const steps = [
		{ label: 'Requirements', description: 'Gather project requirements and define scope.', completed: true },
		{ label: 'Design', description: 'Create wireframes and design mockups.', completed: true },
		{ label: 'Development', description: 'Build the application features.', active: true },
		{ label: 'Testing', description: 'Run unit tests, integration tests, and QA.' },
		{ label: 'Deployment', description: 'Deploy to production and monitor.' }
	]

	const changelog = [
		{ label: 'v2.0.0', description: 'Major release with new component library.' },
		{ label: 'v1.5.0', description: 'Added dark mode support and accessibility improvements.' },
		{ label: 'v1.2.0', description: 'Performance optimizations and bug fixes.' },
		{ label: 'v1.0.0', description: 'Initial public release.' }
	]
</script>

<PlaySection>
	{#snippet preview()}
		<div class="flex flex-col gap-8">
			<div>
				<h4 class="m-0 mb-4 text-xs text-surface-z5 uppercase tracking-wide">Project timeline</h4>
				<Timeline items={steps} />
			</div>
			<div>
				<h4 class="m-0 mb-4 text-xs text-surface-z5 uppercase tracking-wide">Changelog</h4>
				<Timeline items={changelog} />
			</div>
			<div>
				<h4 class="m-0 mb-4 text-xs text-surface-z5 uppercase tracking-wide">With custom content</h4>
				<Timeline items={steps}>
					{#snippet content(item, index)}
						<div class="mt-2 rounded bg-surface-z2 p-3 text-sm">
							<p class="m-0">Step {index + 1} details go here. This can contain any rich content.</p>
						</div>
					{/snippet}
				</Timeline>
			</div>
		</div>
	{/snippet}

	{#snippet controls()}
		<p class="text-surface-z6 text-sm">
			Timeline is a view-only component with no interactive controls.
			Items can have <code>completed</code> and <code>active</code> boolean fields.
		</p>
	{/snippet}
</PlaySection>
