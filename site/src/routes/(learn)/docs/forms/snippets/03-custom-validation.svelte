<FormRenderer
	bind:data
	{schema}
	onvalidate={(path, value) => {
		if (path === '#/password' && value?.length < 8)
			return { state: 'error', text: 'Password must be at least 8 characters' }
	}}
/>
