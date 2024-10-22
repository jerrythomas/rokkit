<script>
	let { value, fields } = $props();
</script>

<p>{value[fields.text]}</p>
<img src={value[fields.image]} alt={value[fields.text]} class="h-8 w-8 rounded-sm" />
