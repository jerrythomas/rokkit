<script lang="ts">
	import { Timeline } from '@rokkit/ui'

	let { ...spread }: Record<string, unknown> = $props()

	const releaseSteps = [
		{ label: 'Requirements', subtext: 'Gather project requirements.', completed: true },
		{ label: 'Design', subtext: 'Create wireframes and mockups.', completed: true },
		{ label: 'Development', subtext: 'Build the feature surface.', active: true },
		{ label: 'Testing', subtext: 'Run unit, integration, and e2e tests.' },
		{ label: 'Deployment', subtext: 'Promote to production.' }
	]

	const auditTrail = [
		{ label: 'Created', subtext: '10:42 AM · jerry', icon: 'i-mdi:plus-circle' },
		{ label: 'Reviewed', subtext: '11:15 AM · alice', icon: 'i-mdi:eye' },
		{ label: 'Approved', subtext: '11:30 AM · bob', icon: 'i-mdi:check-circle', completed: true },
		{ label: 'Merged', subtext: '11:45 AM', icon: 'i-mdi:git', active: true }
	]
</script>

<div class="grid">
	<section>
		<header>Release pipeline — completed + active</header>
		<Timeline items={releaseSteps} {...spread} />
	</section>

	<section>
		<header>Audit trail — custom icons + completed</header>
		<Timeline items={auditTrail} {...spread} />
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
