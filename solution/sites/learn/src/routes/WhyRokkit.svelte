<script>
	import { Card } from '@rokkit/ui'

	const features = [
		{
			icon: 'i-heroicons-cube-transparent',
			title: 'Data-First Design',
			description:
				'Rokkit components adapt to your data structure, eliminating boilerplate and enabling rapid prototyping. No need to transform your data to fit the UI.'
		},
		{
			icon: 'i-heroicons-puzzle-piece',
			title: 'Composable & Extensible',
			description:
				'Every component is designed for extension and composition. Customize rendering, override behaviors, and integrate with your design system—without forking.'
		},
		{
			icon: 'i-heroicons-sparkles',
			title: 'Consistent & Predictable APIs',
			description:
				'All controls follow a unified pattern for props and events, making it easy to learn, use, and swap components as your needs evolve.'
		},
		{
			icon: 'i-heroicons-device-phone-mobile',
			title: 'Responsive & Themeable',
			description:
				'Built-in support for dark mode, semantic color palettes, and responsive layouts. Rokkit uses UnoCSS utility classes for consistent, modern styling.'
		},
		{
			icon: 'i-heroicons-shield-check',
			title: 'Accessible by Default',
			description:
				'Accessibility is built in: ARIA attributes, keyboard navigation, and screen reader support are included out of the box.'
		},
		{
			icon: 'i-heroicons-rocket-launch',
			title: 'Progressive Enhancement',
			description:
				'Start simple and add complexity as needed. Rokkit supports everything from basic lists to advanced, data-driven UIs with custom snippets.'
		}
	]
</script>

<section class="rounded-lg p-8">
	<h2 class="mb-8 font-serif text-xl font-bold md:text-3xl">Why Rokkit?</h2>
	<div
		class="grid w-full grid-cols-1
			gap-8 sm:grid-cols-2
			md:gap-10
			lg:grid-cols-3"
	>
		{#each features as feature, index (index)}
			<Card
				class="bg-surface-z3 flex flex-col items-center gap-2 rounded-xl px-8 py-4"
				value={feature}
				fields={{ title: 'title', description: 'description' }}
			>
				{#snippet child(proxy)}
					<span class="text-primary-500 dark:text-primary-400text-4xl">
						<i class={proxy.get('icon')}></i>
					</span>
					<h3 class="text-md font-semibold leading-loose">{proxy.get('title')}</h3>
					<p class="text-surface-600 dark:text-surface-300 text-z2 text-justify text-sm">
						{proxy.get('description')}
					</p>
				{/snippet}
			</Card>
		{/each}
	</div>
</section>
