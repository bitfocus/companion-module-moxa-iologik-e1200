import { InstanceStatus } from '@companion-module/base'

export function logError(error) {
	if (this.config.verbose) {
		console.log(error)
	}
	if (error.code !== undefined) {
		try {
			this.log(
				'error',
				`${error.response.status}: ${JSON.stringify(error.code)}\n${JSON.stringify(error.response.data)}`,
			)
			this.checkStatus(InstanceStatus.UnknownError, `${error.response.status}: ${JSON.stringify(error.code)}`)
		} catch {
			this.log('error', `${JSON.stringify(error.code)}`)
			this.checkStatus(InstanceStatus.ConnectionFailure, `${JSON.stringify(error.code)}`)
		}
	} else {
		this.log('error', typeof error == 'object' ? JSON.stringify(error) : error.toString())
		this.checkStatus(InstanceStatus.UnknownError)
	}
}
