<script>
	import { Icon } from '@rokkit/ui'
	import {
		InputNumber,
		InputCheckbox,
		InputRange,
		InputTextArea,
		InputEmail,
		InputPassword,
		InputTel,
		InputText,
		InputSelect
	} from '@rokkit/forms'
	let {
		type = 'text',
		value = $bindable(null),
		onchange = null,
		oninput = null,
		onfocus = null,
		onblur = null,
		icon = null,
		...restProps
	} = $props()

	// Determine default value based on type
	const defaultValues = {
		checkbox: false,
		number: 0,
		range: 0,
		text: '',
		email: '',
		password: '',
		tel: '',
		textarea: '',
		select: null
	}

	// Set default value if none provided
	if (value === null) {
		value = defaultValues[type] ?? ''
	}
</script>

<div data-input-root>
	{#if icon}
		<Icon name={icon} />
	{/if}
	{#if type === 'number'}
		<InputNumber bind:value {onchange} {oninput} {onfocus} {onblur} {...restProps} />
	{:else if type === 'integer'}
		<InputNumber bind:value {onchange} {oninput} {onfocus} {onblur} step="1" {...restProps} />
	{:else if type === 'password'}
		<InputPassword bind:value {onchange} {oninput} {onfocus} {onblur} {...restProps} />
	{:else if type === 'checkbox'}
		<InputCheckbox bind:value {onchange} {oninput} {onfocus} {onblur} {...restProps} />
	{:else if type === 'range'}
		<InputRange bind:value {onchange} {oninput} {onfocus} {onblur} {...restProps} />
	{:else if type === 'email'}
		<InputEmail bind:value {onchange} {oninput} {onfocus} {onblur} {...restProps} />
	{:else if type === 'tel'}
		<InputTel bind:value {onchange} {oninput} {onfocus} {onblur} {...restProps} />
	{:else if type === 'select'}
		<InputSelect bind:value {onchange} {onfocus} {onblur} {...restProps} />
	{:else if type === 'textarea'}
		<InputTextArea bind:value {onchange} {oninput} {onfocus} {onblur} {...restProps} />
	{:else}
		<!-- Default to text input -->
		<InputText bind:value {onchange} {oninput} {onfocus} {onblur} {...restProps} />
	{/if}
</div>
