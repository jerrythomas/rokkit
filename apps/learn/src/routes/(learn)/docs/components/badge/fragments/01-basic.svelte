<script>
	import { Badge } from '@rokkit/ui'
</script>

<!-- Standalone count badge -->
<Badge count={5} />
<Badge count={5} variant="error" />

<!-- Count overflow -->
<Badge count={150} max={99} variant="error" />

<!-- Dot indicator -->
<Badge dot variant="success" />

<!-- Wrapping a child element -->
<Badge count={3} variant="error">
	<Button>Messages</Button>
</Badge>
