<script lang="ts">
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

	let el: HTMLElement | undefined = $state()

	// Portal to document.body so position:fixed is relative to the viewport,
	// not clipped by any overflow:auto ancestor (e.g. the docs main column).
	$effect(() => {
		if (!el) return
		 
		document.body.appendChild(el)
		return () => el?.remove()
	})
</script>

<div bind:this={el} data-alert-list data-position={position} class={className || undefined}>
	{#each alerts.current as alert (alert.id)}
		<Message
			type={alert.type as 'error' | 'info' | 'success' | 'warning'}
			text={alert.text}
			dismissible={alert.dismissible}
			actions={alert.actions as any}
			ondismiss={() => alerts.dismiss(alert.id)}
		/>
	{/each}
</div>
