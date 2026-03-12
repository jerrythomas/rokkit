<script>
	// @ts-nocheck
	import { List, Button, Toolbar } from '@rokkit/ui'

	const kpis = [
		{
			label: 'Active Projects',
			value: '12',
			change: '+2 this week',
			icon: 'i-solar:folder-open-bold-duotone'
		},
		{
			label: 'Open Tasks',
			value: '84',
			change: '-6 today',
			icon: 'i-solar:checklist-minimalistic-bold-duotone'
		},
		{
			label: 'Team Members',
			value: '9',
			change: '2 on leave',
			icon: 'i-solar:users-group-two-rounded-bold-duotone'
		},
		{
			label: 'Completed',
			value: '63%',
			change: '+4% vs last sprint',
			icon: 'i-solar:chart-2-bold-duotone'
		}
	]

	const recentActivity = [
		{
			label: 'Alice merged PR #42 — Auth module',
			icon: 'i-solar:git-merge-bold-duotone',
			sublabel: '10m ago'
		},
		{
			label: 'Bob created task: API rate limiting',
			icon: 'i-solar:add-circle-bold-duotone',
			sublabel: '1h ago'
		},
		{
			label: 'Sprint 14 planning completed',
			icon: 'i-solar:calendar-bold-duotone',
			sublabel: '2h ago'
		},
		{
			label: 'Carol closed 3 bugs in payments',
			icon: 'i-solar:bug-bold-duotone',
			sublabel: '3h ago'
		},
		{
			label: 'New milestone: v2.0 scope locked',
			icon: 'i-solar:flag-bold-duotone',
			sublabel: 'Yesterday'
		}
	]

	const activityFields = { label: 'label', icon: 'icon', sublabel: 'subtext', value: 'label' }
</script>

<div class="flex flex-col gap-6 p-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h1 class="text-surface-z8 text-2xl font-bold">Dashboard</h1>
			<p class="text-surface-z5 text-sm">Good morning — here's what's happening today.</p>
		</div>
		<Toolbar>
			<Button label="New Task" icon="i-solar:add-circle-bold-duotone" variant="primary" />
		</Toolbar>
	</div>

	<!-- KPI Cards -->
	<div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
		{#each kpis as kpi}
			<div data-card class="p-4">
				<div class="mb-3 flex items-start justify-between">
					<p class="text-surface-z5 text-sm">{kpi.label}</p>
					<span class="{kpi.icon} text-primary-z6 text-xl" aria-hidden="true"></span>
				</div>
				<p class="text-surface-z8 text-3xl font-bold">{kpi.value}</p>
				<p class="text-surface-z4 mt-1 text-xs">{kpi.change}</p>
			</div>
		{/each}
	</div>

	<!-- Content grid -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<div data-card class="p-4">
			<h2 class="text-surface-z7 mb-3 text-sm font-semibold">Recent Activity</h2>
			<List items={recentActivity} fields={activityFields} />
		</div>

		<div data-card class="flex min-h-40 flex-col items-center justify-center gap-2 p-4 text-center">
			<span class="i-solar:chart-bold-duotone text-surface-z3 text-3xl" aria-hidden="true"></span>
			<p class="text-surface-z5 text-sm">Sprint velocity chart</p>
			<p class="text-surface-z4 text-xs">Charts coming soon</p>
		</div>
	</div>
</div>
