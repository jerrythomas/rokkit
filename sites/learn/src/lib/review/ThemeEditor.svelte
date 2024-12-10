<script>
	import { ButtonGroup } from '@rokkit/form'

	let { themes = ['minimal', 'material', 'spicy'], currentTheme = $bindable(themes[2]) } = $props()

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
	<ButtonGroup on:change={handleThemeChange} items={themes} value={currentTheme} />
</section>
