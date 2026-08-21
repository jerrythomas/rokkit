<script lang="ts">
	import { SearchFilter } from '@rokkit/ui'

	let { ...spread }: Record<string, unknown> = $props()

	type FilterObject = {
		column?: string
		operator: string
		value: string | number | RegExp
	}

	const rows = [
		{ name: 'Alice', role: 'engineer', age: 32, status: 'active' },
		{ name: 'Bob', role: 'designer', age: 27, status: 'active' },
		{ name: 'Carol', role: 'manager', age: 41, status: 'inactive' },
		{ name: 'Dave', role: 'engineer', age: 24, status: 'active' },
		{ name: 'Eve', role: 'analyst', age: 35, status: 'inactive' },
		{ name: 'Frank', role: 'engineer', age: 29, status: 'active' }
	]

	let filters = $state<FilterObject[]>([])

	// Operators as two lookup tables rather than one if/else chain. Numeric ops
	// only apply when BOTH sides parse as numbers; text ops compare
	// case-insensitively. `:` is an alias for `=`.
	const NUMERIC_OPS: Record<string, (a: number, b: number) => boolean> = {
		'>': (a, b) => a > b,
		'<': (a, b) => a < b,
		'>=': (a, b) => a >= b,
		'<=': (a, b) => a <= b
	}
	const TEXT_OPS: Record<string, (a: string, b: string) => boolean> = {
		'=': (a, b) => a === b,
		':': (a, b) => a === b,
		'!=': (a, b) => a !== b
	}

	/** Does one cell value satisfy the filter? */
	function targetMatches(target: string, f: FilterObject): boolean {
		if (f.value instanceof RegExp) return f.value.test(target)
		const op = String(f.operator)
		if (Object.hasOwn(NUMERIC_OPS, op)) {
			const a = Number(target)
			const b = Number(f.value)
			return !Number.isNaN(a) && !Number.isNaN(b) && NUMERIC_OPS[op](a, b)
		}
		if (Object.hasOwn(TEXT_OPS, op)) {
			return TEXT_OPS[op](target.toLowerCase(), String(f.value).toLowerCase())
		}
		return false
	}

	function matchesFilter(row: Record<string, unknown>, f: FilterObject): boolean {
		// No column named → free-text search across every cell.
		const targets = f.column ? [String(row[f.column] ?? '')] : Object.values(row).map(String)
		return targets.some((target) => targetMatches(target, f))
	}

	const visible = $derived(
		rows.filter((row) => filters.every((f) => matchesFilter(row as Record<string, unknown>, f)))
	)
</script>

<div class="grid">
	<section>
		<header>Try: <code>engineer</code> · <code>age&gt;30</code> · <code>status:active role:engineer</code></header>
		<SearchFilter
			bind:filters
			placeholder="Search people…"
			{...spread}
		/>
		<p class="hint">{filters.length} active filter{filters.length === 1 ? '' : 's'}</p>
	</section>

	<section>
		<header>Matching rows ({visible.length} of {rows.length})</header>
		<table>
			<thead>
				<tr>
					<th>Name</th>
					<th>Role</th>
					<th>Age</th>
					<th>Status</th>
				</tr>
			</thead>
			<tbody>
				{#each visible as row (row.name)}
					<tr>
						<td>{row.name}</td>
						<td>{row.role}</td>
						<td>{row.age}</td>
						<td>{row.status}</td>
					</tr>
				{/each}
				{#if visible.length === 0}
					<tr>
						<td colspan="4" class="empty">No rows match the active filters.</td>
					</tr>
				{/if}
			</tbody>
		</table>
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
	header code {
		font-family: var(--font-mono);
		text-transform: none;
		letter-spacing: 0;
		color: var(--ink);
	}
	.hint {
		margin: 0;
		font: 400 12px var(--font-ui);
		color: var(--ink-mute);
	}
	table {
		width: 100%;
		border-collapse: collapse;
		font: 400 13px var(--font-ui);
	}
	th {
		font: 500 11px var(--font-mono);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ink-soft);
		text-align: left;
		padding: 6px 8px;
		border-bottom: 1px solid var(--paper-edge);
	}
	td {
		padding: 6px 8px;
		border-bottom: 1px solid var(--paper-edge);
		color: var(--ink);
	}
	td.empty {
		color: var(--ink-soft);
		font-style: italic;
		text-align: center;
	}
</style>
