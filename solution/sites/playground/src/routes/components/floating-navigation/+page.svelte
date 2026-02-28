<script lang="ts">
	import { FloatingNavigation } from '@rokkit/ui'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import Playground from '$lib/Playground.svelte'

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
		{ text: 'Introduction', value: 'intro', icon: 'i-lucide:book-open', href: '#intro' },
		{ text: 'Features', value: 'features', icon: 'i-lucide:star', href: '#features' },
		{ text: 'Components', value: 'components', icon: 'i-lucide:box', href: '#components' },
		{ text: 'Pricing', value: 'pricing', icon: 'i-lucide:credit-card', href: '#pricing' },
		{ text: 'Contact', value: 'contact', icon: 'i-lucide:mail', href: '#contact' }
	]

	function handleSelect(value: unknown) {
		activeValue = String(value)
	}
</script>

<Playground
	title="FloatingNavigation"
	description="Floating, collapsible page navigation widget that anchors to a screen edge. Hover to expand, click to navigate."
>
	{#snippet preview()}
		<div class="relative w-full h-[500px] overflow-auto rounded-lg" style="scroll-behavior: smooth;">
			<FloatingNavigation
				items={navItems}
				bind:value={activeValue}
				position={props.position as any}
				size={props.size as any}
				pinned={props.pinned}
				observe={props.observe}
				onselect={handleSelect}
			/>

			<div class="p-8 space-y-96">
				<section id="intro" class="p-6 rounded-lg border border-surface-z3">
					<h2 class="text-xl font-bold mb-2">Introduction</h2>
					<p class="text-surface-z7">Welcome to the FloatingNavigation demo. Hover over the nav widget on the right edge to expand it.</p>
				</section>

				<section id="features" class="p-6 rounded-lg border border-surface-z3">
					<h2 class="text-xl font-bold mb-2">Features</h2>
					<p class="text-surface-z7">Pin to keep expanded, hover expand/collapse, active section tracking, keyboard navigation.</p>
				</section>

				<section id="components" class="p-6 rounded-lg border border-surface-z3">
					<h2 class="text-xl font-bold mb-2">Components</h2>
					<p class="text-surface-z7">A rich library of data-driven components with snippet customization.</p>
				</section>

				<section id="pricing" class="p-6 rounded-lg border border-surface-z3">
					<h2 class="text-xl font-bold mb-2">Pricing</h2>
					<p class="text-surface-z7">Open source and free forever.</p>
				</section>

				<section id="contact" class="p-6 rounded-lg border border-surface-z3">
					<h2 class="text-xl font-bold mb-2">Contact</h2>
					<p class="text-surface-z7">Get in touch with the team.</p>
				</section>
			</div>
		</div>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
		<InfoField label="Active section" value={activeValue || '—'} />
	{/snippet}
</Playground>
