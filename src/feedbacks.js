import { api, feedbackOptions, fb_styles } from './consts.js'

export async function UpdateFeedbacks(self) {
	let feedbackDefs = []
	const outputType = self.moxa.outputType
	const outName = outputType === 'relay' ? 'Relay' : 'DO'
	const queryOutputs = async () => {
		await self.queryIO(outputType)
	}
	const queryInputs = async () => {
		await self.queryIO(api.di)
	}
	if (self.moxa.outputsDigital.length > 0) {
		const doOption = {
			...feedbackOptions.do,
			label: outName,
			default: self.moxa.outputsDigital[0].id,
			choices: self.moxa.outputsDigital,
		}
		feedbackDefs['do_status'] = {
			name: `${outName} Status`,
			type: 'boolean',
			defaultStyle: fb_styles.defaultRed,
			options: [doOption],
			callback: async (feedback) => {
				return !!self.moxa.do[feedback.options.do]?.status
			},
			subscribe: queryOutputs,
		}
		feedbackDefs['do_mode'] = {
			name: `${outName} Mode`,
			type: 'boolean',
			defaultStyle: fb_styles.defaultRed,
			options: [doOption, feedbackOptions.doMode],
			callback: async (feedback) => {
				return self.moxa.do[feedback.options.do]?.mode === feedback.options.mode
			},
			subscribe: queryOutputs,
		}
		feedbackDefs['do_pulse'] = {
			name: `${outName} Pulse`,
			type: 'boolean',
			defaultStyle: fb_styles.defaultRed,
			options: [doOption],
			callback: async (feedback) => {
				return !!self.moxa.do[feedback.options.do]?.pulseStart
			},
			subscribe: queryOutputs,
		}
	}
	if (self.moxa.inputsDigital.length > 0) {
		const diOption = {
			...feedbackOptions.di,
			default: self.moxa.inputsDigital[0].id,
			choices: self.moxa.inputsDigital,
		}
		feedbackDefs['di_status'] = {
			name: 'DI Status',
			type: 'boolean',
			defaultStyle: fb_styles.defaultRed,
			options: [diOption],
			callback: async (feedback) => {
				return !!self.moxa.di[feedback.options.di]?.status
			},
			subscribe: queryInputs,
		}
		feedbackDefs['di_cntStart'] = {
			name: 'DI Counter',
			type: 'boolean',
			defaultStyle: fb_styles.defaultRed,
			options: [diOption],
			callback: async (feedback) => {
				return !!self.moxa.di[feedback.options.di]?.cntStart
			},
			subscribe: queryInputs,
		}
		feedbackDefs['di_mode'] = {
			name: 'DI Mode',
			type: 'boolean',
			defaultStyle: fb_styles.defaultRed,
			options: [diOption, feedbackOptions.diMode],
			callback: async (feedback) => {
				return self.moxa.di[feedback.options.di]?.mode === feedback.options.mode
			},
			subscribe: queryInputs,
		}
	}
	self.setFeedbackDefinitions(feedbackDefs)
}
