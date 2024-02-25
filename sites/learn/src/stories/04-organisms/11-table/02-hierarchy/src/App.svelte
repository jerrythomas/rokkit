<script>
	import { TreeTable } from '@rokkit/ui'
	import { data } from './data.js'

	let columns = [{ key: 'scope' }, { key: 'level' }, { key: 'name' }, { key: 'unitsSold' }]
</script>

<TreeTable {data} {columns} />
