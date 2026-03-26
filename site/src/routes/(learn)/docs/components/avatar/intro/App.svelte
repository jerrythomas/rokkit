<script>
	import { Avatar } from '@rokkit/ui'
</script>

<div class="flex items-center gap-4">
	<!-- Initials fallback from name -->
	<Avatar name="Alice Brown" />
	<Avatar name="Bob Chen" />
	<Avatar initials="JD" />

	<!-- Square shape -->
	<Avatar name="Team Alpha" shape="square" />
</div>
