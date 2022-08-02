<script>
	import InputCheckBox from './InputCheckBox.svelte'

	export let options = []
	export let fail = false
	export let pass = false
	export let warn = false
	export let readOnly = false

	// $: readOnly = readOnly || pass || fail || warn
</script>

<checkbox-group class:readOnly class:fail class:pass class:warn>
	{#each options as { label, checked, pass, fail }, i}
		<InputCheckBox
			id={i}
			bind:value={checked}
			{label}
			{pass}
			{fail}
			{readOnly}
		/>
	{/each}
</checkbox-group>
