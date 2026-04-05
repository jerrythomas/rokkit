<script>
	// @ts-nocheck

	const notifications = [
		{ id: 1, type: 'alert',   title: 'Revenue target exceeded',      body: 'North America hit $2.1M — 105% of quarterly target.', time: '2 min ago',  read: false },
		{ id: 2, type: 'info',    title: 'New order spike detected',      body: 'Asia Pacific orders up 34% in the last hour.',          time: '15 min ago', read: false },
		{ id: 3, type: 'warning', title: 'Low margin on Analytics deals', body: 'Average margin dropped to 18% — below the 20% floor.',  time: '1 hr ago',  read: false },
		{ id: 4, type: 'success', title: 'Q1 report exported',            body: 'Full crossfilter export sent to finance@acme.com.',      time: '3 hrs ago',  read: true  },
		{ id: 5, type: 'info',    title: 'New user joined workspace',      body: 'sarah.chen@acme.com accepted the invite.',              time: '5 hrs ago',  read: true  },
		{ id: 6, type: 'alert',   title: 'Cancelled order threshold',     body: '8% cancellation rate — review Latin America pipeline.',  time: '1 day ago',  read: true  },
		{ id: 7, type: 'success', title: 'Integration sync complete',      body: 'Salesforce CRM sync — 240 records updated.',            time: '1 day ago',  read: true  },
		{ id: 8, type: 'warning', title: 'Slow query detected',           body: 'Crossfilter query p95 > 800ms — check indexing.',        time: '2 days ago', read: true  }
	]

	const typeIcon = {
		alert:   'i-glyph:bell text-primary-z6',
		info:    'i-glyph:info text-sky-500',
		warning: 'i-glyph:warning text-amber-500',
		success: 'i-glyph:check-circle text-emerald-500'
	}

	let items = $state(notifications)

	function markRead(id) {
		items = items.map((n) => n.id === id ? { ...n, read: true } : n)
	}

	function markAllRead() {
		items = items.map((n) => ({ ...n, read: true }))
	}

	const unreadCount = $derived(items.filter((n) => !n.read).length)
</script>

<div class="px-6 py-6 lg:px-8">
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="text-surface-z8 text-xl font-bold">Notifications</h1>
			<p class="text-surface-z5 mt-1 text-sm">
				{#if unreadCount > 0}
					{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
				{:else}
					All caught up
				{/if}
			</p>
		</div>
		{#if unreadCount > 0}
			<button
				onclick={markAllRead}
				class="text-surface-z5 hover:text-surface-z8 rounded px-3 py-1.5 text-xs transition-colors border border-surface-z3 hover:border-surface-z4"
			>
				Mark all read
			</button>
		{/if}
	</div>

	<div class="flex flex-col gap-2">
		{#each items as n (n.id)}
			<button
				type="button"
				onclick={() => markRead(n.id)}
				class="border-surface-z2 bg-surface-z1 flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all hover:bg-surface-z2"
				class:opacity-50={n.read}
			>
				<span class="mt-0.5 text-lg {typeIcon[n.type]}"></span>
				<div class="min-w-0 flex-1">
					<div class="flex items-center gap-2">
						<span class="text-surface-z8 text-sm font-semibold">{n.title}</span>
						{#if !n.read}
							<span class="bg-primary-z5 h-1.5 w-1.5 rounded-full"></span>
						{/if}
					</div>
					<p class="text-surface-z5 mt-0.5 text-xs">{n.body}</p>
				</div>
				<span class="text-surface-z4 flex-shrink-0 text-xs">{n.time}</span>
			</button>
		{/each}
	</div>
</div>
