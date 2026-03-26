<script lang="ts">
	interface AvatarProps {
		/** Image source URL */
		src?: string
		/** Alt text for the image */
		alt?: string
		/** Explicit initials to display as fallback */
		initials?: string
		/** Full name — auto-derives initials if initials prop not provided */
		name?: string
		/** Size variant */
		size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
		/** Online presence status */
		status?: 'online' | 'offline' | 'away' | 'busy'
		/** Shape variant */
		shape?: 'circle' | 'square'
		/** Additional CSS class */
		class?: string
	}

	const {
		src,
		alt,
		initials,
		name,
		size = 'md',
		status,
		shape = 'circle',
		class: className = ''
	}: AvatarProps = $props()

	/** Derive initials from name if explicit initials not provided */
	const resolvedInitials = $derived.by(() => {
		if (initials) return initials
		if (!name) return '?'
		const parts = name.trim().split(/\s+/)
		if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
		return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
	})

	const altText = $derived(alt ?? name ?? 'Avatar')

	let imgError = $state(false)

	function handleImgError() {
		imgError = true
	}
</script>

<div
	data-avatar
	data-size={size}
	data-shape={shape}
	data-status={status || undefined}
	class={className || undefined}
	role="img"
	aria-label={altText}
>
	{#if src && !imgError}
		<img src={src} alt={altText} data-avatar-img onerror={handleImgError} />
	{:else}
		<span data-avatar-initials aria-hidden="true">{resolvedInitials}</span>
	{/if}

	{#if status}
		<span data-avatar-status data-status={status} aria-label={status}></span>
	{/if}
</div>
