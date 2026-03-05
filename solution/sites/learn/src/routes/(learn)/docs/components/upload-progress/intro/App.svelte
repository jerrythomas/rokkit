<script>
	// @ts-nocheck
	import { UploadProgress } from '@rokkit/ui'

	const files = [
		{ text: 'photo.jpg', value: '1', size: 245760, type: 'image/jpeg', status: 'uploading', progress: 65 },
		{ text: 'document.pdf', value: '2', size: 1048576, type: 'application/pdf', status: 'done', progress: 100 },
		{ text: 'report.xlsx', value: '3', size: 524288, type: 'application/vnd.ms-excel', status: 'error', progress: 30 },
		{ text: 'readme.md', value: '4', size: 2048, type: 'text/plain', status: 'pending', progress: 0 }
	]
</script>

<UploadProgress {files} />
