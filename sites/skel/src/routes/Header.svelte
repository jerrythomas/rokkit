<script>
	import { DropDown } from '@rokkit/core';
	import { Switch } from '@rokkit/input';
	import { theme } from '@rokkit/core/stores';

	let darkMode = true;
	let items = [{ text: 'Rokkit' }, { text: 'Modern' }, { text: 'Material' }];
	let value = items[0];
	$: theme.set({ name: value.text.toLowerCase(), mode: darkMode ? 'dark' : 'light' });
</script>

<header class="flex flex-row w-full px-10 py-6 items-center justify-between text-white">
	<div class="flex items-center gap-5">
		<img src="/rokkit.svg" alt="Rokkit Logo" class="w-12 h-12 shadow-lg" />
		<p class="text-xl">Rokkit</p>
	</div>
	<settings class="flex items-center gap-5">
		<DropDown {items} bind:value />
		<Switch bind:value={darkMode} />
	</settings>
</header>
