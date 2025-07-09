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

<section
	class="bg-gradient-to-lb mx-10 mb-10 rounded-lg from-neutral-200 to-neutral-50 p-8 dark:from-neutral-800 dark:to-neutral-950"
>
	<h2 class="mb-8 font-serif text-xl font-bold md:text-3xl">Why Rokkit?</h2>
	<div
		class="grid w-full grid-cols-1
			gap-8 sm:grid-cols-2
			md:gap-16
			lg:grid-cols-3"
	>
		{#each features as feature, index (index)}
			<Card
				class="flex flex-col items-center rounded-xl"
				value={feature}
				fields={{ title: 'title', description: 'description' }}
			>
				{#snippet child(proxy)}
					<span class="text-primary-500 dark:text-primary-400 mb-4 text-4xl">
						<i class={proxy.get('icon')}></i>
					</span>
					<h3 class="text-md mb-2 font-semibold">{proxy.get('title')}</h3>
					<p class="text-justify text-base text-sm text-neutral-600 dark:text-neutral-300">
						{proxy.get('description')}
					</p>
				{/snippet}
			</Card>
		{/each}
	</div>
</section>
