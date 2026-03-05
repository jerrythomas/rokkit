<script>
	import { UploadProgress } from '@rokkit/ui'

	const files = [
		{ text: 'photo.jpg', value: '1', status: 'uploading', progress: 65, size: 245760, type: 'image/jpeg' },
		{ text: 'document.pdf', value: '2', status: 'done', progress: 100, size: 1048576, type: 'application/pdf' }
	]
</script>

<UploadProgress {files} />
