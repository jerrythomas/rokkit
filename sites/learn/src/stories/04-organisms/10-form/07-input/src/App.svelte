<script>
	import { InputField } from '@rokkit/ui'
	let value = {
		range: 10,
		color: '#00f0f0',
		date: new Date().toISOString().split('T')[0],
		time: new Date().toISOString().split('T')[1].split('.')[0],
		file: null,
		checkbox: false,
		select: null,
		multi: [],
		switch: 'a',
		radio: false
	}
	let display = ''

	$: display = JSON.stringify(value, null, 2)
</script>

<section class="grid grid-cols-3 gap-4">
	<div class="flex flex-col p-4 gap-2 h-full overflow-hidden">
		<InputField name="range" type="range" min={0} max={100} ticks={20} bind:value={value.range} />
		<InputField name="color" type="color" bind:value={value.color} />
		<InputField name="date" type="date" bind:value={value.date} />
		<InputField name="time" type="time" bind:value={value.time} />
		<InputField name="file" type="file" bind:value={value.file} />
		<InputField name="select" type="select" bind:value={value.select} options={['a', 'b', 'c']} />
		<InputField
			name="multi-select"
			type="multi-select"
			bind:value={value.multi}
			options={['a', 'b', 'c']}
		/>

		<InputField name="checkbox" type="checkbox" bind:value={value.checkbox} />
		<InputField name="radio" type="radio" bind:value={value.radio} options={['a', 'b', 'c']} />
		<InputField name="switch" type="switch" bind:value={value.switch} options={['a', 'b', 'c']} />
	</div>
	<pre class="text-sm overflow-y-scroll p-4 col-span-2">{display}</pre>
</section>
