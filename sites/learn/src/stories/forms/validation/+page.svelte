<script>
	import { StoryViewer, Code } from '$lib/components/Story'
	import { storyBuilder } from './stories.js'
</script>

<article data-article-root>
	<h1>Introduction</h1>
	<p>
		Form validation is essential for ensuring data quality and providing immediate feedback to
		users. Rokkit forms provide comprehensive validation support with real-time feedback, custom
		validation rules, and accessible error messaging.
	</p>

	<h1>Key Features:</h1>
	<ul>
		<li>Real-time validation as users type or change fields</li>
		<li>Multiple validation rules per field</li>
		<li>Custom validation functions for complex business logic</li>
		<li>Accessible error messaging with ARIA support</li>
		<li>Visual feedback with color-coded validation states</li>
		<li>Asynchronous validation for server-side checks</li>
	</ul>

	<h1>Validation Example</h1>
	<p>Here's how validation works with real-time feedback and error messaging:</p>

	<StoryViewer {...storyBuilder.getExample('validation')} />
	<h1>Validation Rules</h1>
	<p>
		Define validation rules in your form schema to ensure data meets your requirements. Rules are
		evaluated in real-time as users interact with form fields.
	</p>

	<Code {...storyBuilder.getFragment(0)} />

	<h1>Built-in Validators</h1>
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h1>Basic Validation</h1>
			<ul>
				<li><strong>required</strong>: Field must have a value</li>
				<li><strong>minLength/maxLength</strong>: String length constraints</li>
				<li><strong>min/max</strong>: Numeric value ranges</li>
				<li><strong>pattern</strong>: Regular expression matching</li>
			</ul>
		</div>

		<div data-card>
			<h1>Type-Specific</h1>
			<ul>
				<li><strong>email</strong>: Valid email address format</li>
				<li><strong>url</strong>: Valid URL format</li>
				<li><strong>number</strong>: Numeric value validation</li>
				<li><strong>date</strong>: Valid date format</li>
			</ul>
		</div>
	</div>
	<h1>Custom Validation Functions</h1>
	<p>
		Create custom validation logic for complex business rules and domain-specific requirements that
		built-in validators can't handle.
	</p>

	<h1>Custom Validator Examples</h1>
	<ul>
		<li><strong>Password strength</strong>: Complex password requirements</li>
		<li><strong>Credit card</strong>: Card number format and checksum validation</li>
		<li><strong>Business rules</strong>: Domain-specific validation logic</li>
		<li><strong>Cross-field</strong>: Validation that depends on multiple fields</li>
		<li><strong>Async validation</strong>: Server-side validation checks</li>
	</ul>

	<h1>Validation Function Structure</h1>
	<p>Custom validators receive the field value and return validation results:</p>
	<ul>
		<li>Return <code>true</code> or <code>undefined</code> for valid values</li>
		<li>Return <code>false</code> or error string for invalid values</li>
		<li>Return <code>Promise</code> for asynchronous validation</li>
		<li>Access other field values for cross-field validation</li>
	</ul>
	<h1>Real-time Validation Feedback</h1>
	<p>
		Validation feedback appears immediately as users interact with form fields, providing instant
		guidance and reducing form submission errors.
	</p>

	<h1>Validation Timing</h1>
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div data-card>
			<h1>Trigger Events</h1>
			<ul>
				<li><strong>onBlur</strong>: When user leaves a field</li>
				<li><strong>onChange</strong>: As user types or changes value</li>
				<li><strong>onSubmit</strong>: When form is submitted</li>
				<li><strong>onFocus</strong>: When user enters a field</li>
			</ul>
		</div>

		<div data-card>
			<h1>Visual States</h1>
			<ul>
				<li><strong>Valid</strong>: Green indicators and checkmarks</li>
				<li><strong>Invalid</strong>: Red indicators and error messages</li>
				<li><strong>Pending</strong>: Loading indicators for async validation</li>
				<li><strong>surface</strong>: Default state before validation</li>
			</ul>
		</div>
	</div>
	<h1>Error Messaging</h1>
	<p>Clear, helpful error messages guide users to fix validation issues quickly and effectively.</p>

	<h1>Message Best Practices</h1>
	<ul>
		<li><strong>Specific</strong>: Clearly explain what's wrong and how to fix it</li>
		<li><strong>Positive</strong>: Focus on what users should do, not what they did wrong</li>
		<li><strong>Concise</strong>: Keep messages brief but informative</li>
		<li><strong>Contextual</strong>: Provide relevant information for the specific field</li>
		<li><strong>Actionable</strong>: Give users clear next steps</li>
	</ul>

	<h1>Accessibility Features</h1>
	<ul>
		<li>ARIA attributes link errors to form fields</li>
		<li>Screen reader friendly error announcements</li>
		<li>Keyboard navigation to error fields</li>
		<li>High contrast error styling</li>
		<li>Focus management for error correction</li>
	</ul>
	<h1>Asynchronous Validation</h1>
	<p>
		Perform server-side validation checks without disrupting the user experience through
		asynchronous validation functions.
	</p>

	<h1>Async Validation Use Cases</h1>
	<ul>
		<li><strong>Username availability</strong>: Check if username is already taken</li>
		<li><strong>Email uniqueness</strong>: Verify email isn't already registered</li>
		<li><strong>Database lookups</strong>: Validate against external data sources</li>
		<li><strong>API validation</strong>: Server-side business rule checks</li>
		<li><strong>Third-party services</strong>: Address validation, tax ID verification</li>
	</ul>

	<h1>Implementation Considerations</h1>
	<ul>
		<li>Debounce validation requests to avoid excessive API calls</li>
		<li>Show loading indicators during validation</li>
		<li>Handle network errors gracefully</li>
		<li>Cache validation results when appropriate</li>
		<li>Provide fallback validation for offline scenarios</li>
	</ul>
	<h1>Validation Performance</h1>
	<p>
		Optimize validation performance to ensure smooth user experience even with complex validation
		rules and large forms.
	</p>

	<h1>Optimization Strategies</h1>
	<ul>
		<li><strong>Debouncing</strong>: Delay validation until user stops typing</li>
		<li><strong>Memoization</strong>: Cache validation results for repeated values</li>
		<li><strong>Lazy validation</strong>: Only validate visible or active fields</li>
		<li><strong>Prioritization</strong>: Run fast validations before slow ones</li>
		<li><strong>Cancellation</strong>: Cancel pending validations when no longer needed</li>
	</ul>

	<!-- Next Steps -->
	<section data-card-cta>
		<h2>Ready for more?</h2>
		<p>
			Now that you understand form validation, explore advanced form features, form layout options,
			or learn about input components.
		</p>
		<span>
			<a href="/forms/advanced" class="button is-primary">
				Advanced Features
				<span class="ml-2">→</span>
			</a>
			<a href="/input/inputfield" class="button is-primary">
				Input Components
				<span class="ml-2">→</span>
			</a>
		</span>
	</section>
</article>
