<script lang="ts">
	import { Button } from '@rokkit/ui'

	/**
	 * Canvas mount for /app/button. Renders a representative gallery of
	 * Button variants the user can scan — icon-only, icon+label, link,
	 * loading, disabled — instead of a single button you'd miss in the
	 * canvas space. Tweak props from the slab spread over each row.
	 */
	let loading = $state(false)
	let { ...spread }: Record<string, unknown> = $props()
</script>

<div class="btn-grid">
	<section>
		<header>Default</header>
		<div class="row">
			<Button {...spread}>Save</Button>
			<Button {...spread} icon="i-mdi:download">Download</Button>
			<Button {...spread} icon="i-mdi:check">Confirm</Button>
		</div>
	</section>

	<section>
		<header>Icon-only</header>
		<div class="row">
			<Button {...spread} icon="i-mdi:heart" aria-label="Like" />
			<Button {...spread} icon="i-mdi:share" aria-label="Share" />
			<Button {...spread} icon="i-mdi:dots-vertical" aria-label="More" />
		</div>
	</section>

	<section>
		<header>States</header>
		<div class="row">
			<Button {...spread} disabled>Disabled</Button>
			<Button {...spread} {loading} onclick={() => (loading = !loading)}>
				{loading ? 'Loading…' : 'Click to load'}
			</Button>
		</div>
	</section>

	<section>
		<header>Link</header>
		<div class="row">
			<Button {...spread} href="https://github.com/jerrythomas/rokkit" target="_blank">
				Repo on GitHub
			</Button>
		</div>
	</section>
</div>

<style>
	.btn-grid {
		display: flex;
		flex-direction: column;
		gap: 18px;
	}

	section {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	header {
		font: 500 11px var(--font-mono);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--ink-soft);
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		align-items: center;
	}
</style>
