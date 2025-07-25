<script>
	import { Icon } from '@rokkit/ui'
	/**
	 * @typedef {Object} HeaderProps
	 * @property {string} icon - The icon of the header.
	 * @property {string} title - The title of the header.
	 * @property {string} description - The description of the header.
	 * @property {Array<{ label: string; href?: string }} [breadcrumbs] - Navigation breadcrumbs.
	 */

	/** @type {HeaderProps} */
	let { icon, title, description, breadcrumbs } = $props()
</script>

<header class="border-surface-z2 bg-surface-z2">
	<div class="max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
		<div>
			{#if breadcrumbs && breadcrumbs.length > 0}
				<nav class="mb-2 flex" aria-label="Breadcrumb">
					<ol class="flex items-center space-x-2">
						{#each breadcrumbs as crumb, index (crumb.label)}
							<li class="flex items-center">
								{#if index > 0}
									<span class="text-surface-400 mx-2">/</span>
								{/if}
								{#if crumb.href}
									<a
										href={crumb.href}
										class="text-surface-600 hover:text-surface-900 dark:text-surface-400 text-sm dark:hover:text-white"
									>
										{crumb.label}
									</a>
								{:else}
									<span class="text-surface-900 text-sm dark:text-white">{crumb.label}</span>
								{/if}
							</li>
						{/each}
					</ol>
				</nav>
			{/if}
			<h1 class="text-surface-900 flex items-center gap-4 text-3xl font-bold dark:text-white">
				{#if icon}
					<Icon name={icon} class="text-secondary-z7 text-6xl" />
				{/if}
				{title}
			</h1>
			<p class="text-surface-600 dark:text-surface-400 mt-2">{description}</p>
		</div>
	</div>
</header>
