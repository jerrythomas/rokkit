<script>
	import { Proxy } from '@rokkit/states'
	let { class: classNames = '', value = $bindable(), fields, child, onClick } = $props()

	const proxy = $state(new Proxy(value, fields))
	const childSnippet = $derived(child ?? defaultChild)
	const href = $derived(proxy.get('href'))

	/**
	 * Handles enter key
	 * @param {KeyboardEvent} event
	 */
	function handleKeyUp(event) {
		if (event.key === 'Enter') onClick?.()
	}
</script>

{#snippet defaultChild(/** @type {Proxy}*/ proxy)}
	<icon class="flex flex-col">
		<i class={proxy.get('icon')}></i>
	</icon>
	<h1>{proxy.get('title')}</h1>
	<h2>{proxy.get('description')}</h2>
{/snippet}

{#if href}
	<a {href} data-card-root class={classNames}>
		{@render childSnippet(proxy)}
	</a>
{:else}
	<div
		data-card-root
		onclick={onClick}
		onkeyup={handleKeyUp}
		role="button"
		tabindex="-1"
		class={classNames}
	>
		{@render childSnippet(proxy)}
	</div>
{/if}
