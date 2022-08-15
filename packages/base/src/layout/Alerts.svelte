<script>
	import { fade } from 'svelte/transition'
	import { flip } from 'svelte/animate'
	import { alerts } from '../stores'
	import { dismissable } from '../actions/dismissable'

	function dismissAll() {
		unreadAlerts.map((alert) => (alert.dismissed = true))
		alerts.set([...$alerts])
	}

	function dismiss(alert) {
		alert.dismissed = true
		alerts.set([...$alerts])
	}

	$: unreadAlerts = $alerts.filter((x) => !x.dismissed)
</script>

{#if unreadAlerts.length > 0}
	<alert-list
		class="flex flex-col gap-2 absolute z-10"
		use:dismissable
		on:dismiss={dismissAll}
	>
		{#each unreadAlerts as alert (alert.id)}
			<alert
				class={alert.type}
				on:click|stopPropagation={dismiss(alert)}
				animate:flip
				in:fade
				out:fade
			>
				{alert.message}
			</alert>
		{/each}
	</alert-list>
{/if}
