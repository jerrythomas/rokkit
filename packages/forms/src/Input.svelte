<script>
	import { Icon } from '@rokkit/ui'
	import InputCheckbox from './input/InputCheckbox.svelte'
	import InputColor from './input/InputColor.svelte'
	import InputDate from './input/InputDate.svelte'
	import InputDateTime from './input/InputDateTime.svelte'
	import InputEmail from './input/InputEmail.svelte'
	import InputFile from './input/InputFile.svelte'
	import InputMonth from './input/InputMonth.svelte'
	import InputNumber from './input/InputNumber.svelte'
	import InputPassword from './input/InputPassword.svelte'
	import InputRange from './input/InputRange.svelte'
	import InputTel from './input/InputTel.svelte'
	import InputText from './input/InputText.svelte'
	import InputTextArea from './input/InputTextArea.svelte'
	import InputTime from './input/InputTime.svelte'
	import InputUrl from './input/InputUrl.svelte'
	import InputWeek from './input/InputWeek.svelte'
	import InputSelect from './input/InputSelect.svelte'

	let {
		type = 'text',
		value = $bindable(),
		onchange = null,
		oninput = null,
		onfocus = null,
		onblur = null,
		icon = null,
		...restProps
	} = $props()
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
	{:else if type === 'color'}
		<InputColor bind:value {onchange} {oninput} {onfocus} {onblur} {...restProps} />
	{:else if type === 'date'}
		<InputDate bind:value {onchange} {oninput} {onfocus} {onblur} {...restProps} />
	{:else if type === 'email'}
		<InputEmail bind:value {onchange} {oninput} {onfocus} {onblur} {...restProps} />
	{:else if type === 'tel'}
		<InputTel bind:value {onchange} {oninput} {onfocus} {onblur} {...restProps} />
	{:else if type === 'time'}
		<InputTime bind:value {onchange} {oninput} {onfocus} {onblur} {...restProps} />
	{:else if ['datetime', 'datetime-local'].includes(type)}
		<InputDateTime bind:value {onchange} {oninput} {onfocus} {onblur} {...restProps} />
	{:else if type === 'month'}
		<InputMonth bind:value {onchange} {oninput} {onfocus} {onblur} {...restProps} />
	{:else if type === 'range'}
		<InputRange bind:value {onchange} {oninput} {onfocus} {onblur} {...restProps} />
	{:else if type === 'select'}
		<InputSelect bind:value {onchange} {onfocus} {onblur} {...restProps} />
	{:else if type === 'textarea'}
		<InputTextArea bind:value {onchange} {oninput} {onfocus} {onblur} {...restProps} />
	{:else if type === 'url'}
		<InputUrl bind:value {onchange} {oninput} {onfocus} {onblur} {...restProps} />
	{:else if type === 'week'}
		<InputWeek bind:value {onchange} {oninput} {onfocus} {onblur} {...restProps} />
		<!-- {:else if type === 'switch'}
		<InputWeek bind:value {onchange} {oninput} {onfocus} {onblur} {...restProps} /> -->
	{:else}
		<!-- Default to text input -->
		<InputText bind:value {onchange} {oninput} {onfocus} {onblur} {...restProps} />
	{/if}
</div>
