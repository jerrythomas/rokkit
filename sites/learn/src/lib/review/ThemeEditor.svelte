<script>
	import { ButtonGroup } from '@rokkit/form'

	export let themes = ['minimal', 'material', 'spicy']
	export let currentTheme = themes[2]

	function handleThemeChange(event) {
		document.body.classList.remove(currentTheme)
		currentTheme = event.detail
		document.body.classList.add(currentTheme)
	}
	// onMount(() => {
	// 	document.body.classList.add(currentTheme)
	// })
</script>

<section>
	<ButtonGroup
		on:change={handleThemeChange}
		items={themes}
		value={currentTheme}
	/>
</section>
