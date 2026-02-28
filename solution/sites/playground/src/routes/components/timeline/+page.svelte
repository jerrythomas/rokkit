<script lang="ts">
	import { Timeline } from '@rokkit/ui'
	import Playground from '$lib/Playground.svelte'

	const steps = [
		{ text: 'Requirements', description: 'Gather project requirements and define scope.', completed: true },
		{ text: 'Design', description: 'Create wireframes and design mockups.', completed: true },
		{ text: 'Development', description: 'Build the application features.', active: true },
		{ text: 'Testing', description: 'Run unit tests, integration tests, and QA.' },
		{ text: 'Deployment', description: 'Deploy to production and monitor.' }
	]

	const changelog = [
		{ text: 'v2.0.0', description: 'Major release with new component library.' },
		{ text: 'v1.5.0', description: 'Added dark mode support and accessibility improvements.' },
		{ text: 'v1.2.0', description: 'Performance optimizations and bug fixes.' },
		{ text: 'v1.0.0', description: 'Initial public release.' }
	]
</script>

<Playground
	title="Timeline"
	description="View-only vertical steps for instructions, changelogs, or process visualization."
>
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
</Playground>
