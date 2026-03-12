<script>
	import { Shine } from '@rokkit/ui'
</script>

<div class="flex flex-wrap gap-8 items-center justify-center p-4">
	<Shine radius={300} depth={1} surfaceScale={2}>
		<div class="w-48 h-32 rounded-xl bg-primary-z3 flex items-center justify-center shadow-lg cursor-pointer">
			<span class="text-sm font-semibold text-on-primary">Primary surface</span>
		</div>
	</Shine>

	<Shine radius={200} depth={2} specularExponent={80} color="rgb(var(--secondary-500))">
		<div class="w-48 h-32 rounded-xl bg-secondary-z3 flex items-center justify-center shadow-lg cursor-pointer">
			<span class="text-sm font-semibold text-on-secondary">Secondary tint</span>
		</div>
	</Shine>

	<Shine radius={400} depth={1} surfaceScale={3}>
		<div class="w-48 h-48 rounded-xl bg-surface-z2 border border-surface-z3 flex items-center justify-center shadow-lg cursor-pointer">
			<span class="i-lucide:diamond text-4xl text-surface-z5"></span>
		</div>
	</Shine>
</div>
