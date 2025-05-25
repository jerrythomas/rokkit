<script>
	import DemoWrapper from './DemoWrapper.svelte'
	import { List, GroupedList } from '@rokkit/bits-ui'
	import { Command } from 'bits-ui'
	import CalendarBlank from 'phosphor-svelte/lib/CalendarBlank'
	import CodeBlock from 'phosphor-svelte/lib/CodeBlock'
	import Palette from 'phosphor-svelte/lib/Palette'
	import RadioButton from 'phosphor-svelte/lib/RadioButton'
	import Sticker from 'phosphor-svelte/lib/Sticker'
	import Textbox from 'phosphor-svelte/lib/Textbox'
	let items = $state([
		{ id: '1', text: 'hello', href: '/', icon: Sticker },
		{ id: '2', text: 'Delegation', icon: CodeBlock },
		{ id: '3', text: 'Styling', icon: Palette },
		{ id: '4', text: 'Calendar', icon: CalendarBlank },
		{ id: '5', text: 'Radio Group', icon: RadioButton },
		{ id: '6', text: 'Combobox', icon: Textbox }
	])
	let nested = $state([
		{
			id: '0',
			title: 'Suggestions',
			children: [
				{ id: '1', title: 'hello', href: '/', icon: Sticker },
				{ id: '2', title: 'Delegation', icon: CodeBlock },
				{ id: '3', title: 'Styling', icon: Palette },
				{ id: '4', title: 'Calendar', icon: CalendarBlank }
			]
		},
		{
			id: '30',
			title: 'Components',
			children: [
				{ id: '5', title: 'Radio Group', icon: RadioButton },
				{ id: '6', title: 'Combobox', icon: Textbox }
			]
		}
	])

	let fields = { text: 'title' }
</script>

<div class="bg-white/20">White</div>
<div class="bg-primary/20">Primary</div>
<div class="bg-secondary">Red</div>
<!-- <span class="items-center gap-10 overflow-auto px-20">
	<List {items} searchable>
		{#snippet child(proxy)}
			{@const Icon = proxy.get('icon')}
			<Icon></Icon>
			{proxy.get('text')}
		{/snippet}
	</List>
</span> -->
<DemoWrapper>
	<GroupedList showSeparator="true" items={nested} searchable>
		{#snippet child(proxy)}
			{@const Icon = proxy.get('icon')}
			<Icon></Icon>
			{proxy.value.title}
		{/snippet}
	</GroupedList>
</DemoWrapper>
