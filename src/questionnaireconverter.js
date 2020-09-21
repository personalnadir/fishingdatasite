
const fieldLookup = {
	gallery: {
		SUBSIDY_IMAGE_SELECTION: {
			imagesSelected: 'Q_JudgedSubsidyAnimals'
		},
		TAX_IMAGE_SELECTION: {
			imagesSelected: 'Q_JudgedTaxAnimals'
		}
	},
	keys: {
		PHASE2_KEY_SELECTION_SUBSIDY: {
			image: 'Q_TrueSubsidyAnimal',
			correctKey: 'Q_Correct_P2_Key',
			userSelectedKey: 'Q_Participant_P2_Key'
		},
		PHASE2_KEY_SELECTION_TAX: {
			image: 'Q_TrueTaxAnimal',
			correctKey: 'Q_Correct_P2_Key',
			userSelectedKey: 'Q_Participant_P2_Key'
		},
		'PHASE1/3_KEY_SELECTION': {
			image: ' Q_P1/P3_Animal',
			correctKey: 'Q_Correct_P1/P3_Key',
			userSelectedKey: 'Q_Participant_P1/P3_Key'
		}
	},
	vas: {
		VAS_CONFIDENCE_SUBSIDY: {
			value: 'Q_Subsidy_VAS_Confidence'
		},
		VAS_CONFIDENCE_TAX: {
			value: 'Q_Tax_VAS_Confidence'
		},
	}

};

const fieldConverter = {
	gallery: {
		imagesSelected: JSON.parse,
		correctImages: JSON.parse
	}
};

export default function(type, data) {
	const typeMapping = fieldLookup[type];
	return data.map(v => {
		const qMapping = typeMapping[v.questionnaire];
		if (!qMapping) {
			console.log(v);
		}
		let remappedData = {};
		for (const [key, value] of Object.entries(v)) {
			const newKey = qMapping[key];
			if (!newKey) {
				continue;
			}

			if (fieldConverter[type] && fieldConverter[type][key]) {
				remappedData[newKey] = fieldConverter[type][key](value);
				continue;
			}
			remappedData[newKey] = value;
		};
		console.log(v, remappedData);
		return remappedData;
	});
};

