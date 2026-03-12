<script>
	// @ts-nocheck
	import { FloatingNavigation } from '@rokkit/ui'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	let activeValue = $state('intro')

	let props = $state({
		position: 'right',
		size: 'md',
		pinned: false,
		observe: false
	})

	const schema = {
		type: 'object',
		properties: {
			position: { type: 'string' },
			size: { type: 'string' },
			pinned: { type: 'boolean' },
			observe: { type: 'boolean' }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{
				scope: '#/position',
				label: 'Position',
				props: { options: ['left', 'right', 'top', 'bottom'] }
			},
			{ scope: '#/size', label: 'Size', props: { options: ['sm', 'md', 'lg'] } },
			{ scope: '#/pinned', label: 'Pinned' },
			{ scope: '#/observe', label: 'Observe Sections' },
			{ type: 'separator' }
		]
	}

	const navItems = [
		{ label: 'Introduction', value: 'intro', icon: 'i-lucide:book-open', href: '#intro' },
		{ label: 'Features', value: 'features', icon: 'i-lucide:star', href: '#features' },
		{ label: 'Components', value: 'components', icon: 'i-lucide:box', href: '#components' },
		{ label: 'Pricing', value: 'pricing', icon: 'i-lucide:credit-card', href: '#pricing' },
		{ label: 'Contact', value: 'contact', icon: 'i-lucide:mail', href: '#contact' }
	]

	function handleSelect(value) {
		activeValue = String(value)
	}
</script>

<PlaySection>
	{#snippet preview()}
		<div
			class="relative h-[500px] w-full overflow-auto rounded-lg"
			style="scroll-behavior: smooth;"
		>
			<FloatingNavigation
				items={navItems}
				bind:value={activeValue}
				position={props.position}
				size={props.size}
				pinned={props.pinned}
				observe={props.observe}
				onselect={handleSelect}
			/>

			<div class="space-y-96 p-8">
				<section id="intro" class="border-surface-z3 rounded-lg border p-6">
					<h2 class="mb-2 text-xl font-bold">Introduction</h2>
					<p class="text-surface-z7">
						Welcome to the FloatingNavigation demo. Hover over the nav widget on the right edge to
						expand it.
					</p>
				</section>

				<section id="features" class="border-surface-z3 rounded-lg border p-6">
					<h2 class="mb-2 text-xl font-bold">Features</h2>
					<p class="text-surface-z7">
						Pin to keep expanded, hover expand/collapse, active section tracking, keyboard
						navigation.
					</p>
				</section>

				<section id="components" class="border-surface-z3 rounded-lg border p-6">
					<h2 class="mb-2 text-xl font-bold">Components</h2>
					<p class="text-surface-z7">
						A rich library of data-driven components with snippet customization.
					</p>
				</section>

				<section id="pricing" class="border-surface-z3 rounded-lg border p-6">
					<h2 class="mb-2 text-xl font-bold">Pricing</h2>
					<p class="text-surface-z7">Open source and free forever.</p>
				</section>

				<section id="contact" class="border-surface-z3 rounded-lg border p-6">
					<h2 class="mb-2 text-xl font-bold">Contact</h2>
					<p class="text-surface-z7">Get in touch with the team.</p>
				</section>
			</div>
		</div>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
		<InfoField label="Active section" value={activeValue || '—'} />
	{/snippet}
</PlaySection>
