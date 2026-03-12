<script>
	/**
	 * ValidationReport — grouped summary of validation messages
	 * Groups items by severity (error, warning, info, success) with count headers.
	 * Supports click-to-focus via onclick callback.
	 */

	const SEVERITY_ORDER = ['error', 'warning', 'info', 'success']
	const SEVERITY_LABELS = { error: 'error', warning: 'warning', info: 'info', success: 'success' }

	let { items = [], onclick = undefined, class: className = '' } = $props()

	const grouped = $derived(
		SEVERITY_ORDER.map((state) => ({
			state,
			items: items.filter((item) => item.state === state)
		})).filter((group) => group.items.length > 0)
	)
</script>

{#if items.length > 0}
	<div data-validation-report class={className} role="status">
		{#each grouped as group (group.state)}
			<div data-validation-group data-severity={group.state}>
				<div data-validation-group-header>
					<span data-validation-count>{group.items.length}</span>
					<span
						>{group.items.length === 1
							? SEVERITY_LABELS[group.state]
							: `${SEVERITY_LABELS[group.state]}s`}</span
					>
				</div>
				{#each group.items as item (item.path)}
					{#if onclick}
						<button
							data-validation-item
							data-status={item.state}
							onclick={() => onclick(item.path)}
							type="button"
						>
							{item.text}
						</button>
					{:else}
						<div data-validation-item data-status={item.state}>
							{item.text}
						</div>
					{/if}
				{/each}
			</div>
		{/each}
	</div>
{/if}
