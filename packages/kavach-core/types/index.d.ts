export interface LogWriter {
	write(message: Object): Promise<void>
}

export interface Logger {
	info(message: Object): Promise<void>
	warn(message: Object): Promise<void>
	debug(message: Object): Promise<void>
	error(message: Object): Promise<void>
	trace(message: Object): Promise<void>
}

export interface LogData {
	level: string
	running_on: string
	sequence: number
	session: string
	logged_at: string // ISO 8601 formatted timestamp
	origin_ip_address?: string
	message: Object
}

export interface AuthProvider {
	mode: 'otp' | 'oauth' | 'password'
	provider: string
	label?: string
	scopes?: string[]
	params?: string[]
}

export interface AuthUser {
	id: string
	role: string
	name: string
	email?: string
}

export interface Credentials {
	provider?: string
	email?: string
	phone?: string
	password?: string
	token?: string
	options?: any
}

export interface AuthOptions {
	scopes: string | Array<string>
	params: Array<any>
}

export interface Adapter {
	getUser(): Promise<AuthUser>
	getSession(): Promise<any>
	signIn(
		credentials: Credentials,
		mode: 'password' | 'otp' | 'oauth'
	): Promise<void>
	signOut(): Promise<void>
	verifyOtp(credentials: Credentials): Promise<any>
	resetPassword(): Promise<any>
	onAuthChange(callback: Function): void
}

export interface GetAdapter {
	(config: any): Adapter
}
