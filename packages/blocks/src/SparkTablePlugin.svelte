<script lang="ts">
	import { Spark, GeomLine, GeomTrend } from '@rokkit/chart'

	/**
	 * Renders a `spark-table` fence as a real HTML table whose trend column
	 * composes `<Spark>` + geoms directly — the scenario the Spark design
	 * targets (docs/design/20-chart.md's Spark section): many small inline
	 * charts inside a data table, each one a real composed geom tree, not a
	 * spec object interpreted generically (PlotPlugin's job). The fixed
	 * Line + Trend composition mirrors the guide's prose example so a reader
	 * can match the live output to the literal markup shown beside it.
	 */
	interface Props {
		/** Raw fence body — JSON describing the table's rows. */
		code: string
	}

	const { code }: Props = $props()

	type TrendMethod = string | number | { type: string; [k: string]: unknown }
	type SeriesRow = { label: string; data: number[] }
	type SparkTableSpec = {
		title?: string
		trend?: TrendMethod
		rows: SeriesRow[]
	}

	function validateShape(parsed: unknown): parsed is SparkTableSpec {
		const p = parsed as SparkTableSpec
		return (
			Array.isArray(p?.rows) &&
			p.rows.every((r) => typeof r?.label === 'string' && Array.isArray(r?.data))
		)
	}

	function parseSpec(
		raw: string
	): { spec: SparkTableSpec; error: null } | { spec: null; error: string } {
		try {
			const parsed: unknown = JSON.parse(raw)
			if (!validateShape(parsed))
				throw new Error('Expected { rows: [{ label: string, data: number[] }] }')
			return { spec: parsed, error: null }
		} catch (e) {
			return { spec: null, error: e instanceof Error ? e.message : 'Invalid JSON' }
		}
	}

	const result = $derived(parseSpec(code))

	// Each row's raw number[] becomes indexed {i, v} rows — the same channel-keyed
	// adapter Sparkline.svelte uses to hand a plain array to the shared geom pipeline.
	function seriesRows(data: number[]) {
		return data.map((v, i) => ({ i, v }))
	}
</script>

{#if result.error}
	<div data-block-error class="block-error">
		<span>Spark table error: {result.error}</span>
		<details>
			<summary>Raw</summary>
			<pre>{code}</pre>
		</details>
	</div>
{:else}
	{@const { title, rows, trend } = result.spec!}
	<div data-spark-table-plugin>
		{#if title}<p data-spark-table-title>{title}</p>{/if}
		<table>
			<thead>
				<tr>
					<th>Label</th>
					<th>Latest</th>
					<th>Trend</th>
				</tr>
			</thead>
			<tbody>
				{#each rows as row (row.label)}
					<tr>
						<td>{row.label}</td>
						<td>{row.data[row.data.length - 1]}</td>
						<td>
							<Spark data={seriesRows(row.data)} x="i" y="v" width={80} height={24}>
								<GeomLine x="i" y="v" />
								<GeomTrend x="i" y="v" {trend} />
							</Spark>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

<style>
	[data-spark-table-plugin] table {
		width: auto;
		border-collapse: collapse;
	}
	[data-spark-table-plugin] th,
	[data-spark-table-plugin] td {
		padding: 6px 12px;
		text-align: left;
		border-bottom: 1px solid var(--paper-edge);
		font: 400 13px var(--font-ui, inherit);
	}
	[data-spark-table-plugin] td:last-child {
		line-height: 0;
	}
</style>
