import { Regex } from '@companion-module/base'
import { choices } from './consts.js'

// Return config fields for web config
export function getConfigFields() {
	return [
		{
			type: 'static-text',
			id: 'info',
			label: '',
			width: 12,
			value: 'The RESTful API must be enabled in the device web console',
		},
		{
			type: 'dropdown',
			id: 'model',
			label: 'Model',
			width: 6,
			default: choices.model[0].id,
			allowCustom: false,
			choices: choices.model,
		},
		{
			type: 'dropdown',
			id: 'acceptHeader',
			label: 'Firmware',
			width: 6,
			default: choices.acceptHeader[0].id,
			allowCustom: false,
			choices: choices.acceptHeader,
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'Hostname',
			width: 12,
			regex: Regex.HOSTNAME,
		},
		{
			type: 'number',
			id: 'pollInterval',
			label: 'Poll Rate (s)',
			width: 6,
			default: 5,
			min: 0,
			max: 600,
			range: true,
			step: 0.5,
			tooltip: `Set to 0 to turn off`,
		},
		{
			type: 'multidropdown',
			id: 'poll',
			label: 'Poll Data',
			width: 6,
			default: choices.polling.map((p) => p.id),
			choices: choices.polling,
		},
		{
			type: 'checkbox',
			id: 'verbose',
			label: 'Verbose Logs',
			width: 6,
			default: false,
		},
	]
}
