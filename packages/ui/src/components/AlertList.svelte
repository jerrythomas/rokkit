<script lang="ts">
	import type { Snippet } from 'svelte'
	import { SvelteSet } from 'svelte/reactivity'
	import { alerts } from '@rokkit/states'
	import Message from './Message.svelte'

	interface AlertListProps {
		/** Screen position for the toast stack */
		position?:
			| 'top-right'
			| 'top-center'
			| 'top-left'
			| 'bottom-right'
			| 'bottom-center'
			| 'bottom-left'
		/** Additional CSS class */
		class?: string
	}

	const { position = 'top-right', class: className = '' }: AlertListProps = $props()

	const dismissing = new SvelteSet<string>()

	// Portal to document.body so position:fixed is relative to the viewport,
	// not clipped by any overflow:auto ancestor (e.g. the docs main column).
	 
	function mountPortal(node: HTMLElement) {
		document.body.appendChild(node)
		return { destroy: () => node.remove() }
	}

	function startDismiss(id: string) {
		dismissing.add(id)
	}

	function onTransitionEnd(id: string, e: TransitionEvent) {
		if (e.propertyName === 'max-height' && dismissing.has(id)) {
			dismissing.delete(id)
			alerts.dismiss(id)
		}
	}
</script>

<div use:mountPortal data-alert-list data-position={position} class={className || undefined}>
	{#each alerts.current as alert (alert.id)}
		<div
			data-dismissing={dismissing.has(alert.id) || undefined}
			ontransitionend={(e) => onTransitionEnd(alert.id, e)}
		>
			<Message
				type={alert.type as 'error' | 'info' | 'success' | 'warning'}
				text={alert.text}
				dismissible={alert.dismissible}
				actions={alert.actions as Snippet}
				ondismiss={() => startDismiss(alert.id)}
			/>
		</div>
	{/each}
</div>
