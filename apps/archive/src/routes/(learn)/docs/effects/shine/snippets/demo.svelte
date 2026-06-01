<script>
	import { Shine } from '@rokkit/ui'
</script>

<div class="flex flex-wrap items-center justify-center gap-8 p-4">
	<Shine radius={300} depth={1} surfaceScale={2}>
		<div
			class="bg-primary-z3 flex h-32 w-48 cursor-pointer items-center justify-center rounded-xl shadow-lg"
		>
			<span class="text-on-primary text-sm font-semibold">Primary surface</span>
		</div>
	</Shine>

	<Shine radius={200} depth={2} specularExponent={80} color="rgb(var(--secondary-500))">
		<div
			class="bg-secondary-z3 flex h-32 w-48 cursor-pointer items-center justify-center rounded-xl shadow-lg"
		>
			<span class="text-on-secondary text-sm font-semibold">Secondary tint</span>
		</div>
	</Shine>

	<Shine radius={400} depth={1} surfaceScale={3}>
		<div
			class="bg-surface-z2 border-surface-z3 flex h-48 w-48 cursor-pointer items-center justify-center rounded-xl border shadow-lg"
		>
			<span class="i-glyph:star text-surface-z5 text-4xl"></span>
		</div>
	</Shine>
</div>
