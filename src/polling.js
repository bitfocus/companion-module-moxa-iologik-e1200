import { api } from './consts.js'

export function startPolling() {
	if (this.pollTimer) {
		clearTimeout(this.pollTimer)
	}
	if (this.config.pollInterval > 0) {
		this.pollTimer = setTimeout(() => {
			this.pollStatus()
		}, this.config.pollInterval * 1000)
		return true
	} else {
		delete this.pollTimer
		return undefined
	}
}

export function stopPolling() {
	if (this.pollTimer) {
		clearTimeout(this.pollTimer)
		delete this.pollTimer
		return true
	}
	return undefined
}

export async function pollStatus() {
	if (this.axios) {
		if (this.moxa.inputsDigital.length > 0 && this.config.poll.includes('di')) {
			await this.queryIO(api.di)
		}
		if (this.moxa.outputsDigital.length > 0 && this.config.poll.includes('do')) {
			await this.queryIO(this.moxa.outputType)
		}
	}
	this.startPolling()
}
