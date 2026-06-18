<script lang="ts">
	/**
	 * StatusList — grouped summary of validation messages
	 * Groups items by severity (error, warning, info, success) with count headers.
	 * Supports click-to-focus via onclick callback.
	 */

	type Severity = 'error' | 'warning' | 'info' | 'success'

	type StatusItem = {
		state: Severity
		path: string
		text: string
	}

	type Props = {
		items?: StatusItem[]
		onclick?: (path: string) => void
		class?: string
	}

	const SEVERITY_ORDER: Severity[] = ['error', 'warning', 'info', 'success']
	const SEVERITY_LABELS: Record<Severity, string> = {
		error: 'error',
		warning: 'warning',
		info: 'info',
		success: 'success'
	}

	let { items = [], onclick = undefined, class: className = '' }: Props = $props()

	const grouped = $derived(
		SEVERITY_ORDER.map((state) => ({
			state,
			items: items.filter((item) => item.state === state)
		})).filter((group) => group.items.length > 0)
	)
</script>

{#if items.length > 0}
	<div data-status-list class={className} role="status">
		{#each grouped as group (group.state)}
			<div data-status-group data-severity={group.state}>
				<div data-status-header>
					<span data-status-count>{group.items.length}</span>
					<span
						>{group.items.length === 1
							? SEVERITY_LABELS[group.state]
							: `${SEVERITY_LABELS[group.state]}s`}</span
					>
				</div>
				{#each group.items as item (item.path)}
					{#if onclick}
						<button
							data-status-item
							data-status={item.state}
							onclick={() => onclick(item.path)}
							type="button"
						>
							{item.text}
						</button>
					{:else}
						<div data-status-item data-status={item.state}>
							{item.text}
						</div>
					{/if}
				{/each}
			</div>
		{/each}
	</div>
{/if}
