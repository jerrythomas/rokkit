<script>
	/**
	 * Universal Input wrapper component supporting all HTML input types
	 * Provides consistent interface with label, description, message handling
	 */

	let {
		// Core input properties
		type = 'text',
		value = $bindable(),

		// Enhanced properties
		label = '',
		description = '',
		message = null, // { state: 'error|warning|info|success', text: 'Message content' }

		// Standard HTML input attributes
		placeholder = '',
		required = false,
		disabled = false,
		readonly = false,
		min = undefined,
		max = undefined,
		step = undefined,
		pattern = undefined,
		minLength = undefined,
		maxLength = undefined,

		// Select-specific
		options = [],

		// Styling
		className = '',

		// Event handlers
		onchange = undefined,
		onfocus = undefined,
		onblur = undefined,

		// Pass through any other props
		...props
	} = $props()

	// Determine layout class based on input type
	function getLayoutClass(inputType) {
		switch (inputType) {
			case 'checkbox':
				return 'input-layout-checkbox'
			case 'radio':
				return 'input-layout-radio'
			default:
				return 'input-layout-standard'
		}
	}

	// Handle change events
	function handleChange(event) {
		if (type === 'checkbox' || type === 'radio') {
			value = event.target.checked
		} else if (type === 'number' || type === 'range') {
			value = event.target.valueAsNumber
		} else {
			value = event.target.value
		}

		if (onchange) {
			onchange(value)
		}
	}

	// Generate unique ID for accessibility
	let fieldId = `field-${Math.random().toString(36).substr(2, 9)}`
	let descriptionId = $derived(description ? `${fieldId}-description` : undefined)
	let messageId = $derived(message ? `${fieldId}-message` : undefined)

	// Build aria-describedby
	let ariaDescribedBy = $derived([descriptionId, messageId].filter(Boolean).join(' ') || undefined)
</script>

<div
	class="input-wrapper {getLayoutClass(type)} {className}"
	class:has-error={message?.state === 'error'}
>
	{#if type === 'checkbox' || type === 'radio'}
		<!-- Checkbox/Radio: Input first, label on the right -->
		<div class="input-control">
			<input
				id={fieldId}
				{type}
				checked={value}
				{required}
				{disabled}
				{readonly}
				aria-describedby={ariaDescribedBy}
				onchange={handleChange}
				{onfocus}
				{onblur}
				{...props}
			/>
			{#if label}
				<label for={fieldId} class="input-label">{label}</label>
			{/if}
		</div>
	{:else}
		<!-- Standard layout: Label above input -->
		{#if label}
			<label for={fieldId} class="input-label">{label}</label>
		{/if}

		<div class="input-control">
			{#if type === 'select'}
				<select
					id={fieldId}
					bind:value
					{required}
					{disabled}
					aria-describedby={ariaDescribedBy}
					onchange={handleChange}
					{onfocus}
					{onblur}
					{...props}
				>
					{#each options as option, index (index)}
						{#if typeof option === 'string'}
							<option value={option}>{option}</option>
						{:else}
							<option value={option.value}>{option.label || option.value}</option>
						{/if}
					{/each}
				</select>
			{:else if type === 'textarea'}
				<textarea
					id={fieldId}
					bind:value
					{placeholder}
					{required}
					{disabled}
					{readonly}
					{minLength}
					{maxLength}
					aria-describedby={ariaDescribedBy}
					onchange={handleChange}
					{onfocus}
					{onblur}
					{...props}
				></textarea>
			{:else}
				<input
					id={fieldId}
					{type}
					bind:value
					{placeholder}
					{required}
					{disabled}
					{readonly}
					{min}
					{max}
					{step}
					{pattern}
					{minLength}
					{maxLength}
					aria-describedby={ariaDescribedBy}
					onchange={handleChange}
					{onfocus}
					{onblur}
					{...props}
				/>
			{/if}
		</div>
	{/if}

	<!-- Description text -->
	{#if description}
		<div id={descriptionId} class="input-description">{description}</div>
	{/if}

	<!-- Message display -->
	{#if message}
		<div
			id={messageId}
			class="input-message message-{message.state}"
			role="alert"
			aria-live="polite"
		>
			{message.text}
		</div>
	{/if}
</div>

<style>
	.input-wrapper {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.input-layout-checkbox,
	.input-layout-radio {
		flex-direction: row;
		align-items: flex-start;
		gap: 0.5rem;
	}

	.input-layout-checkbox .input-control,
	.input-layout-radio .input-control {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.input-control {
		display: flex;
		flex-direction: column;
	}

	.input-label {
		font-weight: 500;
		color: #374151;
		margin-bottom: 0.25rem;
	}

	.input-layout-checkbox .input-label,
	.input-layout-radio .input-label {
		margin-bottom: 0;
		font-weight: normal;
	}

	input,
	select,
	textarea {
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		line-height: 1.25rem;
	}

	input:focus,
	select:focus,
	textarea:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 1px #3b82f6;
	}

	input[type='checkbox'],
	input[type='radio'] {
		width: auto;
		padding: 0;
	}

	.input-description {
		font-size: 0.75rem;
		color: #6b7280;
		margin-top: 0.25rem;
	}

	.input-message {
		font-size: 0.75rem;
		margin-top: 0.25rem;
	}

	.message-error {
		color: #dc2626;
	}

	.message-warning {
		color: #d97706;
	}

	.message-info {
		color: #2563eb;
	}

	.message-success {
		color: #059669;
	}

	.has-error input,
	.has-error select,
	.has-error textarea {
		border-color: #dc2626;
	}

	.has-error input:focus,
	.has-error select:focus,
	.has-error textarea:focus {
		border-color: #dc2626;
		box-shadow: 0 0 0 1px #dc2626;
	}
</style>
