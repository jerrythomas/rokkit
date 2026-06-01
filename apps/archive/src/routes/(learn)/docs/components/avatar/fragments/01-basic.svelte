<script>
	import { Avatar } from '@rokkit/ui'
</script>

<!-- Initials auto-derived from name -->
<Avatar name="Alice Brown" />

<!-- Explicit initials -->
<Avatar initials="JD" />

<!-- Image with fallback -->
<Avatar src="/user.jpg" name="Bob Smith" />

<!-- With status indicator -->
<Avatar name="Online User" status="online" />

<!-- Size and shape variants -->
<Avatar name="Large Square" size="lg" shape="square" />
