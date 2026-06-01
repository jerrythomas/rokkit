<FormRenderer bind:data {schema} onsubmit={handleSubmit}>
	{#snippet actions({ submitting, isValid, isDirty, submit, reset })}
		<div class="flex gap-2">
			<button onclick={submit} disabled={!isValid || submitting}>
				{submitting ? 'Saving...' : 'Save'}
			</button>
			<button onclick={reset} disabled={!isDirty}>Reset</button>
		</div>
	{/snippet}
</FormRenderer>
