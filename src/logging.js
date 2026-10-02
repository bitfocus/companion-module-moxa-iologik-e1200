import { InstanceStatus } from '@companion-module/base'

export function logError(error) {
	if (this.config.verbose) {
		console.log(error)
	}
	if (error.response) {
		const { status, data } = error.response
		this.log('error', `${status}: ${JSON.stringify(error.code)}\n${JSON.stringify(data)}`)
		this.checkStatus(InstanceStatus.UnknownError, `${status}: ${JSON.stringify(error.code)}`)
	} else if (error.code !== undefined) {
		this.log('error', `${JSON.stringify(error.code)}`)
		this.checkStatus(InstanceStatus.ConnectionFailure, `${JSON.stringify(error.code)}`)
	} else if (error instanceof Error) {
		this.log('error', error.stack ?? error.message)
		this.checkStatus(InstanceStatus.UnknownError, error.message)
	} else {
		this.log('error', typeof error == 'object' ? JSON.stringify(error) : String(error))
		this.checkStatus(InstanceStatus.UnknownError)
	}
}
