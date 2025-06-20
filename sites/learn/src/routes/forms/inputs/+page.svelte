<script>
	// Simplified forms tutorial without external dependencies for now

	let inputValues = {
		text: 'Hello World',
		email: 'user@example.com',
		password: '',
		number: 42,
		range: 50,
		checkbox: true,
		textarea: 'This is a multi-line text area example.',
		select: 'option2',
		date: '2024-01-15',
		color: '#3b82f6'
	}

	/** @type {{state: string, text: string} | null} */
	let message = null

	// Example validation message
	/**
	 * @param {string} type
	 */
	function showValidationExample(type) {
		message = {
			state: type,
			text:
				type === 'error'
					? 'This field is required'
					: type === 'warning'
						? 'This value might need attention'
						: type === 'info'
							? 'Helpful information about this field'
							: 'Field validated successfully'
		}
	}

	function clearMessage() {
		message = null
	}

	const selectOptions = [
		{ value: 'option1', label: 'First Option' },
		{ value: 'option2', label: 'Second Option' },
		{ value: 'option3', label: 'Third Option' }
	]
</script>

<svelte:head>
	<title>Input Components - Forms Tutorial | Rokkit</title>
	<meta
		name="description"
		content="Learn about universal Input components with labels, validation, and styling"
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
					<h1 class="text-3xl font-bold text-neutral-900 dark:text-white">1. Input Components</h1>
					<p class="mt-2 text-neutral-600 dark:text-neutral-400">
						Universal Input wrapper with labels, validation, and type-aware layouts
					</p>
				</div>
			</div>
		</div>
	</header>

	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
			<!-- Left Column: Examples -->
			<div class="space-y-8">
				<!-- Basic Input Types -->
				<section>
					<h2 class="mb-6 text-2xl font-semibold text-neutral-900 dark:text-white">
						Basic Input Types
					</h2>

					<div class="space-y-6 rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800">
						<!-- Text Input -->
						<div>
							<h3 class="mb-4 text-lg font-medium text-neutral-900 dark:text-white">Text Input</h3>
							<div class="space-y-2">
								<label
									for="text-input"
									class="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
								>
									Full Name
								</label>
								<input
									id="text-input"
									type="text"
									bind:value={inputValues.text}
									placeholder="John Doe"
									class="focus:border-primary-500 focus:ring-primary-500 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
								/>
								<p class="text-xs text-neutral-600 dark:text-neutral-400">
									Enter your complete name
								</p>
							</div>
						</div>

						<!-- Email Input -->
						<div>
							<h3 class="mb-4 text-lg font-medium text-neutral-900 dark:text-white">Email Input</h3>
							<div class="space-y-2">
								<label
									for="email-input"
									class="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
								>
									Email Address *
								</label>
								<input
									id="email-input"
									type="email"
									bind:value={inputValues.email}
									placeholder="user@example.com"
									required
									class="focus:border-primary-500 focus:ring-primary-500 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
								/>
								<p class="text-xs text-neutral-600 dark:text-neutral-400">
									We'll never share your email
								</p>
							</div>
						</div>

						<!-- Password Input -->
						<div>
							<h3 class="mb-4 text-lg font-medium text-neutral-900 dark:text-white">
								Password Input
							</h3>
							<div class="space-y-2">
								<label
									for="password-input"
									class="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
								>
									Password *
								</label>
								<input
									id="password-input"
									type="password"
									bind:value={inputValues.password}
									placeholder="Enter password"
									required
									minlength="8"
									class="focus:border-primary-500 focus:ring-primary-500 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
								/>
								<p class="text-xs text-neutral-600 dark:text-neutral-400">
									Must be at least 8 characters
								</p>
							</div>
						</div>
					</div>
				</section>

				<!-- Number and Range Inputs -->
				<section>
					<h2 class="mb-6 text-2xl font-semibold text-neutral-900 dark:text-white">
						Number & Range Inputs
					</h2>

					<div class="space-y-6 rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800">
						<!-- Number Input -->
						<div>
							<h3 class="mb-4 text-lg font-medium text-neutral-900 dark:text-white">
								Number Input
							</h3>
							<div class="space-y-2">
								<label
									for="number-input"
									class="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
								>
									Age
								</label>
								<input
									id="number-input"
									type="number"
									bind:value={inputValues.number}
									min="18"
									max="99"
									step="1"
									class="focus:border-primary-500 focus:ring-primary-500 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
								/>
								<p class="text-xs text-neutral-600 dark:text-neutral-400">
									Must be between 18 and 99
								</p>
							</div>
						</div>

						<!-- Range Input -->
						<div>
							<h3 class="mb-4 text-lg font-medium text-neutral-900 dark:text-white">
								Range Slider
							</h3>
							<div class="space-y-2">
								<label
									for="range-input"
									class="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
								>
									Volume Level
								</label>
								<input
									id="range-input"
									type="range"
									bind:value={inputValues.range}
									min="0"
									max="100"
									step="5"
									class="w-full"
								/>
								<p class="text-xs text-neutral-600 dark:text-neutral-400">
									Current value: {inputValues.range}
								</p>
							</div>
						</div>
					</div>
				</section>

				<!-- Selection Inputs -->
				<section>
					<h2 class="mb-6 text-2xl font-semibold text-neutral-900 dark:text-white">
						Selection Inputs
					</h2>

					<div class="space-y-6 rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800">
						<!-- Checkbox -->
						<div>
							<h3 class="mb-4 text-lg font-medium text-neutral-900 dark:text-white">Checkbox</h3>
							<div class="flex items-center space-x-2">
								<input
									id="checkbox-input"
									type="checkbox"
									bind:checked={inputValues.checkbox}
									class="text-primary-600 focus:ring-primary-500 h-4 w-4 rounded border-neutral-300 dark:border-neutral-600 dark:bg-neutral-700"
								/>
								<label for="checkbox-input" class="text-sm text-neutral-700 dark:text-neutral-300">
									Subscribe to newsletter
								</label>
							</div>
							<p class="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
								Receive updates about new features
							</p>
						</div>

						<!-- Select -->
						<div>
							<h3 class="mb-4 text-lg font-medium text-neutral-900 dark:text-white">
								Select Dropdown
							</h3>
							<div class="space-y-2">
								<label
									for="select-input"
									class="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
								>
									Choose Option
								</label>
								<select
									id="select-input"
									bind:value={inputValues.select}
									class="focus:border-primary-500 focus:ring-primary-500 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
								>
									{#each selectOptions as option, index (index)}
										<option value={option.value}>{option.label}</option>
									{/each}
								</select>
								<p class="text-xs text-neutral-600 dark:text-neutral-400">
									Select one of the available options
								</p>
							</div>
						</div>
					</div>
				</section>

				<!-- Validation Demo -->
				<section>
					<h2 class="mb-6 text-2xl font-semibold text-neutral-900 dark:text-white">
						Validation Messages
					</h2>

					<div class="space-y-6 rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800">
						<div>
							<h3 class="mb-4 text-lg font-medium text-neutral-900 dark:text-white">
								Message Types
							</h3>

							<div class="space-y-2">
								<label
									for="demo-input"
									class="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
								>
									Validation Demo
								</label>
								<input
									id="demo-input"
									type="text"
									value="Demo Field"
									readonly
									class="focus:border-primary-500 focus:ring-primary-500 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 dark:bg-neutral-700 dark:text-white"
									class:border-red-300={message && message.state === 'error'}
									class:border-yellow-300={message && message.state === 'warning'}
									class:border-blue-300={message && message.state === 'info'}
									class:border-green-300={message && message.state === 'success'}
									class:border-neutral-300={!message}
									class:dark:border-neutral-600={!message}
								/>
								<p class="text-xs text-neutral-600 dark:text-neutral-400">
									Try different message types below
								</p>

								{#if message}
									<div
										class="text-xs"
										class:text-red-600={message.state === 'error'}
										class:text-yellow-600={message.state === 'warning'}
										class:text-blue-600={message.state === 'info'}
										class:text-green-600={message.state === 'success'}
									>
										{message.text}
									</div>
								{/if}
							</div>

							<div class="mt-4 flex flex-wrap gap-2">
								<button
									onclick={() => showValidationExample('error')}
									class="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
								>
									Show Error
								</button>
								<button
									onclick={() => showValidationExample('warning')}
									class="rounded bg-yellow-600 px-3 py-1 text-sm text-white hover:bg-yellow-700"
								>
									Show Warning
								</button>
								<button
									onclick={() => showValidationExample('info')}
									class="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
								>
									Show Info
								</button>
								<button
									onclick={() => showValidationExample('success')}
									class="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
								>
									Show Success
								</button>
								<button
									onclick={clearMessage}
									class="rounded bg-neutral-600 px-3 py-1 text-sm text-white hover:bg-neutral-700"
								>
									Clear
								</button>
							</div>
						</div>
					</div>
				</section>
			</div>

			<!-- Right Column: Documentation -->
			<div class="space-y-8">
				<!-- Current Values -->
				<section>
					<h2 class="mb-4 text-xl font-semibold text-neutral-900 dark:text-white">Live Values</h2>
					<div class="rounded-lg bg-neutral-100 p-4 dark:bg-neutral-700">
						<pre class="text-sm text-neutral-700 dark:text-neutral-300">{JSON.stringify(
								inputValues,
								null,
								2
							)}</pre>
					</div>
				</section>

				<!-- Key Features -->
				<section>
					<h2 class="mb-4 text-xl font-semibold text-neutral-900 dark:text-white">Key Features</h2>
					<div class="rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800">
						<ul class="space-y-3 text-sm text-neutral-700 dark:text-neutral-300">
							<li class="flex items-start">
								<div class="mr-2 mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-green-500"></div>
								<span><strong>Universal wrapper:</strong> Single component for all input types</span
								>
							</li>
							<li class="flex items-start">
								<div class="mr-2 mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-green-500"></div>
								<span><strong>Enhanced properties:</strong> Labels, descriptions, and messages</span
								>
							</li>
							<li class="flex items-start">
								<div class="mr-2 mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-green-500"></div>
								<span
									><strong>Type-aware layouts:</strong> Different layouts for different input types</span
								>
							</li>
							<li class="flex items-start">
								<div class="mr-2 mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-green-500"></div>
								<span
									><strong>Validation integration:</strong> Built-in message display with states</span
								>
							</li>
							<li class="flex items-start">
								<div class="mr-2 mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-green-500"></div>
								<span
									><strong>Accessibility support:</strong> ARIA attributes and proper labels</span
								>
							</li>
							<li class="flex items-start">
								<div class="mr-2 mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-green-500"></div>
								<span><strong>Flexible styling:</strong> Custom classes and properties</span>
							</li>
						</ul>
					</div>
				</section>

				<!-- Architecture Overview -->
				<section>
					<h2 class="mb-4 text-xl font-semibold text-neutral-900 dark:text-white">
						Input Component Architecture
					</h2>
					<div class="rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800">
						<div class="space-y-4 text-sm text-neutral-700 dark:text-neutral-300">
							<div>
								<h4 class="font-medium text-neutral-900 dark:text-white">Universal Wrapper</h4>
								<p>
									Single Input.svelte component handles all HTML input types with consistent API
								</p>
							</div>
							<div>
								<h4 class="font-medium text-neutral-900 dark:text-white">Enhanced Properties</h4>
								<p>
									Built-in support for labels, descriptions, validation messages, and custom styling
								</p>
							</div>
							<div>
								<h4 class="font-medium text-neutral-900 dark:text-white">Type-Aware Layouts</h4>
								<p>
									Different rendering patterns for checkboxes, standard inputs, and custom
									components
								</p>
							</div>
							<div>
								<h4 class="font-medium text-neutral-900 dark:text-white">Message System</h4>
								<p>
									Structured validation messages with state (error, warning, info, success) and text
									content
								</p>
							</div>
						</div>
					</div>
				</section>

				<!-- Usage Example -->
				<section>
					<h2 class="mb-4 text-xl font-semibold text-neutral-900 dark:text-white">Usage Example</h2>
					<div class="rounded-lg bg-neutral-100 p-4 dark:bg-neutral-700">
						<p class="text-sm text-neutral-700 dark:text-neutral-300">
							The Input component provides a universal wrapper for all HTML input types with
							enhanced features like labels, descriptions, and validation messages. Example usage
							will be added when the component is available.
						</p>
					</div>
				</section>

				<!-- Message Types -->
				<section>
					<h2 class="mb-4 text-xl font-semibold text-neutral-900 dark:text-white">Message Types</h2>
					<div class="rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800">
						<div class="space-y-3">
							<div class="flex items-center">
								<div class="mr-3 h-3 w-3 rounded-full bg-red-500"></div>
								<span class="text-sm"
									><strong>error:</strong> Validation failures, required fields</span
								>
							</div>
							<div class="flex items-center">
								<div class="mr-3 h-3 w-3 rounded-full bg-yellow-500"></div>
								<span class="text-sm"
									><strong>warning:</strong> Potential issues, format suggestions</span
								>
							</div>
							<div class="flex items-center">
								<div class="mr-3 h-3 w-3 rounded-full bg-blue-500"></div>
								<span class="text-sm"><strong>info:</strong> Helpful hints, character counts</span>
							</div>
							<div class="flex items-center">
								<div class="mr-3 h-3 w-3 rounded-full bg-green-500"></div>
								<span class="text-sm"
									><strong>success:</strong> Confirmation messages, validation passed</span
								>
							</div>
						</div>
					</div>
				</section>

				<!-- Next Steps -->
				<section>
					<h2 class="mb-4 text-xl font-semibold text-neutral-900 dark:text-white">Next Steps</h2>
					<div class="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-6">
						<p class="mb-4 text-sm text-neutral-700 dark:text-neutral-300">
							Now that you understand Input components, let's explore how to create forms
							automatically from data objects.
						</p>
						<a
							href="/forms/builder"
							class="bg-primary-600 hover:bg-primary-700 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white"
						>
							Continue to FormBuilder
							<span class="ml-2">→</span>
						</a>
					</div>
				</section>
			</div>
		</div>
	</div>
</div>
