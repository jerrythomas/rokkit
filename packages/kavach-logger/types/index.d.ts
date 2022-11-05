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
