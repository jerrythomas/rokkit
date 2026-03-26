<script>
	// @ts-nocheck
	import { Reveal } from '@rokkit/ui'
	import { FormRenderer } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	let props = $state({
		direction: 'up',
		distance: '1.5rem',
		duration: 600,
		delay: 0,
		stagger: 0,
		once: true,
		threshold: 0.1
	})

	const schema = {
		type: 'object',
		properties: {
			direction: { type: 'string', options: ['up', 'down', 'left', 'right', 'none'] },
			distance: { type: 'string' },
			duration: { type: 'number' },
			delay: { type: 'number' },
			stagger: { type: 'number' },
			once: { type: 'boolean' },
			threshold: { type: 'number', min: 0, max: 1 }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{ scope: '#/direction', label: 'Direction' },
			{ scope: '#/distance', label: 'Distance' },
			{ scope: '#/duration', label: 'Duration (ms)' },
			{ scope: '#/delay', label: 'Delay (ms)' },
			{ scope: '#/stagger', label: 'Stagger (ms)' },
			{ scope: '#/once', label: 'Once' },
			{ scope: '#/threshold', label: 'Threshold' }
		]
	}

	let key = $state(0)

	function replay() {
		key++
	}
</script>

<PlaySection>
	{#snippet preview()}
		<div class="flex flex-col items-center gap-8 p-8">
			<button class="bg-primary-z3 text-on-primary rounded px-4 py-2 text-sm" onclick={replay}>
				Replay Animation
			</button>

			{#key key}
				<Reveal
					direction={props.direction}
					distance={props.distance}
					duration={props.duration}
					delay={props.delay}
					once={props.once}
					threshold={props.threshold}
				>
					<div
						class="bg-surface-z2 flex h-32 w-64 items-center justify-center rounded-xl shadow-lg"
					>
						<span class="text-lg font-semibold">Single Reveal</span>
					</div>
				</Reveal>

				<div class="flex gap-4">
					<Reveal
						direction={props.direction}
						distance={props.distance}
						duration={props.duration}
						stagger={props.stagger || 100}
						once={props.once}
						threshold={props.threshold}
					>
						{#each ['Card 1', 'Card 2', 'Card 3', 'Card 4'] as label (label)}
							<div
								class="bg-primary-z3 text-on-primary flex h-24 w-36 items-center justify-center rounded-xl shadow-lg"
							>
								<span class="font-medium">{label}</span>
							</div>
						{/each}
					</Reveal>
				</div>
			{/key}
		</div>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
	{/snippet}
</PlaySection>
