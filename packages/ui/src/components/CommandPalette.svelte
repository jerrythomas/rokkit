<script lang="ts">
	import { commands, messages } from '@rokkit/states'
	import { dismissable } from '@rokkit/actions'

	/** Minimal command shape this palette reads (states' Command typedef isn't exported). */
	type CommandLike = { id: string; label: string; keywords?: string[] }

	let { open = $bindable(false), placeholder }: { open?: boolean; placeholder?: string } = $props()

	let query = $state('')
	let activeIndex = $state(0)

	const labels = $derived({
		placeholder: placeholder ?? messages.command.placeholder,
		noResults: messages.command.noResults,
		label: messages.command.label
	})

	function score(cmd: CommandLike, q: string) {
		const hay = `${cmd.label} ${cmd.id} ${(cmd.keywords ?? []).join(' ')}`.toLowerCase()
		return hay.includes(q)
	}

	const results = $derived.by(() => {
		const q = query.trim().toLowerCase()
		return q ? commands.all.filter((c) => score(c, q)) : commands.all
	})

	function close() {
		open = false
		query = ''
		activeIndex = 0
	}

	function runAt(index: number) {
		const cmd = results[index]
		if (!cmd) return
		close()
		commands.execute(cmd.id)
	}

	function onkeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown') {
			event.preventDefault()
			activeIndex = Math.min(activeIndex + 1, results.length - 1)
		} else if (event.key === 'ArrowUp') {
			event.preventDefault()
			activeIndex = Math.max(activeIndex - 1, 0)
		} else if (event.key === 'Enter') {
			event.preventDefault()
			runAt(activeIndex)
		} else if (event.key === 'Escape') {
			close()
		}
	}
</script>

{#if open}
	<div data-command-backdrop>
		<div
			data-command-palette
			role="dialog"
			aria-modal="true"
			aria-label={labels.label}
			use:dismissable
			ondismiss={close}
		>
			<!-- svelte-ignore a11y_autofocus -->
			<input
				data-command-input
				type="text"
				autofocus
				placeholder={labels.placeholder}
				bind:value={query}
				{onkeydown}
				oninput={() => (activeIndex = 0)}
			/>
			{#if results.length === 0}
				<p data-command-empty>{labels.noResults}</p>
			{:else}
				<ul data-command-list role="listbox">
					{#each results as cmd, i (cmd.id)}
						<li
							data-command-item
							data-active={i === activeIndex || undefined}
							role="option"
							aria-selected={i === activeIndex}
							onclick={() => runAt(i)}
							onkeydown={(e) => e.key === 'Enter' && runAt(i)}
							onmousemove={() => (activeIndex = i)}
						>
							<span data-command-label>{cmd.label}</span>
							{#if cmd.shortcut}<span data-command-shortcut>{cmd.shortcut}</span>{/if}
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
{/if}
