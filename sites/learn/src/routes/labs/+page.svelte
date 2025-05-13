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
		{ id: '1', text: 'Introduction', href: '/', icon: Sticker },
		{ id: '2', text: 'Delegation', icon: CodeBlock },
		{ id: '3', text: 'Styling', icon: Palette },
		{ id: '4', text: 'Calendar', icon: CalendarBlank },
		{ id: '5', text: 'Radio Group', icon: RadioButton },
		{ id: '6', text: 'Combobox', icon: Textbox }
	])
	let nested = $state([
		{
			id: '0',
			text: 'Suggestions',
			children: [
				{ id: '1', text: 'Introduction', href: '/', icon: Sticker },
				{ id: '2', text: 'Delegation', icon: CodeBlock },
				{ id: '3', text: 'Styling', icon: Palette },
				{ id: '4', text: 'Calendar', icon: CalendarBlank }
			]
		},
		{
			id: '30',
			text: 'Components',
			children: [
				{ id: '5', text: 'Radio Group', icon: RadioButton },
				{ id: '6', text: 'Combobox', icon: Textbox }
			]
		}
	])
</script>

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
			{proxy.get('text')}
		{/snippet}
	</GroupedList>
</DemoWrapper>
