<script>
	import { Tilt } from '@rokkit/ui'
</script>

<div class="flex flex-wrap gap-8 items-center justify-center p-4">
	<Tilt maxRotation={10} perspective={600}>
		<div class="w-48 h-32 rounded-xl bg-primary-z3 flex items-center justify-center shadow-lg cursor-pointer">
			<span class="text-sm font-semibold text-on-primary">Standard (10°)</span>
		</div>
	</Tilt>

	<Tilt maxRotation={20} perspective={400} setBrightness={true}>
		<div class="w-48 h-32 rounded-xl bg-surface-z2 border border-surface-z3 flex items-center justify-center shadow-lg cursor-pointer">
			<span class="text-sm font-semibold text-surface-z7">Strong + brightness</span>
		</div>
	</Tilt>

	<Tilt maxRotation={5} perspective={800}>
		<div class="w-48 h-48 rounded-xl bg-secondary-z3 flex items-center justify-center shadow-lg cursor-pointer">
			<span class="i-lucide:image text-4xl text-on-secondary"></span>
		</div>
	</Tilt>
</div>
