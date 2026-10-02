import { combineRgb } from '@companion-module/base'

export const channelChoices = (label, ids) => ids.map((id) => ({ id: id, label: `${label} ${id}` }))
const range = (count) => [...Array(count).keys()]

// DIO channels on the E1212 & E1213 can be jumpered as DI or DO, so these are defaults that get
// replaced by the channels the device actually reports when it is queried.
export const models = {
	e1210: { label: 'E1210 (16 DI)', inputs: range(16), outputs: [], outputType: 'do' },
	e1211: { label: 'E1211 (16 DO)', inputs: [], outputs: range(16), outputType: 'do' },
	e1212: { label: 'E1212 (8 DI, 8 DIO)', inputs: range(8), outputs: range(8), outputType: 'do' },
	e1213: { label: 'E1213 (8 DI, 4 DO, 4 DIO)', inputs: range(8), outputs: range(8), outputType: 'do' },
	e1214: { label: 'E1214 (6 DI, 6 Relay)', inputs: range(6), outputs: range(6), outputType: 'relay' },
}

export const choices = {
	model: Object.entries(models).map(([id, model]) => ({ id: id, label: model.label })),
	acceptHeader: [
		{ id: 'application/json;version=vdn.dac.v1', label: 'v4.0 or later' },
		{ id: 'vdn.dac.v1', label: 'Prior to v4.0' },
	],
	polling: [
		{ id: 'di', label: 'DI' },
		{ id: 'do', label: 'DO / Relay' },
	],
	DIMode: [
		{ id: 0, label: 'DI' },
		{ id: 1, label: 'Counter' },
	],
	DICntStart: [
		{ id: 0, label: 'Stop' },
		{ id: 1, label: 'Start' },
	],
	DOMode: [
		{ id: 0, label: 'DO / Relay' },
		{ id: 1, label: 'Pulse' },
	],
	DOStatus: [
		{ id: 0, label: 'Off' },
		{ id: 1, label: 'On' },
	],
	DOPulseStart: [
		{ id: 0, label: 'Stop' },
		{ id: 1, label: 'Start' },
	],
}

export const api = {
	path: {
		sysInfo: 'api/slot/0/sysInfo',
		io: 'api/slot/0/io/',
	},
	di: 'di',
	do: 'do',
	relay: 'relay',
	// Field names per IO type. Relay pulse widths are in units of 1.5 s, DO pulse widths in ms.
	fields: {
		di: {
			index: 'diIndex',
			mode: 'diMode',
			status: 'diStatus',
			count: 'diCounterValue',
			countStart: 'diCounterStatus',
			countReset: 'diCounterReset',
		},
		do: {
			index: 'doIndex',
			mode: 'doMode',
			status: 'doStatus',
			pulseStart: 'doPulseStatus',
			pulseCount: 'doPulseCount',
			onWidth: 'doPulseOnWidth',
			offWidth: 'doPulseOffWidth',
			widthUnit: 1,
		},
		relay: {
			index: 'relayIndex',
			mode: 'relayMode',
			status: 'relayStatus',
			pulseStart: 'relayPulseStatus',
			pulseCount: 'relayPulseCount',
			onWidth: 'relayPulseOnWidth',
			offWidth: 'relayPulseOffWidth',
			widthUnit: 1500,
		},
	},
}

export const actionOptions = {
	do: {
		id: 'do',
		type: 'multidropdown',
		label: 'DO',
		minSelection: 1,
		tooltip: `Select DOs to change`,
	},
	doStatus: {
		id: 'status',
		type: 'dropdown',
		label: 'Status',
		default: choices.DOStatus[0].id,
		choices: choices.DOStatus,
	},
	doPulseStart: {
		id: 'mode',
		type: 'dropdown',
		label: 'Mode',
		default: choices.DOPulseStart[0].id,
		choices: choices.DOPulseStart,
	},
	doPulseCount: {
		id: 'count',
		type: 'textinput',
		label: 'Pulse Count',
		default: '0',
		useVariables: { local: true },
		tooltip: '0 for continuous pulsing',
	},
	di: {
		id: 'di',
		type: 'multidropdown',
		label: 'DI',
		minSelection: 1,
		tooltip: `Select DIs to change`,
	},
	diCntStart: {
		id: 'mode',
		type: 'dropdown',
		label: 'Count',
		default: choices.DICntStart[0].id,
		choices: choices.DICntStart,
	},
}

export const feedbackOptions = {
	do: {
		id: 'do',
		type: 'dropdown',
		label: 'DO',
	},
	doMode: {
		id: 'mode',
		type: 'dropdown',
		label: 'Mode',
		default: choices.DOMode[0].id,
		choices: choices.DOMode,
	},
	di: {
		id: 'di',
		type: 'dropdown',
		label: 'DI',
	},
	diMode: {
		id: 'mode',
		type: 'dropdown',
		label: 'Mode',
		default: choices.DIMode[0].id,
		choices: choices.DIMode,
	},
}

export const colours = {
	black: combineRgb(0, 0, 0),
	red: combineRgb(255, 0, 0),
}

export const fb_styles = {
	defaultRed: {
		bgcolor: colours.red,
		color: colours.black,
	},
}
