<script>
	import { Badge } from '@rokkit/ui'
</script>

<div class="flex flex-wrap items-center gap-6">
	<Badge count={5} />
	<Badge count={5} variant="primary" />
	<Badge count={5} variant="success" />
	<Badge count={5} variant="warning" />
	<Badge count={5} variant="error" />
	<Badge count={150} max={99} variant="error" />
</div>
