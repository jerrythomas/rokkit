<script>
	import FloatingNav from './FloatingNav.svelte'

	// Example navigation items
	const navigationItems = [
		{
			id: 'homepage',
			label: 'Home',
			icon: 'navigate-up',
			href: '#homepage'
		},
		{
			id: 'fast-track',
			label: 'Fast-Track AI',
			icon: 'action-search',
			href: '#fast-track'
		},
		{
			id: 'accelerated-innovation',
			label: 'Accelerated Innovation',
			icon: 'navigate-right',
			href: '#accelerated-innovation'
		},
		{
			id: 'trusted-acceleration',
			label: 'Trusted Acceleration',
			icon: 'state-success',
			href: '#trusted-acceleration'
		},
		{
			id: 'why-seneca',
			label: 'Why Seneca',
			icon: 'state-info',
			href: '#why-seneca'
		}
	]

	let activeSection = $state('homepage')
	let isExpanded = $state(false)
	let isPinned = $state(false)

	function handleNavigate(item) {
		console.log('Navigated to:', item.label)
	}
</script>

<!-- Example sections for scrollspy -->
<main class="min-h-screen">
	<section id="homepage" class="flex h-screen items-center justify-center bg-blue-50">
		<h1 class="text-4xl font-bold">Home Section</h1>
	</section>

	<section id="fast-track" class="flex h-screen items-center justify-center bg-green-50">
		<h1 class="text-4xl font-bold">Fast-Track AI Section</h1>
	</section>

	<section
		id="accelerated-innovation"
		class="flex h-screen items-center justify-center bg-yellow-50"
	>
		<h1 class="text-4xl font-bold">Accelerated Innovation Section</h1>
	</section>

	<section id="trusted-acceleration" class="flex h-screen items-center justify-center bg-red-50">
		<h1 class="text-4xl font-bold">Trusted Acceleration Section</h1>
	</section>

	<section id="why-seneca" class="flex h-screen items-center justify-center bg-purple-50">
		<h1 class="text-4xl font-bold">Why Seneca Section</h1>
	</section>
</main>

<!-- FloatingNav Component -->
<FloatingNav
	items={navigationItems}
	bind:activeSection
	bind:isExpanded
	bind:isPinned
	position="right"
	onNavigate={handleNavigate}
	class="floating-nav"
/>

<!-- Debug info (optional) -->
<div class="fixed left-4 top-4 z-50 rounded bg-white p-4 shadow-lg">
	<h3 class="mb-2 font-bold">Debug Info:</h3>
	<p>Active Section: {activeSection}</p>
	<p>Is Expanded: {isExpanded}</p>
	<p>Is Pinned: {isPinned}</p>
</div>
