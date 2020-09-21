const prefixes = {
	'PHASE1': 'P1_',
	'PHASE2': 'P2_',
	'PHASE3': 'P3_',
};
const fieldPrefix = row => prefixes[row.phase];

const fieldMapping = {
	'block': 'Block_number',
	'blockStartTime': 'Block_start_time',
	'correct': 'Correct',
	'correctKey': 'Correct_Key',
	'image': 'Stimulus_image',
	'pressedKey': 'Response_Key',
	'reactionTime': 'Response_time_since_stimulus',
	'rule': 'Rule',
	'stimulusCategory': 'Stimulus',
	'stimulusTime': 'stimulus_start',
	'trial': 'Trial_number',
	'trialTime': 'Trial_start'
};

const phaseSpecificData = {
	'PHASE2': {
		'rewardChange': 'Reward_Loss',
		'rewardTotal': 'Reward_Loss_total'
	}
};

const phaseSpecificNames = {
	'PHASE2': {
		'Rule': 'Tax_Subsidy'
	},
	'PHASE3': {
		'Rule': 'Type'
	}
};

const handlePhaseSpecificData = row => {
	const extraDataFields = phaseSpecificData[row.phase];
	if (!extraDataFields) {
		return {};
	}

	const newValues = {};
	const prefix = fieldPrefix(row);
	for (const [key, value] of Object.entries(extraDataFields)) {
		newValues[prefix + value]= row[key];
	}
	return newValues;
};

const derivedData = {
	'Response_time': row => row.stimulusTime + row.reactionTime - row.blockStartTime,
	'Response_time_since_start': row => row.trialTime - row.stimulusTime + row.reactionTime - row.blockStartTime,
};

const handlePhaseSpecificColumnNames = (phase, key) => {
	const phaseSpecificColumn = phaseSpecificNames[phase];
	if (!phaseSpecificColumn || !phaseSpecificColumn[key]) {
		return key;
	}
	console.log(`${key} - ${phaseSpecificColumn[key]}`);
	return phaseSpecificColumn[key];
};

export default function(data) {
	const fieldEntries = Object.entries(fieldMapping);
	data = data.filter(row => prefixes[row.phase]);
	let processedSheet = data.map(row => {
		const prefix = fieldPrefix(row);
		let processedRow = {};

		for (const [key, value] of fieldEntries) {
			const column = handlePhaseSpecificColumnNames(row.phase, value);
			processedRow[prefix + column] = row[key];
		}

		for (const [key, value] of Object.entries(derivedData)) {
			processedRow[prefix + key] = value(row);
		}

		const extraValues = handlePhaseSpecificData(row);
		return Object.assign(processedRow, extraValues);
	});

	return processedSheet;
};

