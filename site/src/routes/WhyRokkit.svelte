<script>
	import { Card } from '@rokkit/ui'

	const features = [
		{
			icon: 'i-solar:database-bold-duotone',
			title: 'Data-First Design',
			description:
				'Rokkit components adapt to your data structure, eliminating boilerplate and enabling rapid prototyping. No need to transform your data to fit the UI.'
		},
		{
			icon: 'i-solar:layers-bold-duotone',
			title: 'Composable & Extensible',
			description:
				'Every component is designed for extension and composition. Customize rendering, override behaviors, and integrate with your design system—without forking.'
		},
		{
			icon: 'i-solar:code-square-bold-duotone',
			title: 'Consistent & Predictable APIs',
			description:
				'All controls follow a unified pattern for props and events, making it easy to learn, use, and swap components as your needs evolve.'
		},
		{
			icon: 'i-solar:palette-bold-duotone',
			title: 'Responsive & Themeable',
			description:
				'Built-in support for dark mode, semantic color palettes, and responsive layouts. Rokkit uses UnoCSS utility classes for consistent, modern styling.'
		},
		{
			icon: 'i-solar:eye-bold-duotone',
			title: 'Accessible by Default',
			description:
				'Accessibility is built in: ARIA attributes, keyboard navigation, and screen reader support are included out of the box.'
		},
		{
			icon: 'i-solar:rocket-bold-duotone',
			title: 'Progressive Enhancement',
			description:
				'Start simple and add complexity as needed. Rokkit supports everything from basic lists to advanced, data-driven UIs with custom snippets.'
		}
	]
</script>

<section class="rounded-lg p-8">
	<h2 class="mb-8 font-serif text-xl font-bold md:text-3xl">Why Rokkit?</h2>
	<div class="grid w-full grid-cols-1 gap-8 sm:grid-cols-2 md:gap-10 lg:grid-cols-3">
		{#each features as feature, index (index)}
			<Card class="bg-surface-z1 flex flex-col items-center gap-2 rounded-xl px-4 py-4">
				<span class="{feature.icon} text-primary-z7 text-4xl" aria-hidden="true"></span>
				<h3 class="text-md text-surface-z7 leading-loose font-semibold">{feature.title}</h3>
				<p class="text-surface-z6 text-justify text-sm">{feature.description}</p>
			</Card>
		{/each}
	</div>
</section>
