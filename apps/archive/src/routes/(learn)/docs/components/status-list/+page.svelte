<script>
	// @ts-nocheck
	import { StatusList } from '@rokkit/ui'
	import { Code } from '$lib/components/Story'

	let password = $state('')

	const staticItems = [
		{ text: 'At least 8 characters', status: 'pass' },
		{ text: 'Contains an uppercase letter', status: 'fail' },
		{ text: 'Contains a number (recommended)', status: 'warn' },
		{ text: 'Special character check', status: 'unknown' }
	]

	const checks = $derived([
		{
			text: 'At least 8 characters',
			status: password.length >= 8 ? 'pass' : 'fail'
		},
		{
			text: 'Contains an uppercase letter',
			status: /[A-Z]/.test(password) ? 'pass' : 'fail'
		},
		{
			text: 'Contains a number (recommended)',
			status: /[0-9]/.test(password) ? 'pass' : 'warn'
		},
		{
			text: 'Contains a special character',
			status: /[^A-Za-z0-9]/.test(password) ? 'pass' : 'unknown'
		}
	])
</script>

<article data-article-root>
	<p>
		Display a list of validation rules, each with a pass/fail/warn/unknown status icon. Used for
		password strength checkers, pre-submit form validation, system health checks, and any multi-rule
		criteria display.
	</p>

	<h2>Live Demo</h2>
	<StatusList items={staticItems} />

	<h2>Password Strength Example</h2>
	<p>
		Rules update live as the user types — the root carries <code>role="status"</code> so screen readers
		announce changes.
	</p>
	<div style="display:flex; flex-direction:column; gap:0.75rem; max-width:20rem;">
		<input
			type="password"
			placeholder="Type a password…"
			bind:value={password}
			style="padding:0.5rem 0.75rem; border-radius:0.375rem;"
		/>
		<StatusList items={checks} />
	</div>

	<h2>Quick Start</h2>
	<Code
		content={`<script>
  import { StatusList } from '@rokkit/ui'

  const items = [
    { text: 'At least 8 characters', status: 'pass' },
    { text: 'Contains an uppercase letter', status: 'fail' },
    { text: 'Contains a number', status: 'warn' },
    { text: 'Special character check', status: 'unknown' }
  ]
<\/script>

<StatusList {items} />`}
		language="svelte"
	/>

	<h2>Reactive Rules</h2>
	<Code
		content={`<script>
  import { StatusList } from '@rokkit/ui'

  let password = $state('')

  const checks = $derived([
    {
      text: 'At least 8 characters',
      status: password.length >= 8 ? 'pass' : 'fail'
    },
    {
      text: 'Contains an uppercase letter',
      status: /[A-Z]/.test(password) ? 'pass' : 'fail'
    },
    {
      text: 'Contains a number',
      status: /[0-9]/.test(password) ? 'pass' : 'warn'
    }
  ])
<\/script>

<input type="password" bind:value={password} />
<StatusList items={checks} />`}
		language="svelte"
	/>

	<h2>All Status Values</h2>
	<div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem;">
		<div data-card>
			<h3>pass</h3>
			<StatusList items={[{ text: 'Requirement met', status: 'pass' }]} />
		</div>
		<div data-card>
			<h3>fail</h3>
			<StatusList items={[{ text: 'Requirement not met', status: 'fail' }]} />
		</div>
		<div data-card>
			<h3>warn</h3>
			<StatusList items={[{ text: 'Optional, recommended', status: 'warn' }]} />
		</div>
		<div data-card>
			<h3>unknown</h3>
			<StatusList items={[{ text: 'Not yet checked', status: 'unknown' }]} />
		</div>
	</div>

	<h2>Props</h2>
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h3>items</h3>
			<p>Array of <code>{`{ text, status }`}</code> objects.</p>
			<ul>
				<li><strong>text</strong> — rule description (string)</li>
				<li><strong>status</strong> — <code>'pass' | 'fail' | 'warn' | 'unknown'</code></li>
			</ul>
		</div>
		<div data-card>
			<h3>icons</h3>
			<p>Override icon classes per status. Defaults to <code>DEFAULT_STATE_ICONS.badge</code>.</p>
			<Code
				content={`<StatusList
  {items}
  icons={{
    pass: 'i-solar:check-circle-bold',
    fail: 'i-solar:close-circle-bold',
    warn: 'i-solar:danger-triangle-bold',
    unknown: 'i-solar:question-circle-bold'
  }}
/>`}
				language="svelte"
			/>
		</div>
	</div>

	<h2>Data Attributes</h2>
	<table>
		<thead>
			<tr><th>Attribute</th><th>Element</th><th>Values</th><th>Purpose</th></tr>
		</thead>
		<tbody>
			<tr>
				<td><code>data-status-list</code></td>
				<td>root <code>div</code></td>
				<td>presence</td>
				<td>Component root; theme hook</td>
			</tr>
			<tr>
				<td><code>data-status-item</code></td>
				<td>item <code>div</code></td>
				<td>presence</td>
				<td>Individual rule row</td>
			</tr>
			<tr>
				<td><code>data-status</code></td>
				<td>item <code>div</code></td>
				<td><code>pass | fail | warn | unknown</code></td>
				<td>Drives icon and text color</td>
			</tr>
		</tbody>
	</table>
</article>
