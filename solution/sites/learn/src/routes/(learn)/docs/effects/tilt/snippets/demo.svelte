<script>
	import { Tilt } from '@rokkit/ui'
</script>

<div class="flex flex-wrap gap-8 items-center justify-center px-4 py-8">
	<Tilt>
		<div class="w-48 h-32 rounded-xl bg-surface-z3 flex items-center justify-center shadow-lg cursor-pointer">
			<span class="text-lg text-on-surface">Default</span>
		</div>
	</Tilt>

	<Tilt maxRotation={20} >
		<div class="w-48 h-32 rounded-xl bg-primary-z4 border border-surface-z3 flex items-center justify-center shadow-lg cursor-pointer">
			<span class="text-lg text-on-primary">Rotation</span>
		</div>
	</Tilt>

	<Tilt setBrightness={true}>
		<div class="w-48 h-32 rounded-xl bg-secondary-z3 flex items-center justify-center shadow-lg cursor-pointer">
			<span class="i-lucide:image text-on-secondary">Brightness</span>
		</div>
	</Tilt>

	<Tilt perspective={100}>
		<div class="w-48 h-32 rounded-xl bg-accent-z3 flex items-center justify-center shadow-lg cursor-pointer">
			<span class="i-lucide:image text-on-secondary">Perspective</span>
		</div>
	</Tilt>

	<Tilt perspective={200} setBrightness={true} maxRotation={20}>
		<div class="w-48 h-32 rounded-xl bg-success-z3 flex items-center justify-center shadow-lg cursor-pointer">
			<span class="i-lucide:image text-on-secondary">Combination</span>
		</div>
	</Tilt>
</div>
