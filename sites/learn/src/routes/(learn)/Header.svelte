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

<header class="border-neutral-z2 bg-neutral-z2">
	<div class="max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
		<div>
			{#if breadcrumbs && breadcrumbs.length > 0}
				<nav class="mb-2 flex" aria-label="Breadcrumb">
					<ol class="flex items-center space-x-2">
						{#each breadcrumbs as crumb, index (crumb.label)}
							<li class="flex items-center">
								{#if index > 0}
									<span class="mx-2 text-neutral-400">/</span>
								{/if}
								{#if crumb.href}
									<a
										href={crumb.href}
										class="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
									>
										{crumb.label}
									</a>
								{:else}
									<span class="text-sm text-neutral-900 dark:text-white">{crumb.label}</span>
								{/if}
							</li>
						{/each}
					</ol>
				</nav>
			{/if}
			<h1 class="flex items-center gap-4 text-3xl font-bold text-neutral-900 dark:text-white">
				{#if icon}
					<Icon name={icon} />
				{/if}
				{title}
			</h1>
			<p class="mt-2 text-neutral-600 dark:text-neutral-400">{description}</p>
		</div>
	</div>
</header>
