export type DwellingTime = '<15' | '15-30' | '30-45+' | '45+';
export type GroupSize = 'Solo' | 'Pair' | '3+';
export type Priority = 'Food' | 'Seat';
export type Immersion = 'Mobile' | 'Conversation' | 'Solitude' | 'Laptop';

export interface DecisionInput {
	dwelling: DwellingTime | null;
	groupSize: GroupSize | null;
	priority: Priority | null;
	immersion: Immersion | null;
}

interface DecisionRule {
	dwelling?: DwellingTime | '-';
	groupSize?: GroupSize | '1 or 2' | '2+' | '-';
	priority?: Priority | '-';
	immersion?: Immersion | '-';
	archetype: string;
}

const decisionTree: DecisionRule[] = [
	{ groupSize: '1 or 2', immersion: 'Mobile', archetype: 'iPad Kid' },
	{ dwelling: '30-45+', groupSize: '2+', immersion: 'Conversation', archetype: 'Group Hangout' },
	{ dwelling: '<15', priority: 'Food', archetype: 'Rushers' },
	{ groupSize: 'Solo', immersion: 'Laptop', archetype: 'My way or the Highway' },
	{ archetype: 'Unicorn' }
];

function matchesRule(input: DecisionInput, rule: DecisionRule): boolean {
	if (rule.groupSize && rule.groupSize !== '-') {
		if (rule.groupSize === '1 or 2') {
			if (input.groupSize !== 'Solo' && input.groupSize !== 'Pair') return false;
		} else if (rule.groupSize === '2+') {
			if (input.groupSize !== '3+') return false;
		} else if (input.groupSize !== rule.groupSize) {
			return false;
		}
	}
	if (rule.dwelling && rule.dwelling !== '-' && input.dwelling !== rule.dwelling) {
		return false;
	}
	if (rule.priority && rule.priority !== '-' && input.priority !== rule.priority) {
		return false;
	}
	if (rule.immersion && rule.immersion !== '-' && input.immersion !== rule.immersion) {
		return false;
	}
	return true;
}

export function determineArchetype(input: DecisionInput): string {
	for (const rule of decisionTree) {
		if (matchesRule(input, rule)) {
			return rule.archetype;
		}
	}
	return 'Unicorn';
}

export const ARCHETYPE_DESCRIPTIONS: Record<string, string> = {
	'iPad Kid': 'placeholder description',
	'Group Hangout': 'placeholder description',
	'Rushers': 'placeholder description',
	'My way or the Highway': 'placeholder description',
	'Unicorn': 'placeholder description'
};

export const DWELLING_OPTIONS = ['<15', '15-30', '30-45', '45+'];
export const GROUP_OPTIONS: GroupSize[] = ['Solo', 'Pair', '3+'];
export const PRIORITY_OPTIONS: Priority[] = ['Food', 'Seat'];
export const IMMERSION_OPTIONS: Immersion[] = ['Mobile', 'Conversation', 'Solitude', 'Laptop'];
export const MEAL_OPTIONS = ['Breakfast', 'Lunch', 'Dinner'];
