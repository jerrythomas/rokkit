<script>
	// @ts-nocheck
	import { FormRenderer, InfoField, FormBuilder, StatusList, StepIndicator } from '@rokkit/forms'
	import { Button } from '@rokkit/ui'
	import PlaySection from '$lib/components/PlaySection.svelte'

	// ── Travel Planner Data ────────────────────────────────────
	const flights = [
		{
			airline: 'SkyWest Air',
			flight: 'SW-201',
			departure: '2026-03-15T08:00:00',
			arrival: '2026-03-15T14:30:00',
			duration: 390,
			price: 450,
			stops: 0
		},
		{
			airline: 'Pacific Lines',
			flight: 'PL-455',
			departure: '2026-03-15T10:30:00',
			arrival: '2026-03-15T18:00:00',
			duration: 450,
			price: 320,
			stops: 1
		},
		{
			airline: 'Atlas Airways',
			flight: 'AA-789',
			departure: '2026-03-15T14:00:00',
			arrival: '2026-03-15T19:15:00',
			duration: 315,
			price: 580,
			stops: 0
		},
		{
			airline: 'NorthStar',
			flight: 'NS-102',
			departure: '2026-03-15T06:00:00',
			arrival: '2026-03-15T13:45:00',
			duration: 465,
			price: 275,
			stops: 2
		}
	]

	const hotels = [
		{
			name: 'Grand Plaza Hotel',
			location: 'Downtown',
			rating: 4.5,
			pricePerNight: 189,
			amenities: 'Pool, Spa, Gym'
		},
		{
			name: 'Seaside Resort',
			location: 'Beachfront',
			rating: 4.8,
			pricePerNight: 320,
			amenities: 'Beach, Pool, Restaurant'
		},
		{
			name: 'City Budget Inn',
			location: 'Midtown',
			rating: 3.9,
			pricePerNight: 89,
			amenities: 'WiFi, Breakfast'
		},
		{
			name: 'The Skyline Suite',
			location: 'Financial District',
			rating: 4.2,
			pricePerNight: 245,
			amenities: 'Rooftop Bar, Gym, Spa'
		}
	]

	const itinerary = {
		destination: 'San Francisco',
		dates: 'Mar 15–20, 2026',
		travelers: 2,
		totalFlights: '$900',
		totalHotel: '$945',
		grandTotal: '$1,845'
	}

	const activities = [
		{ activity: 'Golden Gate Bridge Tour', date: '2026-03-16', cost: 35 },
		{ activity: 'Alcatraz Island Visit', date: '2026-03-17', cost: 45 },
		{ activity: "Fisherman's Wharf", date: '2026-03-18', cost: 0 },
		{ activity: 'Cable Car Ride', date: '2026-03-19', cost: 8 }
	]

	// ── Active demo tab ────────────────────────────────────────
	let activeDemo = $state('input')

	// ── Demo 1: Basic Input Form ───────────────────────────────
	let travelerData = $state({
		firstName: 'Jane',
		lastName: 'Smith',
		email: 'jane@example.com',
		phone: '',
		travelers: 2,
		travelClass: 'economy',
		notes: ''
	})

	const travelerSchema = {
		type: 'object',
		properties: {
			firstName: { type: 'string', minLength: 1 },
			lastName: { type: 'string', minLength: 1 },
			email: { type: 'string', format: 'email' },
			phone: { type: 'string' },
			travelers: { type: 'integer', minimum: 1, maximum: 10 },
			travelClass: { type: 'string', enum: ['economy', 'premium', 'business', 'first'] },
			notes: { type: 'string' }
		},
		required: ['firstName', 'lastName', 'email']
	}

	const travelerLayout = {
		type: 'vertical',
		elements: [
			{ scope: '#/firstName', label: 'First Name', props: { placeholder: 'Enter first name' } },
			{ scope: '#/lastName', label: 'Last Name', props: { placeholder: 'Enter last name' } },
			{ scope: '#/email', label: 'Email', props: { placeholder: 'email@example.com' } },
			{ scope: '#/phone', label: 'Phone', props: { placeholder: '+1 (555) 000-0000' } },
			{ type: 'separator' },
			{ scope: '#/travelers', label: 'Number of Travelers' },
			{ scope: '#/travelClass', label: 'Travel Class', props: { renderer: 'toggle' } },
			{
				scope: '#/notes',
				label: 'Notes',
				props: { renderer: 'textarea', placeholder: 'Special requests...' }
			}
		]
	}

	// ── Demo 2: Pick a Flight (display-table with selection) ──
	let selectedFlight = $state(undefined)

	const flightData = $state({ flights })

	const flightLayout = {
		type: 'vertical',
		elements: [
			{
				type: 'display-table',
				scope: '#/flights',
				title: 'Available Flights — San Francisco',
				select: 'one',
				columns: [
					{ key: 'airline', label: 'Airline' },
					{ key: 'flight', label: 'Flight' },
					{ key: 'departure', label: 'Departs', format: 'datetime' },
					{ key: 'duration', label: 'Duration', format: 'duration' },
					{ key: 'stops', label: 'Stops' },
					{ key: 'price', label: 'Price', format: 'currency' }
				]
			}
		]
	}

	// ── Demo 3: Hotel Cards (display-cards with selection) ────
	let selectedHotel = $state(undefined)

	const hotelData = $state({ hotels })

	const hotelLayout = {
		type: 'vertical',
		elements: [
			{
				type: 'display-cards',
				scope: '#/hotels',
				title: 'Hotel Options',
				select: 'one',
				fields: [
					{ key: 'name', label: 'Hotel' },
					{ key: 'location', label: 'Location' },
					{ key: 'rating', label: 'Rating', format: 'number' },
					{ key: 'pricePerNight', label: 'Per Night', format: 'currency' },
					{ key: 'amenities', label: 'Amenities' }
				]
			}
		]
	}

	// ── Demo 4: Itinerary Review (display-section + display-list) ──
	const reviewData = $state({ itinerary, activities })

	const reviewLayout = {
		type: 'vertical',
		elements: [
			{
				type: 'display-section',
				scope: '#/itinerary',
				title: 'Trip Summary',
				fields: [
					{ key: 'destination', label: 'Destination' },
					{ key: 'dates', label: 'Travel Dates' },
					{ key: 'travelers', label: 'Travelers', format: 'number' },
					{ key: 'totalFlights', label: 'Flights' },
					{ key: 'totalHotel', label: 'Hotel (5 nights)' },
					{ key: 'grandTotal', label: 'Grand Total' }
				]
			},
			{ type: 'separator' },
			{
				type: 'display-list',
				scope: '#/activities',
				title: 'Planned Activities',
				fields: [
					{ key: 'activity', label: 'Activity' },
					{ key: 'date', label: 'Date' },
					{ key: 'cost', label: 'Cost', format: 'currency' }
				]
			}
		]
	}

	// ── Demo 5: Mixed Layout (display + input) ─────────────────
	let bookingData = $state({
		summary: {
			flight: 'SkyWest Air SW-201',
			hotel: 'Grand Plaza Hotel (5 nights)',
			total: 1845
		},
		cardName: '',
		cardNumber: '',
		agreeTerms: false
	})

	const bookingSchema = {
		type: 'object',
		properties: {
			cardName: { type: 'string', minLength: 1 },
			cardNumber: { type: 'string', minLength: 16 },
			agreeTerms: { type: 'boolean' }
		},
		required: ['cardName', 'cardNumber']
	}

	const bookingLayout = {
		type: 'vertical',
		elements: [
			{
				type: 'display-section',
				scope: '#/summary',
				title: 'Booking Summary',
				fields: [
					{ key: 'flight', label: 'Flight' },
					{ key: 'hotel', label: 'Hotel' },
					{ key: 'total', label: 'Total', format: 'currency' }
				]
			},
			{ type: 'separator' },
			{
				scope: '#/cardName',
				label: 'Name on Card',
				props: { placeholder: 'Full name as on card' }
			},
			{
				scope: '#/cardNumber',
				label: 'Card Number',
				props: { placeholder: '4242 4242 4242 4242' }
			},
			{ scope: '#/agreeTerms', label: 'I agree to the terms and conditions' }
		]
	}

	// ── Demo: Multi-Step ──────────────────────────────────────
	let stepData = $state({})

	const stepSchema = {
		type: 'object',
		properties: {
			firstName: { type: 'string', required: true },
			lastName: { type: 'string' },
			email: { type: 'string', required: true, format: 'email' },
			company: { type: 'string' },
			plan: { type: 'string', required: true, enum: ['starter', 'pro', 'enterprise'] },
			billing: { type: 'string', required: true, enum: ['monthly', 'annual'] }
		}
	}

	const stepLayout = {
		type: 'vertical',
		elements: [
			{
				type: 'step',
				label: 'Personal Info',
				elements: [
					{ scope: '#/firstName', label: 'First Name', props: { placeholder: 'Required' } },
					{ scope: '#/lastName', label: 'Last Name', props: { placeholder: 'Optional' } },
					{ scope: '#/email', label: 'Email', props: { placeholder: 'Required, must be valid' } }
				]
			},
			{
				type: 'step',
				label: 'Organization',
				elements: [{ scope: '#/company', label: 'Company Name', props: { placeholder: 'Optional' } }]
			},
			{
				type: 'step',
				label: 'Plan',
				elements: [
					{ scope: '#/plan', label: 'Plan', props: { renderer: 'toggle' } },
					{ scope: '#/billing', label: 'Billing Cycle', props: { renderer: 'toggle' } }
				]
			}
		]
	}

	const stepBuilder = new FormBuilder(stepData, stepSchema, stepLayout)
	let stepSubmitted = $state(null)

	async function handleStepSubmit(data) {
		await new Promise((resolve) => setTimeout(resolve, 500))
		stepSubmitted = data
	}

	// ── Validation demo ────────────────────────────────────────
	let validationBuilder = new FormBuilder(
		{ name: '', email: 'bad-email', age: 5 },
		{
			type: 'object',
			properties: {
				name: { type: 'string', minLength: 2 },
				email: { type: 'string', format: 'email', minLength: 1 },
				age: { type: 'integer', minimum: 18, maximum: 120 }
			},
			required: ['name', 'email']
		},
		{
			type: 'vertical',
			elements: [
				{ scope: '#/name', label: 'Full Name', props: { placeholder: 'Required, min 2 chars' } },
				{ scope: '#/email', label: 'Email Address', props: { placeholder: 'Must be valid email' } },
				{ scope: '#/age', label: 'Age', props: { placeholder: 'Must be 18+' } }
			]
		}
	)

	function runValidation() {
		validationBuilder.validate()
	}

	// ── Demo 7: Dirty Tracking ─────────────────────────────────
	let dirtyBuilder = new FormBuilder(
		{ name: 'Alice', email: 'alice@example.com', role: 'Engineer' },
		{
			type: 'object',
			properties: {
				name: { type: 'string' },
				email: { type: 'string', format: 'email' },
				role: { type: 'string', enum: ['Engineer', 'Designer', 'Manager', 'Analyst'] }
			}
		},
		{
			type: 'vertical',
			elements: [
				{ scope: '#/name', label: 'Name', props: { placeholder: 'Full name' } },
				{ scope: '#/email', label: 'Email' },
				{ scope: '#/role', label: 'Role' }
			]
		}
	)

	// Reactive reads for dirty state (re-read on each render)
	let dirtyStatus = $derived(dirtyBuilder.isDirty)
	let dirtyFieldsList = $derived([...dirtyBuilder.dirtyFields])

	// ── Demo 8: Form Submission ──────────────────────────────
	let submitData = $state({
		name: '',
		email: '',
		message: ''
	})

	const submitSchema = {
		type: 'object',
		properties: {
			name: { type: 'string', required: true, minLength: 2 },
			email: { type: 'string', required: true, format: 'email' },
			message: { type: 'string', minLength: 10 }
		}
	}

	const submitLayout = {
		type: 'vertical',
		elements: [
			{ scope: '#/name', label: 'Your Name', props: { placeholder: 'Full name (required)' } },
			{ scope: '#/email', label: 'Email', props: { placeholder: 'email@example.com (required)' } },
			{
				scope: '#/message',
				label: 'Message',
				props: { renderer: 'textarea', placeholder: 'At least 10 characters...' }
			}
		]
	}

	let submitStatus = $state(null)

	async function handleFormSubmit(data) {
		submitStatus = null
		// Simulate async submission
		await new Promise((resolve) => setTimeout(resolve, 1500))
		submitStatus = `Submitted at ${new Date().toLocaleTimeString()}`
	}

	// ── Demo 9: Nested Form (groups) ──────────────────────────
	let nestedData = $state({
		firstName: 'Jane',
		lastName: 'Smith',
		address: {
			street: '123 Main Street',
			city: 'San Francisco',
			state: 'CA',
			zip: '94102'
		},
		emergency: {
			name: 'John Smith',
			phone: '+1 (555) 123-4567',
			relationship: 'Spouse'
		}
	})

	const nestedSchema = {
		type: 'object',
		properties: {
			firstName: { type: 'string', minLength: 1 },
			lastName: { type: 'string', minLength: 1 },
			address: {
				type: 'object',
				properties: {
					street: { type: 'string' },
					city: { type: 'string' },
					state: { type: 'string' },
					zip: { type: 'string' }
				}
			},
			emergency: {
				type: 'object',
				properties: {
					name: { type: 'string' },
					phone: { type: 'string' },
					relationship: { type: 'string', enum: ['Spouse', 'Parent', 'Sibling', 'Friend', 'Other'] }
				}
			}
		},
		required: ['firstName', 'lastName']
	}

	const nestedLayout = {
		type: 'vertical',
		elements: [
			{ scope: '#/firstName', label: 'First Name' },
			{ scope: '#/lastName', label: 'Last Name' },
			{ type: 'separator' },
			{
				scope: '#/address',
				label: 'Mailing Address',
				elements: [
					{ scope: '#/address/street', label: 'Street' },
					{ scope: '#/address/city', label: 'City' },
					{ scope: '#/address/state', label: 'State' },
					{ scope: '#/address/zip', label: 'ZIP Code' }
				]
			},
			{ type: 'separator' },
			{
				scope: '#/emergency',
				label: 'Emergency Contact',
				elements: [
					{ scope: '#/emergency/name', label: 'Contact Name' },
					{ scope: '#/emergency/phone', label: 'Phone' },
					{ scope: '#/emergency/relationship', label: 'Relationship' }
				]
			}
		]
	}
</script>

<PlaySection>
	{#snippet preview()}
		<div class="flex w-full max-w-[720px] flex-col gap-4 self-start p-2">
			<!-- Tab navigation -->
			<div class="flex flex-wrap gap-1">
				{#each [{ id: 'input', label: 'Input Form' }, { id: 'multistep', label: 'Multi-Step' }, { id: 'flights', label: 'Pick a Flight' }, { id: 'hotels', label: 'Hotel Cards' }, { id: 'review', label: 'Itinerary Review' }, { id: 'mixed', label: 'Mixed Layout' }, { id: 'validation', label: 'Validation' }, { id: 'nested', label: 'Nested Form' }, { id: 'submit', label: 'Submit' }, { id: 'dirty', label: 'Dirty Tracking' }] as tab (tab.id)}
					<Button
						label={tab.label}
						size="sm"
						variant={activeDemo === tab.id ? 'primary' : 'default'}
						style={activeDemo === tab.id ? 'default' : 'ghost'}
						onclick={() => (activeDemo = tab.id)}
					/>
				{/each}
			</div>

			<!-- Demo panels -->
			<div class="border-surface-z2 bg-surface rounded-lg border p-4">
				{#if activeDemo === 'input'}
					<h3 class="text-surface-z8 m-0 mb-3 text-sm font-semibold">Traveler Information</h3>
					<FormRenderer
						bind:data={travelerData}
						schema={travelerSchema}
						layout={travelerLayout}
						validateOn="blur"
					/>
				{:else if activeDemo === 'multistep'}
					<h3 class="text-surface-z8 m-0 mb-3 text-sm font-semibold">Account Registration</h3>
					<StepIndicator
						steps={stepLayout.elements.map((el) => el.label)}
						current={stepBuilder.currentStep}
						onclick={(i) => stepBuilder.goToStep(i)}
					/>
					<div class="mt-4">
						<FormRenderer builder={stepBuilder} validateOn="blur" onsubmit={handleStepSubmit} />
					</div>
					{#if stepSubmitted}
						<div class="bg-success-z1 text-success-z7 mt-3 rounded p-2 text-xs">
							Submitted successfully!
						</div>
					{/if}
				{:else if activeDemo === 'flights'}
					<h3 class="text-surface-z8 m-0 mb-3 text-sm font-semibold">Select Your Flight</h3>
					<FormRenderer
						data={flightData}
						layout={flightLayout}
						onselect={(v) => (selectedFlight = v)}
					/>
					{#if selectedFlight}
						<div class="bg-primary-z1 text-primary-z7 mt-3 rounded p-2 text-xs">
							Selected: {selectedFlight.airline}
							{selectedFlight.flight} — {new Intl.NumberFormat('en-US', {
								style: 'currency',
								currency: 'USD'
							}).format(selectedFlight.price)}
						</div>
					{/if}
				{:else if activeDemo === 'hotels'}
					<h3 class="text-surface-z8 m-0 mb-3 text-sm font-semibold">Choose Your Hotel</h3>
					<FormRenderer
						data={hotelData}
						layout={hotelLayout}
						onselect={(v) => (selectedHotel = v)}
					/>
					{#if selectedHotel}
						<div class="bg-primary-z1 text-primary-z7 mt-3 rounded p-2 text-xs">
							Selected: {selectedHotel.name} — {new Intl.NumberFormat('en-US', {
								style: 'currency',
								currency: 'USD'
							}).format(selectedHotel.pricePerNight)}/night
						</div>
					{/if}
				{:else if activeDemo === 'review'}
					<h3 class="text-surface-z8 m-0 mb-3 text-sm font-semibold">Review Your Itinerary</h3>
					<FormRenderer data={reviewData} layout={reviewLayout} />
				{:else if activeDemo === 'mixed'}
					<h3 class="text-surface-z8 m-0 mb-3 text-sm font-semibold">Complete Your Booking</h3>
					<FormRenderer
						bind:data={bookingData}
						schema={bookingSchema}
						layout={bookingLayout}
						validateOn="blur"
					/>
				{:else if activeDemo === 'validation'}
					<h3 class="text-surface-z8 m-0 mb-3 text-sm font-semibold">Validation Demo</h3>
					<FormRenderer builder={validationBuilder} validateOn="blur" />
					<div class="mt-3 flex items-center gap-2">
						<Button label="Validate All" size="sm" variant="primary" onclick={runValidation} />
						<span class="text-surface-z5 text-xs">
							{validationBuilder.isValid
								? 'All fields valid'
								: `${validationBuilder.errors.length} error(s)`}
						</span>
					</div>
					{#if validationBuilder.messages.length > 0}
						<div class="mt-3">
							<StatusList
								items={validationBuilder.messages}
								onclick={(path) => {
									const field = document.querySelector(`[data-scope="#/${path}"] input`)
									field?.focus()
								}}
							/>
						</div>
					{/if}
				{:else if activeDemo === 'submit'}
					<h3 class="text-surface-z8 m-0 mb-3 text-sm font-semibold">Contact Form (Submit Demo)</h3>
					<FormRenderer
						bind:data={submitData}
						schema={submitSchema}
						layout={submitLayout}
						validateOn="blur"
						onsubmit={handleFormSubmit}
					/>
					{#if submitStatus}
						<div class="bg-success-z1 text-success-z7 mt-3 rounded p-2 text-xs">
							{submitStatus}
						</div>
					{/if}
				{:else if activeDemo === 'nested'}
					<h3 class="text-surface-z8 m-0 mb-3 text-sm font-semibold">
						Traveler Details (Nested Groups)
					</h3>
					<FormRenderer
						bind:data={nestedData}
						schema={nestedSchema}
						layout={nestedLayout}
						validateOn="blur"
					/>
				{:else if activeDemo === 'dirty'}
					<h3 class="text-surface-z8 m-0 mb-3 text-sm font-semibold">Dirty Tracking</h3>
					<FormRenderer builder={dirtyBuilder} />
					<div class="mt-3 flex flex-col gap-2">
						<div class="flex items-center gap-2">
							<span
								class="rounded-full px-2 py-0.5 text-xs {dirtyStatus
									? 'bg-warning-z1 text-warning-z7'
									: 'bg-success-z1 text-success-z7'}"
							>
								{dirtyStatus ? 'Unsaved changes' : 'Clean'}
							</span>
						</div>
						{#if dirtyFieldsList.length > 0}
							<div class="text-surface-z5 text-xs">
								Modified: {dirtyFieldsList.join(', ')}
							</div>
						{/if}
						<div class="flex gap-2">
							<button
								class="bg-primary text-on-primary cursor-pointer rounded-md border-0 px-3 py-1.5 text-xs hover:opacity-90 disabled:opacity-50"
								disabled={!dirtyStatus}
								onclick={() => dirtyBuilder.snapshot()}
							>
								Snapshot (Save)
							</button>
							<button
								class="bg-surface-z2 text-surface-z7 border-surface-z3 hover:bg-surface-z3 cursor-pointer rounded-md border px-3 py-1.5 text-xs disabled:opacity-50"
								disabled={!dirtyStatus}
								onclick={() => dirtyBuilder.reset()}
							>
								Reset
							</button>
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/snippet}

	{#snippet controls()}
		<div class="text-surface-z6 flex flex-col gap-2 text-xs">
			<p class="m-0"><strong>Active:</strong> {activeDemo}</p>
			{#if activeDemo === 'input'}
				<InfoField label="Data" value={JSON.stringify(travelerData, null, 2)} />
			{:else if activeDemo === 'multistep'}
				<InfoField label="Step" value={`${stepBuilder.currentStep + 1} / ${stepBuilder.totalSteps}`} />
				<InfoField label="Can Advance" value={stepBuilder.canAdvance ? 'Yes' : 'No'} />
				<InfoField label="Data" value={JSON.stringify(stepBuilder.data, null, 2)} />
			{:else if activeDemo === 'flights'}
				<InfoField
					label="Selected"
					value={selectedFlight ? `${selectedFlight.airline} ${selectedFlight.flight}` : 'None'}
				/>
			{:else if activeDemo === 'hotels'}
				<InfoField label="Selected" value={selectedHotel ? selectedHotel.name : 'None'} />
			{:else if activeDemo === 'mixed'}
				<InfoField label="Data" value={JSON.stringify(bookingData, null, 2)} />
			{:else if activeDemo === 'validation'}
				<InfoField label="Valid" value={validationBuilder.isValid ? 'Yes' : 'No'} />
				<InfoField
					label="Errors"
					value={validationBuilder.errors.length > 0
						? validationBuilder.errors.map((e) => `${e.path}: ${e.text}`).join('\n')
						: 'None'}
				/>
			{:else if activeDemo === 'submit'}
				<InfoField label="Data" value={JSON.stringify(submitData, null, 2)} />
				<InfoField label="Status" value={submitStatus ?? 'Not submitted'} />
			{:else if activeDemo === 'nested'}
				<InfoField label="Data" value={JSON.stringify(nestedData, null, 2)} />
			{:else if activeDemo === 'dirty'}
				<InfoField label="isDirty" value={dirtyStatus ? 'Yes' : 'No'} />
				<InfoField
					label="dirtyFields"
					value={dirtyFieldsList.length > 0 ? dirtyFieldsList.join(', ') : 'None'}
				/>
				<InfoField label="Data" value={JSON.stringify(dirtyBuilder.data, null, 2)} />
			{/if}
		</div>
	{/snippet}
</PlaySection>
