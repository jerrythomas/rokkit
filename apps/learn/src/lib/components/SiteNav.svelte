<script lang="ts">
	import { page } from '$app/state'

	interface Props {
		/** Pass `true` on routes outside `/app` and `/chat` to mark
		 * `Components` as the implicit landing target. Optional. */
		homeIsActive?: boolean
	}

	const { homeIsActive = false }: Props = $props()

	const links = [
		{ label: 'Components', href: '/app', match: (p: string) => p.startsWith('/app') || homeIsActive },
		{ label: 'Guides', href: '/guides', match: (p: string) => p.startsWith('/guides') },
		{ label: 'Chat demo', href: '/chat', match: (p: string) => p.startsWith('/chat') },
		{ label: 'GitHub ↗', href: 'https://github.com/jerrythomas/rokkit', external: true, match: () => false }
	]

	const path = $derived(page.url?.pathname ?? '/')
</script>

<nav data-site-nav>
	{#each links as link (link.label)}
		<a
			href={link.href}
			class:active={link.match(path)}
			target={link.external ? '_blank' : undefined}
			rel={link.external ? 'noopener noreferrer' : undefined}
		>
			{link.label}
		</a>
	{/each}
</nav>

<style>
	[data-site-nav] {
		display: inline-flex;
		align-items: center;
		gap: 18px;
		font: 400 13px/1 var(--font-ui);
	}

	[data-site-nav] a {
		color: var(--ink-mute);
		text-decoration: none;
		padding: 4px 0;
		border-bottom: 1.5px solid transparent;
		transition:
			color 140ms ease,
			border-color 140ms ease;
	}

	[data-site-nav] a:hover {
		color: var(--ink);
	}

	[data-site-nav] a.active {
		color: var(--ink);
		border-bottom-color: var(--primary);
	}
</style>
