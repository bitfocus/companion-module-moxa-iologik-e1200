import { InstanceStatus } from '@companion-module/base'
import { api, channelChoices, models } from './consts.js'

export async function apiGet(path, onStart = () => {}) {
	await this.queue.add(async () => {
		onStart()
		if (!this.axios) {
			this.log('warn', `Axios Client has not been initialised. GET ${path} not sent`)
			return
		}
		let response
		try {
			response = await this.axios.get(path)
		} catch (error) {
			this.logError(error)
			return
		}
		if (this.config.verbose) {
			this.log('debug', `Data Recieved from ${path}:\n${JSON.stringify(response.data)}`)
		}
		this.checkStatus(InstanceStatus.Ok)
		// A failure here is a module bug, not a connection fault, so don't change the status
		try {
			this.parseResponse(response.data)
		} catch (error) {
			this.log('error', `Could not process response from ${path}: ${error?.stack ?? error}`)
		}
	})
}

export async function apiPut(type, channels, field, value) {
	if (!Array.isArray(channels)) {
		channels = [channels]
	}
	for (const channel of channels) {
		const path = `${api.path.io}${type}/${channel}/${field}`
		const body = { slot: 0, io: { [type]: { [channel]: { [field]: value } } } }
		await this.queue.add(async () => {
			if (!this.axios) {
				this.log('warn', `Axios Client has not been initialised. PUT ${path} not sent`)
				return
			}
			try {
				if (this.config.verbose) {
					this.log('debug', `PUT ${path}: ${JSON.stringify(body)}`)
				}
				await this.axios.put(path, body)
				this.checkStatus(InstanceStatus.Ok)
			} catch (error) {
				// The device rejecting a write (eg Set Pulse on a channel not in pulse mode) is not a connection fault.
				// 406 is excluded, as it means the Firmware setting is wrong
				const status = error.response?.status
				if (status >= 400 && status < 500 && status !== 406) {
					this.log('warn', `Device rejected PUT ${path} (${status}): ${JSON.stringify(error.response.data)}`)
				} else {
					this.logError(error)
				}
			}
		})
	}
	await this.queryIO(type)
}

// Query every channel of an IO type. Requests for a type already waiting in the queue are dropped,
// since the queued request will return the latest state anyway
export async function queryIO(type) {
	if (this.pending.has(type)) {
		return
	}
	this.pending.add(type)
	await this.apiGet(api.path.io + type, () => this.pending.delete(type))
}

export async function queryOnConnect() {
	const model = models[this.config.model]
	await this.apiGet(api.path.sysInfo)
	if (model.inputs.length > 0) {
		await this.queryIO(api.di)
	}
	if (model.outputs.length > 0) {
		await this.queryIO(this.moxa.outputType)
	}
}

// Collections are returned as an array of channel objects, single channels as an object keyed by index
function channelEntries(channels, indexField) {
	if (Array.isArray(channels)) {
		return channels.map((c) => [parseInt(c[indexField]), c])
	}
	return Object.entries(channels).map(([i, c]) => [parseInt(i), c])
}

function findValues(obj, keys, found = {}) {
	if (obj === null || typeof obj !== 'object') {
		return found
	}
	for (const [key, value] of Object.entries(obj)) {
		if (keys.includes(key) && typeof value !== 'object') {
			found[key] = value
		} else {
			findValues(value, keys, found)
		}
	}
	return found
}

export function parseResponse(data) {
	if (typeof data === 'string') {
		try {
			data = JSON.parse(data)
		} catch {
			this.log('warn', `Could not parse response: ${data}`)
			return
		}
	}
	let varList = []
	if (data?.sysInfo) {
		const info = findValues(data.sysInfo, [
			'modelName',
			'deviceName',
			'deviceUpTime',
			'firmwareVersion',
			'lanMac',
			'lanIp',
		])
		if (info.modelName !== undefined) varList['model'] = info.modelName
		if (info.deviceName !== undefined) varList['deviceName'] = info.deviceName
		if (info.deviceUpTime !== undefined) varList['upTime'] = info.deviceUpTime
		if (info.firmwareVersion !== undefined) varList['firmware'] = info.firmwareVersion
		if (info.lanMac !== undefined) varList['macAddr'] = info.lanMac
		if (info.lanIp !== undefined) varList['IP'] = info.lanIp
	}
	const io = data?.io ?? {}
	if (io[api.di] !== undefined) {
		const f = api.fields.di
		const entries = channelEntries(io[api.di], f.index)
		if (Array.isArray(io[api.di])) {
			this.checkDiscoveredChannels(
				entries.map(([i]) => i),
				true,
			)
		}
		for (const [i, c] of entries) {
			const di = this.moxa.di[i]
			if (di === undefined) continue
			if (c[f.mode] !== undefined) di.mode = parseInt(c[f.mode])
			if (c[f.status] !== undefined) di.status = !!parseInt(c[f.status])
			if (c[f.countStart] !== undefined) di.cntStart = !!parseInt(c[f.countStart])
			if (c[f.count] !== undefined) varList[`count_input_${i}`] = parseInt(c[f.count])
		}
	}
	const outputType = this.moxa.outputType
	if (io[outputType] !== undefined) {
		const f = api.fields[outputType]
		const entries = channelEntries(io[outputType], f.index)
		if (Array.isArray(io[outputType])) {
			this.checkDiscoveredChannels(
				entries.map(([i]) => i),
				false,
			)
		}
		for (const [i, c] of entries) {
			const output = this.moxa.do[i]
			if (output === undefined) continue
			if (c[f.mode] !== undefined) output.mode = parseInt(c[f.mode])
			if (c[f.status] !== undefined) output.status = !!parseInt(c[f.status])
			if (c[f.pulseStart] !== undefined) output.pulseStart = !!parseInt(c[f.pulseStart])
			if (c[f.pulseCount] !== undefined) varList[`pulseCount_output_${i}`] = parseInt(c[f.pulseCount])
			if (c[f.onWidth] !== undefined) varList[`highWidth_output_${i}`] = parseInt(c[f.onWidth]) * f.widthUnit
			if (c[f.offWidth] !== undefined) varList[`lowWidth_output_${i}`] = parseInt(c[f.offWidth]) * f.widthUnit
		}
	}
	this.checkFeedbacks()
	this.setVariableValues(varList)
}

// DIO channels on the E1212 & E1213 are set to DI or DO by jumpers, so use the channels the device reports
export function checkDiscoveredChannels(ids, isInput) {
	const current = (isInput ? this.moxa.inputsDigital : this.moxa.outputsDigital).map((c) => c.id)
	if (ids.length === current.length && ids.every((id, i) => id === current[i])) {
		return false
	}
	if (isInput) {
		this.setInputs(channelChoices('Input', ids))
	} else {
		this.setOutputs(channelChoices(this.moxa.outputLabel, ids))
	}
	this.log('info', `Device reports ${isInput ? 'inputs' : 'outputs'}: ${ids.join(', ')}`)
	this.updateActions()
	this.updateFeedbacks()
	this.updateVariableDefinitions()
	return true
}
