<script>
	// Props using Svelte 5 runes
	let { elements = [], onUpdate = null } = $props()

	/**
	 * Handle field value changes
	 * @param {string} scope - Field scope/path
	 * @param {any} value - New value
	 */
	function handleChange(scope, value) {
		onUpdate?.(scope, value)
	}

	/**
	 * Handle range input changes (convert to number)
	 * @param {string} scope - Field scope/path
	 * @param {Event} event - Input event
	 */
	function handleRangeChange(scope, event) {
		const value = Number(event.target.value)
		handleChange(scope, value)
	}

	/**
	 * Handle number input changes (convert to number)
	 * @param {string} scope - Field scope/path
	 * @param {Event} event - Input event
	 */
	function handleNumberChange(scope, event) {
		const value = Number(event.target.value)
		handleChange(scope, value)
	}

	/**
	 * Handle checkbox changes
	 * @param {string} scope - Field scope/path
	 * @param {Event} event - Input event
	 */
	function handleCheckboxChange(scope, event) {
		const value = event.target.checked
		handleChange(scope, value)
	}

	/**
	 * Handle text input changes
	 * @param {string} scope - Field scope/path
	 * @param {Event} event - Input event
	 */
	function handleTextChange(scope, event) {
		const value = event.target.value
		handleChange(scope, value)
	}
</script>

<div class="space-y-4">
	{#each elements as element (element.scope)}
		<div class="form-element">
			{#if element.type === 'range'}
				<label class="text-surface-700 dark:text-surface-300 block text-sm font-medium">
					{element.label}: {element.value}
					<input
						type="range"
						value={element.value}
						min={element.constraints?.min}
						max={element.constraints?.max}
						step={element.constraints?.step}
						oninput={(e) => handleRangeChange(element.scope, e)}
						class="bg-surface-200 dark:bg-surface-700 mt-1 h-2 w-full cursor-pointer appearance-none rounded-lg"
					/>
				</label>
			{:else if element.type === 'number'}
				<label class="text-surface-700 dark:text-surface-300 block text-sm font-medium">
					{element.label}
					<input
						type="number"
						value={element.value}
						min={element.constraints?.min}
						max={element.constraints?.max}
						step={element.constraints?.step}
						oninput={(e) => handleNumberChange(element.scope, e)}
						class="focus:border-primary-500 focus:ring-primary-500 border-surface-300 dark:border-surface-600 dark:bg-surface-700 mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none dark:text-white"
					/>
				</label>
			{:else if element.type === 'checkbox'}
				<label class="text-surface-700 dark:text-surface-300 flex items-center text-sm font-medium">
					<input
						type="checkbox"
						checked={element.value}
						onchange={(e) => handleCheckboxChange(element.scope, e)}
						class="text-primary-600 focus:ring-primary-500 border-surface-300 dark:border-surface-600 mr-2 h-4 w-4 rounded"
					/>
					{element.label}
				</label>
			{:else if element.type === 'select'}
				<label class="text-surface-700 dark:text-surface-300 block text-sm font-medium">
					{element.label}
					<select
						value={element.value}
						onchange={(e) => handleTextChange(element.scope, e)}
						class="focus:border-primary-500 focus:ring-primary-500 border-surface-300 dark:border-surface-600 dark:bg-surface-700 mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none dark:text-white"
					>
						{#each element.constraints?.options || [] as option, index (index)}
							<option value={option}>{option}</option>
						{/each}
					</select>
				</label>
			{:else}
				<!-- Default text input -->
				<label class="text-surface-700 dark:text-surface-300 block text-sm font-medium">
					{element.label}
					<input
						type="text"
						value={element.value || ''}
						oninput={(e) => handleTextChange(element.scope, e)}
						class="focus:border-primary-500 focus:ring-primary-500 border-surface-300 dark:border-surface-600 dark:bg-surface-700 mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none dark:text-white"
					/>
				</label>
			{/if}
		</div>
	{/each}
</div>
