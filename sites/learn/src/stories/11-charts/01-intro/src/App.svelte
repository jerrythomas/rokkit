<script>
	import { Plot } from '@rokkit/chart'
	import { data } from './cars.js'

	const labels = {
		x: 'Economy',
		y: 'Horsepower'
	}
</script>

<Plot {data} x="mpg" y="hp" stroke="mpg" symbol="mpg" legend {labels} />
