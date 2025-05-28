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
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
					{element.label}: {element.value}
					<input
						type="range"
						value={element.value}
						min={element.constraints?.min}
						max={element.constraints?.max}
						step={element.constraints?.step}
						oninput={(e) => handleRangeChange(element.scope, e)}
						class="mt-1 h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
					/>
				</label>
			{:else if element.type === 'number'}
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
					{element.label}
					<input
						type="number"
						value={element.value}
						min={element.constraints?.min}
						max={element.constraints?.max}
						step={element.constraints?.step}
						oninput={(e) => handleNumberChange(element.scope, e)}
						class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
				</label>
			{:else if element.type === 'checkbox'}
				<label class="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
					<input
						type="checkbox"
						checked={element.value}
						onchange={(e) => handleCheckboxChange(element.scope, e)}
						class="mr-2 h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500 dark:border-gray-600"
					/>
					{element.label}
				</label>
			{:else if element.type === 'select'}
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
					{element.label}
					<select
						value={element.value}
						onchange={(e) => handleTextChange(element.scope, e)}
						class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					>
						{#each element.constraints?.options || [] as option}
							<option value={option}>{option}</option>
						{/each}
					</select>
				</label>
			{:else}
				<!-- Default text input -->
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
					{element.label}
					<input
						type="text"
						value={element.value || ''}
						oninput={(e) => handleTextChange(element.scope, e)}
						class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					/>
				</label>
			{/if}
		</div>
	{/each}
</div>
