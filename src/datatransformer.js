import _ from 'underscore';

const columnOrder = [
	"Participant_AB",
	"P1_Block_number",
	"P1_Block_start_time",
	"P1_Trial_number",
	"P1_Rule",
	"P1_Stimulus",
	"P1_Stimulus_image",
	"P1_Correct_Key",
	"P1_Response_Key",
	"P1_Correct",
	"P1_Trial_start",
	"P1_stimulus_start",
	"P1_Response_time",
	"P1_Response_time_since_start",
	"P1_Response_time_since_stimulus",
	"-",
	"P2_Block_number",
	"P2_Block_start_time",
	"P2_Trial_number",
	"P2_Tax_Subsidy",
	"P2_Stimulus",
	"P2_Stimulus_image",
	"P2_Correct_Key",
	"P2_Response_Key",
	"P2_Correct",
	"P2_Slow_Response",
	"P2_Trial_start",
	"P2_stimulus_start",
	"P2_Response_time",
	"P2_Response_time_since_start",
	"P2_Response_time_since_stimulus",
	"P2_Reward_Loss",
	"P2_Reward_Loss_total",
	"--",
	"P3_Block_number",
	"P3_Block_start_time",
	"P3_Trial_number",
	"P3_Type",
	"P3_Stimulus",
	"P3_Stimulus_image",
	"P3_Correct_Key",
	"P3_Response_Key",
	"P3_Correct",
	"P3_Trial_start",
	"P3_stimulus_start",
	"P3_Response_time",
	"P3_Response_time_since_start",
	"P3_Response_time_since_stimulus",
	"---",
	"Q_JudgedSubsidyAnimals",
	"Q_JudgedTaxAnimals",
	"Q_TrueSubsidyAnimal",
	"Q_Subsidy_VAS_Confidence",
	"Q_TrueTaxAnimal",
	"Q_Correct_P2_Key",
	"Q_Participant_P2_Key",
	"Q_Tax_VAS_Confidence",
	"Q_P1/P3_Animal",
	"Q_Correct_P1/P3_Key",
	"Q_Participant_P1/P3_Key",
];

const columnMapping = _.invert(Object.fromEntries(columnOrder.entries()));
export default function transform(rows) {
	let processed = Object.entries(columnMapping).map(v=>[v[0]]);
	for (let r of rows) {
		Object.entries(r).forEach(([k, v]) => {
			k = k.trim();
			const col = columnMapping[k];
			if (!col) {
				console.log(`${k}, ${v}`);
				const code = k.split('').map(v => v.charCodeAt(0)).join(',');
				for (let dk of Object.keys(columnMapping)) {
					dk = dk.trim();
					console.log(`${dk} == ${k} == ${dk == k} ${dk === k} ${dk.length} ${k.length} ${dk.split('').map(v => v.charCodeAt(0)).join(',')} ${code}`);
				}
			}
			if (_.isArray(v)) {
				processed[col] = processed[col].concat(v);
			} else {
				processed[col].push(v);
			}
		});
	}

	const max = _.max(processed, col => col.length).length;
	let strings = [];
	for (let i = 0; i < max; i++) {
		let row = processed.map(col => col[i]? col[i]:"");
		const str = row.join(",");
		strings.push(str);
	}

	return strings.join("\n");
}