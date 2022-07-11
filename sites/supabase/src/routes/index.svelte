<svelte:head>
	<title>About</title>
</svelte:head>
<content
	class="flex flex-col flex-grow transform transition duration-200 ease-in-out bg-gray-100"
>
	<prose class="prose prose-md px-6 py-4">
		<p class="mt-2">
			This demo extends the standard svelte-kit <b>todo</b> app by adding authentication
			and route protection using Sentry. Sentry supports public and protected routes.
		</p>
		<ul class="list-disc p-4">
			<li>A <b>public</b> route is accessible to everyone.</li>
			<li>
				A <b>protected</b> is only accessible to logged in users with a specifc role.
				These routes can be configured to be different for each role.
			</li>
		</ul>
		<p class="mt-2">Routes in this demo</p>
		<ul class="list-disc p-4">
			<li>
				User can log in using the login url. If already logged in user will be
				redirected to the default home page
			</li>
			<li>
				Logged in users can log out. If user is not logged in, he/she will be
				redirected to login page.
			</li>
			<li>
				Todo is a protected link, which is only accessible when user is logged
				in. Otherwise user will be redirected to login page
			</li>
		</ul>
	</prose>
</content>
