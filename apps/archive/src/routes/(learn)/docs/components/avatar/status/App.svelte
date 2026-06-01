<script>
	import { Avatar } from '@rokkit/ui'
</script>

<div class="flex items-center gap-6">
	<div class="flex flex-col items-center gap-2">
		<Avatar name="Online User" status="online" />
		<span class="text-surface-z6 text-xs">online</span>
	</div>
	<div class="flex flex-col items-center gap-2">
		<Avatar name="Away User" status="away" />
		<span class="text-surface-z6 text-xs">away</span>
	</div>
	<div class="flex flex-col items-center gap-2">
		<Avatar name="Busy User" status="busy" />
		<span class="text-surface-z6 text-xs">busy</span>
	</div>
	<div class="flex flex-col items-center gap-2">
		<Avatar name="Offline User" status="offline" />
		<span class="text-surface-z6 text-xs">offline</span>
	</div>
</div>
