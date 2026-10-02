export async function UpdateVariableDefinitions(self) {
	let variableList = []
	const outName = self.moxa.outputType === 'relay' ? 'Relay' : 'DO'
	variableList.push(
		{ variableId: `deviceName`, name: `Device Name` },
		{ variableId: `upTime`, name: `Up Time` },
		{ variableId: `firmware`, name: `Firmware Version` },
		{ variableId: `model`, name: `Model Name` },
		{ variableId: `macAddr`, name: `MAC Address` },
		{ variableId: `IP`, name: `IP Address` },
	)
	for (const input of self.moxa.inputsDigital) {
		variableList.push({ variableId: `count_input_${input.id}`, name: `DI: Counter ${input.id}` })
	}
	for (const output of self.moxa.outputsDigital) {
		variableList.push(
			{ variableId: `lowWidth_output_${output.id}`, name: `${outName}: Pulse Low Width (ms) ${output.id}` },
			{ variableId: `highWidth_output_${output.id}`, name: `${outName}: Pulse High Width (ms) ${output.id}` },
			{ variableId: `pulseCount_output_${output.id}`, name: `${outName}: Pulse Count ${output.id}` },
		)
	}
	self.setVariableDefinitions(variableList)
}
