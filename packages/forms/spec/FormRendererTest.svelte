<script>
	import FormRenderer from '../src/FormRenderer.svelte'

	/**
	 * Wrapper so specs can exercise FormRenderer's snippet props (`actions`,
	 * `child`), which cannot be passed through `render(Component, { props })`.
	 * Flags select which snippets are supplied so one wrapper covers every case.
	 *
	 * Note `ctx.submit` is typed `(e: Event) => …` and calls `preventDefault()`
	 * on it, so the click event is forwarded rather than dropped.
	 */
	let { withActions = false, withChild = false, ...rest } = $props()
</script>

{#snippet actionsBar(ctx)}
	<div data-custom-actions>
		<button type="button" data-custom-submit onclick={(e) => ctx.submit(e)}>Send</button>
		<button type="button" data-custom-reset onclick={() => ctx.reset()}>Undo</button>
		<span data-custom-valid>{String(ctx.isValid)}</span>
		<span data-custom-dirty>{String(ctx.isDirty)}</span>
		<span data-custom-submitting>{String(ctx.submitting)}</span>
	</div>
{/snippet}

{#snippet customChild(element)}
	<span data-custom-child data-child-scope={element.scope}>custom</span>
{/snippet}

{#if withActions && withChild}
	<FormRenderer {...rest} actions={actionsBar} child={customChild} />
{:else if withActions}
	<FormRenderer {...rest} actions={actionsBar} />
{:else if withChild}
	<FormRenderer {...rest} child={customChild} />
{:else}
	<FormRenderer {...rest} />
{/if}
