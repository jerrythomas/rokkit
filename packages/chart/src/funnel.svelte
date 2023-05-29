<!-- <script context="module">
	/**
	 * @type {import('@sveltejs/kit').Load}
	 */
	export async function load({ page, fetch, session, stuff }) {
		const url = '/api/data/funnel'
		const response = await fetch(url)

		if (response.ok) {
			let result = await response.json()

			return {
				props: { data: result }
			}
		}

		return {
			status: response.status,
			error: new Error(`Could not load ${url}`)
		}
	}
</script> -->

<script>
	import { FunnelPlot, Chart } from '@rokkit/chart'
	export let data

	// let names = ['one', 'two', 'three'] // each one is a separate segment. max of Combined value at each stage is overall height/width
	// let groups = ['a', 'b', 'c'] // each group should have a value. individual values are used for each band height
</script>

<h1>Funnel</h1>
<Chart {data} width={1200}>
	<FunnelPlot x="stage" y="count" fill="client" stat="sum" />
</Chart>
