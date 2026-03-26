<script>
	import { Badge, Button } from '@rokkit/ui'
</script>

<div class="flex items-center gap-8">
	<Badge count={3} variant="error">
		<Button>Messages</Button>
	</Badge>

	<Badge count={12} variant="primary">
		<Button>Notifications</Button>
	</Badge>

	<Badge dot variant="success">
		<Button>Online</Button>
	</Badge>
</div>
