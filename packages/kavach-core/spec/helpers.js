export function logged_data(
	level,
	date,
	message,
	sequence,
	running_on = 'server'
) {
	return {
		running_on,
		level,
		message,
		logged_at: date.toISOString(),
		sequence,
		session: 'anonymous'
	}
}
