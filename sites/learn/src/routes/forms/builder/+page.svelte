<script>
	import { FormBuilder, FormRenderer } from '@rokkit/forms'

	// Example 1: Basic Data-Driven Form
	let basicData = {
		name: 'John Doe',
		email: 'john@example.com',
		age: 28,
		subscribe: true
	}

	// Example 2: Form with Custom Schema
	let schemaData = {
		username: '',
		password: '',
		confirmPassword: '',
		role: 'user'
	}

	const customSchema = {
		type: 'object',
		properties: {
			username: {
				type: 'string',
				required: true,
				minLength: 3,
				maxLength: 20
			},
			password: {
				type: 'string',
				required: true,
				minLength: 8
			},
			confirmPassword: {
				type: 'string',
				required: true,
				minLength: 8
			},
			role: {
				type: 'string',
				enum: ['admin', 'user', 'moderator']
			}
		}
	}

	// Example 3: Form with Custom Layout
	let layoutData = {
		firstName: 'Jane',
		lastName: 'Smith',
		birthDate: '1990-05-15',
		country: 'US',
		bio: 'Software developer passionate about creating great user experiences.'
	}

	const customLayout = {
		type: 'vertical',
		elements: [
			{
				label: 'Personal Information',
				type: 'group',
				elements: [
					{ label: 'First Name', scope: '#/firstName' },
					{ label: 'Last Name', scope: '#/lastName' },
					{ label: 'Birth Date', scope: '#/birthDate' }
				]
			},
			{ label: 'Country', scope: '#/country' },
			{ label: 'Biography', scope: '#/bio' }
		]
	}

	// Create FormBuilder instances
	let basicBuilder = new FormBuilder(basicData)
	let schemaBuilder = new FormBuilder(schemaData, customSchema)
	let layoutBuilder = new FormBuilder(layoutData, null, customLayout)

	// Handle form updates
	function handleBasicUpdate(data) {
		basicData = data
	}

	function handleSchemaUpdate(data) {
		schemaData = data
	}

	function handleLayoutUpdate(data) {
		layoutData = data
	}
</script>

<svelte:head>
	<title>FormBuilder - Forms Tutorial | Rokkit</title>
	<meta
		name="description"
		content="Learn how to create forms automatically from data objects with schema and layout derivation"
	/>
</svelte:head>

<div class="bg-neutral-50 dark:bg-neutral-900">
	<!-- Header -->
	<header class="border-b border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800">
		<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between">
				<div>
					<nav class="mb-2">
						<a
							href="/forms"
							class="text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm"
						>
							← Back to Tutorial
						</a>
					</nav>
					<h1 class="text-3xl font-bold text-neutral-900 dark:text-white">2. FormBuilder</h1>
					<p class="mt-2 text-neutral-600 dark:text-neutral-400">
						Create forms automatically from data objects with schema and layout derivation
					</p>
				</div>
			</div>
		</div>
	</header>

	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<!-- Tutorial Steps -->
		<div class="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
			<div class="rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800">
				<div class="flex items-center">
					<div
						class="bg-primary-100 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 flex h-8 w-8 items-center justify-center rounded-full"
					>
						1
					</div>
					<h3 class="ml-3 text-lg font-medium text-neutral-900 dark:text-white">
						Automatic Derivation
					</h3>
				</div>
				<p class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
					FormBuilder automatically creates schema and layout from your data object
				</p>
			</div>

			<div class="rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800">
				<div class="flex items-center">
					<div
						class="bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400 flex h-8 w-8 items-center justify-center rounded-full dark:opacity-20"
					>
						2
					</div>
					<h3 class="ml-3 text-lg font-medium text-neutral-900 dark:text-white">Custom Schema</h3>
				</div>
				<p class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
					Override with custom validation rules and constraints
				</p>
			</div>

			<div class="rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800">
				<div class="flex items-center">
					<div
						class="bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400 flex h-8 w-8 items-center justify-center rounded-full dark:opacity-20"
					>
						3
					</div>
					<h3 class="ml-3 text-lg font-medium text-neutral-900 dark:text-white">Custom Layout</h3>
				</div>
				<p class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
					Control field ordering, grouping, and display properties
				</p>
			</div>
		</div>

		<!-- Examples -->
		<div class="space-y-12">
			<!-- Example 1: Basic Data-Driven Form -->
			<section>
				<h2 class="mb-6 text-2xl font-semibold text-neutral-900 dark:text-white">
					1. Basic Data-Driven Form
				</h2>

				<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
					<div>
						<h3 class="mb-4 text-lg font-medium text-neutral-900 dark:text-white">Live Form</h3>
						<div class="rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800">
							<FormRenderer builder={basicBuilder} onupdate={handleBasicUpdate} />
						</div>
					</div>

					<div class="space-y-6">
						<div>
							<h3 class="mb-4 text-lg font-medium text-neutral-900 dark:text-white">Usage</h3>
							<div class="rounded-lg bg-neutral-100 p-4 dark:bg-neutral-700">
								<p class="text-sm text-neutral-700 dark:text-neutral-300">
									FormBuilder automatically analyzes your data object and creates appropriate input
									types. Example code will be added when the component is available.
								</p>
							</div>
						</div>

						<div>
							<h3 class="mb-4 text-lg font-medium text-neutral-900 dark:text-white">
								Current Data
							</h3>
							<div class="rounded-lg bg-neutral-100 p-4 dark:bg-neutral-700">
								<pre class="text-sm text-neutral-700 dark:text-neutral-300">{JSON.stringify(
										basicData,
										null,
										2
									)}</pre>
							</div>
						</div>
					</div>
				</div>

				<div class="mt-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
					<div class="flex">
						<div class="text-blue-400">
							<span class="text-lg">ℹ</span>
						</div>
						<div class="ml-3">
							<h4 class="text-sm font-medium text-blue-800 dark:text-blue-200">How it works</h4>
							<p class="mt-1 text-sm text-blue-700 dark:text-blue-300">
								FormBuilder analyzes your data object and automatically creates appropriate input
								types: strings become text inputs, numbers become number inputs, booleans become
								checkboxes.
							</p>
						</div>
					</div>
				</div>
			</section>

			<!-- Example 2: Custom Schema -->
			<section>
				<h2 class="mb-6 text-2xl font-semibold text-neutral-900 dark:text-white">
					2. Custom Schema with Validation
				</h2>

				<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
					<div>
						<h3 class="mb-4 text-lg font-medium text-neutral-900 dark:text-white">Live Form</h3>
						<div class="rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800">
							<FormRenderer builder={schemaBuilder} onupdate={handleSchemaUpdate} />
						</div>
					</div>

					<div class="space-y-6">
						<div>
							<h3 class="mb-4 text-lg font-medium text-neutral-900 dark:text-white">
								Schema Definition
							</h3>
							<div class="rounded-lg bg-neutral-100 p-4 dark:bg-neutral-700">
								<p class="text-sm text-neutral-700 dark:text-neutral-300">
									Custom schemas add validation rules, constraints, and enum options. The
									FormBuilder maps these to appropriate input attributes like min, max, required,
									and options. Example code will be added when the component is available.
								</p>
							</div>
						</div>

						<div>
							<h3 class="mb-4 text-lg font-medium text-neutral-900 dark:text-white">
								Current Data
							</h3>
							<div class="rounded-lg bg-neutral-100 p-4 dark:bg-neutral-700">
								<pre class="text-sm text-neutral-700 dark:text-neutral-300">{JSON.stringify(
										schemaData,
										null,
										2
									)}</pre>
							</div>
						</div>
					</div>
				</div>

				<div class="mt-6 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
					<div class="flex">
						<div class="text-green-400">
							<span class="text-lg">✓</span>
						</div>
						<div class="ml-3">
							<h4 class="text-sm font-medium text-green-800 dark:text-green-200">
								Schema Benefits
							</h4>
							<p class="mt-1 text-sm text-green-700 dark:text-green-300">
								Custom schemas add validation rules, constraints, and enum options. The FormBuilder
								maps these to appropriate input attributes like min, max, required, and options.
							</p>
						</div>
					</div>
				</div>
			</section>

			<!-- Example 3: Custom Layout -->
			<section>
				<h2 class="mb-6 text-2xl font-semibold text-neutral-900 dark:text-white">
					3. Custom Layout Control
				</h2>

				<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
					<div>
						<h3 class="mb-4 text-lg font-medium text-neutral-900 dark:text-white">Live Form</h3>
						<div class="rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800">
							<FormRenderer builder={layoutBuilder} onupdate={handleLayoutUpdate} />
						</div>
					</div>

					<div class="space-y-6">
						<div>
							<h3 class="mb-4 text-lg font-medium text-neutral-900 dark:text-white">
								Layout Definition
							</h3>
							<div class="rounded-lg bg-neutral-100 p-4 dark:bg-neutral-700">
								<p class="text-sm text-neutral-700 dark:text-neutral-300">
									Custom layouts control field ordering, grouping, labels, and descriptions. Use
									JSON Pointer notation (#/fieldName) to reference data properties. Example code
									will be added when the component is available.
								</p>
							</div>
						</div>

						<div>
							<h3 class="mb-4 text-lg font-medium text-neutral-900 dark:text-white">
								Current Data
							</h3>
							<div class="rounded-lg bg-neutral-100 p-4 dark:bg-neutral-700">
								<pre class="text-sm text-neutral-700 dark:text-neutral-300">{JSON.stringify(
										layoutData,
										null,
										2
									)}</pre>
							</div>
						</div>
					</div>
				</div>

				<div class="mt-6 rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
					<div class="flex">
						<div class="text-purple-400">
							<span class="text-lg">⚙</span>
						</div>
						<div class="ml-3">
							<h4 class="text-sm font-medium text-purple-800 dark:text-purple-200">
								Layout Flexibility
							</h4>
							<p class="mt-1 text-sm text-purple-700 dark:text-purple-300">
								Custom layouts let you control field ordering, grouping, labels, and descriptions.
								Use JSON Pointer notation (#/fieldName) to reference data properties.
							</p>
						</div>
					</div>
				</div>
			</section>

			<!-- FormBuilder API -->
			<section>
				<h2 class="mb-6 text-2xl font-semibold text-neutral-900 dark:text-white">
					FormBuilder API
				</h2>

				<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
					<div class="rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800">
						<h3 class="mb-4 text-lg font-medium text-neutral-900 dark:text-white">Constructor</h3>
						<div class="space-y-3 text-sm">
							<div>
								<code class="rounded bg-neutral-100 px-2 py-1 dark:bg-neutral-700">
									new FormBuilder(data, schema?, layout?)
								</code>
							</div>
							<ul class="space-y-2 text-neutral-600 dark:text-neutral-400">
								<li>• <strong>data:</strong> Initial data object</li>
								<li>• <strong>schema:</strong> Optional validation schema</li>
								<li>• <strong>layout:</strong> Optional layout configuration</li>
							</ul>
						</div>
					</div>

					<div class="rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800">
						<h3 class="mb-4 text-lg font-medium text-neutral-900 dark:text-white">Key Methods</h3>
						<div class="space-y-3 text-sm">
							<div>
								<code class="rounded bg-neutral-100 px-2 py-1 dark:bg-neutral-700">
									updateField(path, value)
								</code>
								<p class="mt-1 text-neutral-600 dark:text-neutral-400">
									Update a specific field value
								</p>
							</div>
							<div>
								<code class="rounded bg-neutral-100 px-2 py-1 dark:bg-neutral-700">
									getValue(path)
								</code>
								<p class="mt-1 text-neutral-600 dark:text-neutral-400">Get a field value by path</p>
							</div>
							<div>
								<code class="rounded bg-neutral-100 px-2 py-1 dark:bg-neutral-700">
									setFieldValidation(path, message)
								</code>
								<p class="mt-1 text-neutral-600 dark:text-neutral-400">
									Set validation message for field
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			<!-- Next Steps -->
			<section>
				<div class="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-8">
					<div class="text-center">
						<h2 class="mb-4 text-xl font-semibold text-neutral-900 dark:text-white">
							Ready for the Next Step?
						</h2>
						<p class="mb-6 text-neutral-600 dark:text-neutral-400">
							Now that you understand FormBuilder, let's explore FormRenderer and how to customize
							form rendering with snippets.
						</p>
						<div class="flex justify-center space-x-4">
							<a
								href="/forms/inputs"
								class="inline-flex items-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
							>
								<span class="mr-2">←</span>
								Previous: Input Components
							</a>
							<a
								href="/forms/renderer"
								class="bg-primary-600 hover:bg-primary-700 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white"
							>
								Next: FormRenderer
								<span class="ml-2">→</span>
							</a>
						</div>
					</div>
				</div>
			</section>
		</div>
	</div>
</div>
