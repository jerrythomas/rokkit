<script>
	// @ts-nocheck
	import { InputField } from '@rokkit/forms'
	import { Code } from '$lib/components/Story'

	let liveValue = $state('Jane Smith')
</script>

<article data-article-root>
	<p>
		<code>InputField</code> is a self-contained form field from <code>@rokkit/forms</code>. It wraps
		a label, the input element, an optional description, and a validation message — all driven by
		data attributes that themes style.
	</p>

	<h2>Live Demo</h2>

	<InputField
		name="live"
		label="Full Name"
		placeholder="Enter your name"
		description="Used on your public profile"
		bind:value={liveValue}
	/>

	<h2>States</h2>

	<p>
		Pass a <code>status</code> prop (<code>'pass'</code> or <code>'fail'</code>) to show validation
		state. The optional <code>message</code> prop shows helper text below the field.
	</p>

	<div style="display:flex; flex-direction:column; gap:1rem; margin-bottom:1rem;">
		<InputField name="s-default" label="Default" placeholder="Type something..." value="" />
		<InputField
			name="s-error"
			label="Error"
			value="bad-email"
			status="fail"
			message={{ state: 'error', text: 'Enter a valid email address' }}
		/>
		<InputField
			name="s-pass"
			label="Success"
			value="jane@example.com"
			status="pass"
			message={{ state: 'info', text: 'Looks good!' }}
		/>
		<InputField name="s-disabled" label="Disabled" value="Locked value" disabled={true} />
	</div>

	<Code
		content={`<script>
  import { InputField } from '@rokkit/forms'

  let email = $state('')
<\/script>

<!-- Default -->
<InputField name="email" label="Email" bind:value={email} />

<!-- Error state -->
<InputField
  name="email"
  label="Email"
  status="fail"
  message={{ state: 'error', text: 'Enter a valid email address' }}
  bind:value={email}
/>

<!-- Success state -->
<InputField
  name="email"
  label="Email"
  status="pass"
  message={{ state: 'info', text: 'Looks good!' }}
  bind:value={email}
/>

<!-- Disabled -->
<InputField name="email" label="Email" value="locked" disabled />`}
		language="svelte"
	/>

	<h2>Input Types</h2>
	<p>
		The <code>type</code> prop maps to standard HTML input types plus <code>'textarea'</code> and
		<code>'integer'</code> (number with <code>step="1"</code>).
	</p>

	<div style="display:flex; flex-direction:column; gap:1rem; margin-bottom:1rem;">
		<InputField name="t-text" label="Text" type="text" placeholder="Plain text" value="" />
		<InputField name="t-email" label="Email" type="email" placeholder="user@example.com" value="" />
		<InputField
			name="t-password"
			label="Password"
			type="password"
			placeholder="••••••••"
			value=""
		/>
		<InputField name="t-number" label="Number" type="number" value={42} />
		<InputField
			name="t-textarea"
			label="Textarea"
			type="textarea"
			placeholder="Multi-line text..."
			value=""
		/>
	</div>

	<h2>With Description</h2>
	<p>Use <code>description</code> to show helper text below the field (always visible).</p>

	<InputField
		name="username"
		label="Username"
		placeholder="your_username"
		description="Lowercase letters, numbers, and underscores only."
		value=""
	/>

	<h2>Props</h2>
	<table>
		<thead>
			<tr><th>Prop</th><th>Type</th><th>Description</th></tr>
		</thead>
		<tbody>
			<tr><td><code>name</code></td><td>string</td><td>HTML name attribute (required)</td></tr>
			<tr><td><code>label</code></td><td>string</td><td>Field label text</td></tr>
			<tr
				><td><code>type</code></td><td>string</td><td
					>Input type: <code>text</code>, <code>email</code>, <code>password</code>,
					<code>number</code>, <code>integer</code>, <code>textarea</code></td
				></tr
			>
			<tr><td><code>value</code></td><td>any</td><td>Bindable field value</td></tr>
			<tr><td><code>placeholder</code></td><td>string</td><td>Placeholder text</td></tr>
			<tr
				><td><code>status</code></td><td><code>'pass' | 'fail'</code></td><td>Validation state</td
				></tr
			>
			<tr
				><td><code>message</code></td><td><code>string | {'{'}state, text}</code></td><td
					>Helper or error message below field</td
				></tr
			>
			<tr><td><code>description</code></td><td>string</td><td>Persistent helper text</td></tr>
			<tr><td><code>disabled</code></td><td>boolean</td><td>Disables the field</td></tr>
			<tr><td><code>icon</code></td><td>string</td><td>Icon class to show inside the input</td></tr>
		</tbody>
	</table>
</article>
