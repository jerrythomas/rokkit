<script>
	import { run } from 'svelte/legacy';

	import { InputField } from '@rokkit/ui'
	let value = $state({
		range: 10,
		color: '#00f0f0',
		date: new Date().toISOString().split('T')[0],
		time: new Date().toISOString().split('T')[1].split('.')[0],
		file: null,
		checkbox: false,
		select: null,
		multi: [],
		switch: 'a',
		radio: false,
		rating: 3
	})
	let display = $state('')

	run(() => {
		display = JSON.stringify(value, null, 2)
	});
</script>

<section class="grid grid-cols-5 overflow-hidden gap-4">
	<div class="flex flex-col p-4 gap-2 h-full overflow-y-scroll col-span-3">
		<InputField name="range" type="range" min={0} max={50} ticks={10} bind:value={value.range} />
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
		<InputField name="rating" type="rating" bind:value={value.rating} />
	</div>
	<pre class="text-xs overflow-y-scroll col-span-2 p-4">{display}</pre>
</section>
