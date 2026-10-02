import { actionOptions, api } from './consts.js'

export async function UpdateActions(self) {
	let actionDefs = []
	const outputType = self.moxa.outputType
	const outputFields = api.fields[outputType]
	const outName = outputType === 'relay' ? 'Relay' : 'DO'
	const queryOutputs = async () => {
		await self.queryIO(outputType)
	}
	const queryInputs = async () => {
		await self.queryIO(api.di)
	}
	if (self.moxa.outputsDigital.length > 0) {
		const doOption = {
			...actionOptions.do,
			label: outName,
			tooltip: `Select ${outName}s to change`,
			default: [self.moxa.outputsDigital[0].id],
			choices: self.moxa.outputsDigital,
		}
		actionDefs['set_DO_status'] = {
			name: `Set ${outName} Status`,
			options: [doOption, actionOptions.doStatus],
			callback: async ({ options }) => {
				await self.apiPut(outputType, options.do, outputFields.status, options.status)
			},
			subscribe: queryOutputs,
		}
		actionDefs['set_DO_pulseStart'] = {
			name: `Set ${outName} Pulse`,
			options: [doOption, actionOptions.doPulseStart],
			callback: async ({ options }) => {
				await self.apiPut(outputType, options.do, outputFields.pulseStart, options.mode)
			},
			subscribe: queryOutputs,
		}
		actionDefs['set_DO_pulseCount'] = {
			name: `Set ${outName} Pulse Count`,
			options: [doOption, actionOptions.doPulseCount],
			callback: async ({ options }, context) => {
				const count = parseInt(await context.parseVariablesInString(options.count))
				if (isNaN(count) || count < 0 || count > 4294967295) {
					self.log('warn', `set_DO_pulseCount has been passed an out of range param ${count}`)
					return undefined
				}
				await self.apiPut(outputType, options.do, outputFields.pulseCount, count)
			},
			subscribe: queryOutputs,
		}
		actionDefs['get_DO'] = {
			name: `Get ${outName} Status, Mode & Pulse`,
			options: [],
			callback: queryOutputs,
		}
	}
	if (self.moxa.inputsDigital.length > 0) {
		const diOption = {
			...actionOptions.di,
			default: [self.moxa.inputsDigital[0].id],
			choices: self.moxa.inputsDigital,
		}
		actionDefs['set_DI_CNT_start'] = {
			name: 'Set DI Count Start',
			options: [diOption, actionOptions.diCntStart],
			callback: async ({ options }) => {
				await self.apiPut(api.di, options.di, api.fields.di.countStart, options.mode)
			},
			subscribe: queryInputs,
		}
		actionDefs['reset_DI_count'] = {
			name: 'Reset DI Count',
			options: [diOption],
			callback: async ({ options }) => {
				await self.apiPut(api.di, options.di, api.fields.di.countReset, 1)
			},
		}
		actionDefs['get_DI'] = {
			name: 'Get DI Status, Mode & Count',
			options: [],
			callback: queryInputs,
		}
	}
	self.setActionDefinitions(actionDefs)
}
