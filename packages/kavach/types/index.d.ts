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
