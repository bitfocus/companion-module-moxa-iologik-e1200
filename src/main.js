import { InstanceBase, runEntrypoint, InstanceStatus } from '@companion-module/base'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { UpdateVariableDefinitions } from './variables.js'
import * as config from './config.js'
import { channelChoices, choices, models } from './consts.js'
import * as apiMethods from './api.js'
import * as logging from './logging.js'
import * as polling from './polling.js'
import axios from 'axios'
import PQueue from 'p-queue'

const timeOut = 5000

class ioLogik_E1200 extends InstanceBase {
	constructor(internal) {
		super(internal)
		Object.assign(this, { ...config, ...apiMethods, ...logging, ...polling })
		this.queue = new PQueue({ concurrency: 1, interval: 100, intervalCap: 1 })
		this.pending = new Set()
		this.currentStatus = { status: InstanceStatus.Disconnected, message: '' }
	}

	checkStatus(status = InstanceStatus.Disconnected, message = '') {
		if (status === this.currentStatus.status && message === this.currentStatus.message) return false
		this.updateStatus(status, message.toString())
		this.currentStatus.status = status
		this.currentStatus.message = message
		return true
	}

	async init(config) {
		this.configUpdated(config)
	}

	// When module gets deleted
	async destroy() {
		this.log('debug', `destroy: ${this.id}`)
		this.stopPolling()
		this.queue.clear()
		if (this.axios) {
			delete this.axios
		}
		delete this.moxa
	}

	async configUpdated(config) {
		this.stopPolling()
		this.queue.clear()
		this.pending.clear()
		this.config = config
		const model = models[this.config.model]
		if (model === undefined) {
			this.checkStatus(InstanceStatus.BadConfig)
			this.log('error', `Unrecognised model selection: ${this.config.model}`) // This should never occur
			return undefined
		}
		this.moxa = {
			inputsDigital: [],
			outputsDigital: [],
			di: [],
			do: [],
			outputType: model.outputType,
			outputLabel: model.outputType === 'relay' ? 'Relay' : 'Output',
		}
		this.setInputs(channelChoices('Input', model.inputs))
		this.setOutputs(channelChoices(this.moxa.outputLabel, model.outputs))
		this.checkStatus(InstanceStatus.Connecting)
		if (this.setupAxios(this.config.host)) {
			this.queryOnConnect()
		}
		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
		this.startPolling()
	}

	setInputs(inputs) {
		this.moxa.inputsDigital = inputs
		this.moxa.di = []
		for (const input of inputs) {
			this.moxa.di[input.id] = {
				mode: false,
				status: false,
				cntStart: false,
			}
		}
	}

	setOutputs(outputs) {
		this.moxa.outputsDigital = outputs
		this.moxa.do = []
		for (const output of outputs) {
			this.moxa.do[output.id] = {
				mode: false,
				status: false,
				pulseStart: false,
			}
		}
	}

	setupAxios(host) {
		if (this.axios) {
			delete this.axios
		}
		if (host) {
			this.axios = axios.create({
				baseURL: `http://${host}/`,
				timeout: timeOut,
				headers: {
					Accept: this.config.acceptHeader ?? choices.acceptHeader[0].id,
					'Content-Type': 'application/json',
				},
			})
			return true
		} else {
			this.log('warn', `Invalid config`)
			this.checkStatus(InstanceStatus.BadConfig)
			return undefined
		}
	}

	updateActions() {
		UpdateActions(this)
	}

	updateFeedbacks() {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions() {
		UpdateVariableDefinitions(this)
	}
}

runEntrypoint(ioLogik_E1200, UpgradeScripts)
