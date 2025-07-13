<script>
	import { Table } from '@rokkit/ui'
	
	const data = [
		{ name: 'John Doe', age: 25, city: 'New York' },
		{ name: 'Jane Doe', age: 22, city: 'Los Angeles' },
		{ name: 'John Smith', age: 30, city: 'Chicago' },
		{ name: 'Alice Johnson', age: 28, city: 'Boston' },
		{ name: 'Bob Wilson', age: 35, city: 'Seattle' }
	]
</script>

<Table {data} caption="Employee Directory" />