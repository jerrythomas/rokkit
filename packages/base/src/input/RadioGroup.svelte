<script>
	import { defaultStateIcons } from '../constants'

	export let options = []
	export let value
	export let fail = false
	export let pass = false
	export let readOnly = false
	export let stateIcons = defaultStateIcons.radio

	let index = options.findIndex((option) => option['isDefault'])
	$: value = index > -1 ? options[index] : null
	$: readOnly = readOnly || pass || fail
</script>

<radio-group
	class="flex flex-col cursor-pointer select-none"
	class:readOnly
	class:fail
	class:pass
>
	{#each options as { label }, i}
		<div
			class="flex flex-row items-center gap-1"
			on:click={() => (index = readOnly ? index : i)}
		>
			<icon id={i} class={index == i ? stateIcons.on : stateIcons.off} />
			<!-- <Radio id={i} checked={index == i} alignTop /> -->
			<label class="flex flex-grow" for={i}>{label}</label>
		</div>
	{/each}
</radio-group>
