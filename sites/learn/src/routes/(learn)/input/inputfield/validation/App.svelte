<script>
	import { InputField } from '@rokkit/ui'

	let email = $state('')
	let password = $state('')
	
	$: emailStatus = email.includes('@') ? 'pass' : email ? 'fail' : undefined
	$: emailMessage = email ? 
		(email.includes('@') ? 'Valid email format' : 'Please enter a valid email') 
		: 'Enter your email address'
		
	$: passwordStatus = password.length >= 8 ? 'pass' : password ? 'fail' : undefined
	$: passwordMessage = password ? 
		(password.length >= 8 ? 'Password meets requirements' : 'Password must be at least 8 characters') 
		: 'Password must be at least 8 characters'
</script>

<div class="space-y-6">
	<InputField 
		name="email" 
		type="email" 
		label="Email Address" 
		bind:value={email}
		status={emailStatus}
		message={emailMessage}
		required
	/>
	
	<InputField 
		name="password" 
		type="password" 
		label="Password" 
		bind:value={password}
		status={passwordStatus}
		message={passwordMessage}
		required
	/>
</div>

<div class="mt-6 p-4 bg-neutral-50 rounded-lg">
	<p><strong>Email:</strong> {email || 'Not entered'}</p>
	<p><strong>Password:</strong> {password ? '•'.repeat(password.length) : 'Not entered'}</p>
</div>