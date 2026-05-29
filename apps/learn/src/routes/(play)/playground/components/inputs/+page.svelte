<script>
	// @ts-nocheck
	import { InputField, FormRenderer } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	let props = $state({
		label: 'Field Label',
		placeholder: 'Enter value...',
		type: 'text',
		disabled: false,
		description: ''
	})

	const controlSchema = {
		type: 'object',
		properties: {
			label: { type: 'string' },
			placeholder: { type: 'string' },
			type: { type: 'string' },
			disabled: { type: 'boolean' },
			description: { type: 'string' }
		}
	}

	const controlLayout = {
		type: 'vertical',
		elements: [
			{ scope: '#/label', label: 'Label' },
			{ scope: '#/placeholder', label: 'Placeholder' },
			{
				scope: '#/type',
				label: 'Type',
				props: { options: ['text', 'email', 'password', 'number', 'textarea'] }
			},
			{ scope: '#/description', label: 'Description' },
			{ scope: '#/disabled', label: 'Disabled' }
		]
	}

	let value = $state('')
</script>

<PlaySection>
	{#snippet preview()}
		<div class="flex w-full max-w-[440px] flex-col gap-6">
			<!-- Configurable field -->
			<div class="flex flex-col gap-1">
				<p class="text-surface-z4 text-[10px] font-semibold tracking-widest uppercase">
					Interactive
				</p>
				<InputField
					name="demo"
					label={props.label}
					type={props.type}
					placeholder={props.placeholder}
					description={props.description || undefined}
					disabled={props.disabled}
					bind:value
				/>
			</div>

			<!-- State showcase -->
			<div class="flex flex-col gap-1">
				<p class="text-surface-z4 text-[10px] font-semibold tracking-widest uppercase">States</p>
				<div class="flex flex-col gap-3">
					<InputField name="default" label="Default" placeholder="Type something..." value="" />
					<InputField name="with-value" label="With value" value="Jane Smith" />
					<InputField
						name="error"
						label="Error"
						value="bad-email"
						status="fail"
						message={{ state: 'error', text: 'Enter a valid email address' }}
					/>
					<InputField
						name="success"
						label="Success"
						value="jane@example.com"
						status="pass"
						message={{ state: 'info', text: 'Looks good!' }}
					/>
					<InputField name="disabled" label="Disabled" value="Locked value" disabled={true} />
					<InputField
						name="with-desc"
						label="With description"
						placeholder="username"
						description="Used for login and public profile"
					/>
				</div>
			</div>

			<!-- Input types -->
			<div class="flex flex-col gap-1">
				<p class="text-surface-z4 text-[10px] font-semibold tracking-widest uppercase">Types</p>
				<div class="flex flex-col gap-3">
					<InputField
						name="email"
						label="Email"
						type="email"
						placeholder="user@example.com"
						value=""
					/>
					<InputField
						name="password"
						label="Password"
						type="password"
						placeholder="••••••••"
						value=""
					/>
					<InputField name="number" label="Number" type="number" value={42} />
					<InputField
						name="textarea"
						label="Textarea"
						type="textarea"
						placeholder="Multi-line text..."
						value=""
					/>
				</div>
			</div>
		</div>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} schema={controlSchema} layout={controlLayout} />
	{/snippet}
</PlaySection>
