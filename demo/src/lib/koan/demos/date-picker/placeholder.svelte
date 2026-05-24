<script lang="ts">
	import { FormRenderer } from '@rokkit/forms'

	let data = $state({
		eventDate: '2026-06-15',
		startsAt: '2026-06-15T14:30'
	})

	const schema = {
		type: 'object',
		properties: {
			eventDate: { type: 'string', format: 'date', required: true },
			startsAt: { type: 'string', format: 'date-time', required: true }
		}
	}
</script>

<FormRenderer bind:data {schema} />
