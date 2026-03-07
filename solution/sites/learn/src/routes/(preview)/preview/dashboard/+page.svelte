<script>
	// @ts-nocheck
	import { List, Button, Toolbar } from '@rokkit/ui'

	const kpis = [
		{ label: 'Active Projects', value: '12', change: '+2 this week', icon: 'i-solar:folder-open-bold-duotone' },
		{ label: 'Open Tasks', value: '84', change: '-6 today', icon: 'i-solar:checklist-minimalistic-bold-duotone' },
		{ label: 'Team Members', value: '9', change: '2 on leave', icon: 'i-solar:users-group-two-rounded-bold-duotone' },
		{ label: 'Completed', value: '63%', change: '+4% vs last sprint', icon: 'i-solar:chart-2-bold-duotone' }
	]

	const recentActivity = [
		{ label: 'Alice merged PR #42 — Auth module', icon: 'i-solar:git-merge-bold-duotone', subtext: '10m ago' },
		{ label: 'Bob created task: API rate limiting', icon: 'i-solar:add-circle-bold-duotone', subtext: '1h ago' },
		{ label: 'Sprint 14 planning completed', icon: 'i-solar:calendar-bold-duotone', subtext: '2h ago' },
		{ label: 'Carol closed 3 bugs in payments', icon: 'i-solar:bug-bold-duotone', subtext: '3h ago' },
		{ label: 'New milestone: v2.0 scope locked', icon: 'i-solar:flag-bold-duotone', subtext: 'Yesterday' }
	]

	const activityFields = { label: 'label', icon: 'icon', subtext: 'subtext', value: 'label' }
</script>

<div class="p-6 flex flex-col gap-6">
	<div class="flex items-center justify-between flex-wrap gap-3">
		<div>
			<h1 class="text-2xl font-bold text-surface-z8">Dashboard</h1>
			<p class="text-sm text-surface-z5">Good morning — here's what's happening today.</p>
		</div>
		<Toolbar>
			<Button label="New Task" icon="i-solar:add-circle-bold-duotone" variant="primary" />
		</Toolbar>
	</div>

	<!-- KPI Cards -->
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
		{#each kpis as kpi}
			<div data-card class="p-4">
				<div class="flex items-start justify-between mb-3">
					<p class="text-sm text-surface-z5">{kpi.label}</p>
					<span class="{kpi.icon} text-xl text-primary-z6" aria-hidden="true"></span>
				</div>
				<p class="text-3xl font-bold text-surface-z8">{kpi.value}</p>
				<p class="text-xs text-surface-z4 mt-1">{kpi.change}</p>
			</div>
		{/each}
	</div>

	<!-- Content grid -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<div data-card class="p-4">
			<h2 class="text-sm font-semibold text-surface-z7 mb-3">Recent Activity</h2>
			<List items={recentActivity} fields={activityFields} />
		</div>

		<div data-card class="p-4 flex flex-col items-center justify-center gap-2 text-center min-h-40">
			<span class="i-solar:chart-bold-duotone text-3xl text-surface-z3" aria-hidden="true"></span>
			<p class="text-sm text-surface-z5">Sprint velocity chart</p>
			<p class="text-xs text-surface-z4">Charts coming soon</p>
		</div>
	</div>
</div>
