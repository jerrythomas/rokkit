<script>
	import { UploadTarget } from '@rokkit/ui'

	function handleFiles(files) {
		console.log(
			'Received:',
			files.map((f) => f.name)
		)
	}
</script>

<UploadTarget onfiles={handleFiles} />
