<script>
	import { Tilt } from '@rokkit/ui'
</script>

<div class="flex flex-wrap items-center justify-center gap-8 px-4 py-8">
	<Tilt>
		<div
			class="bg-surface-z3 flex h-32 w-48 cursor-pointer items-center justify-center rounded-xl shadow-lg"
		>
			<span class="text-on-surface text-lg">Default</span>
		</div>
	</Tilt>

	<Tilt maxRotation={20}>
		<div
			class="bg-primary-z4 border-surface-z3 flex h-32 w-48 cursor-pointer items-center justify-center rounded-xl border shadow-lg"
		>
			<span class="text-on-primary text-lg">Rotation</span>
		</div>
	</Tilt>

	<Tilt setBrightness={true}>
		<div
			class="bg-secondary-z3 flex h-32 w-48 cursor-pointer items-center justify-center rounded-xl shadow-lg"
		>
			<span class="i-glyph:gallery text-on-secondary">Brightness</span>
		</div>
	</Tilt>

	<Tilt perspective={100}>
		<div
			class="bg-accent-z3 flex h-32 w-48 cursor-pointer items-center justify-center rounded-xl shadow-lg"
		>
			<span class="i-glyph:gallery text-on-secondary">Perspective</span>
		</div>
	</Tilt>

	<Tilt perspective={200} setBrightness={true} maxRotation={20}>
		<div
			class="bg-success-z3 flex h-32 w-48 cursor-pointer items-center justify-center rounded-xl shadow-lg"
		>
			<span class="i-glyph:gallery text-on-secondary">Combination</span>
		</div>
	</Tilt>
</div>
