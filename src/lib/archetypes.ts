export type DwellingTime = '<15 minutes' | '15-30 minutes' | '30-45 minutes' | '45+ minutes';
export type GroupSize = 'Just me' | 'With a friend' | 'A group of my friends';
export type Priority = 'Food' | 'Seat';
export type Immersion = 'Watch something on my phone' | 'Have a conversation' | 'Sit in silence' | 'Get some work done';

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
	{ groupSize: '1 or 2', immersion: 'Watch something on my phone', archetype: 'iPad Kid' },
	{ dwelling: '30-45 minutes', groupSize: '2+', immersion: 'Have a conversation', archetype: 'Group Hangout' },
	{ dwelling: '<15 minutes', priority: 'Food', archetype: 'Rushers' },
	{ groupSize: 'Just me', immersion: 'Get some work done', archetype: 'My way or the Highway' },
	{ archetype: 'Unicorn' }
];

function matchesRule(input: DecisionInput, rule: DecisionRule): boolean {
	if (rule.groupSize && rule.groupSize !== '-') {
		if (rule.groupSize === '1 or 2') {
			if (input.groupSize !== 'Just me' && input.groupSize !== 'With a friend') return false;
		} else if (rule.groupSize === '2+') {
			if (input.groupSize !== 'A group of my friends') return false;
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
	'iPad Kid': 'iPad Kids are the average Dining Hall users in the modern day. They typically eat by themselves, focusing on their phone and taking their time to eat. They make the most of their relaxation time in the dining hall by further disconnecting from reality and focusing more on the digital world. ',
	'Group Hangout': 'This archetype is what it sounds like: a group of friends hanging out at the dining hall. This is somewhat unusual for the dining hall, where the majority of people tend to eat alone. Rather than just going there for the food, these individuals want their dining hall experience to be fun and social. ',
	'Rushers': 'Rushers are in and out. Some only have a short window to eat and some don’t enjoy spending time in the dining hall. They want their dining hall experience to be as fast as possible.',
	'My way or the Highway': 'People in the “My Way” category want to sit how they want no matter what. If they don’t like the seating options that they see, they will move on. First and foremost, they are at the dining hall to enjoy the experience.',
	'Unicorn': 'Unicorns are not like the other girls. For one reason or another, they don’t fit into our archetypes.'
};

export const DWELLING_OPTIONS = ['<15', '15-30', '30-45', '45+'];
export const GROUP_OPTIONS: GroupSize[] = ['Just me', 'With a friend', 'A group of my friends'];
export const PRIORITY_OPTIONS: Priority[] = ['Food', 'Seat'];
export const IMMERSION_OPTIONS: Immersion[] = ['Watch something on my phone', 'Have a conversation', 'Sit in silence', 'Get some work done'];
export const MEAL_OPTIONS = ['Breakfast', 'Lunch', 'Dinner'];

// export type DwellingTime = 'Less than 15 minutes' | 'More than 15 minutes';
// export type GroupSize = 'Just me' | 'With friends';
// export type Priority = 'Food' | 'Seat';
// export type Immersion = 'Watch something on my phone' | 'Have a conversation' | 'Just sit in silence' | 'Get some work done';

// export interface DecisionInput {
// 	dwelling: DwellingTime | null;
// 	groupSize: GroupSize | null;
// 	priority: Priority | null;
// 	immersion: Immersion | null;
// }

// interface DecisionRule {
// 	dwelling?: DwellingTime | '-';
// 	groupSize?: GroupSize | '-';
// 	priority?: Priority | '-';
// 	immersion?: Immersion | '-';
// 	archetype: string;
// }

// const decisionTree: DecisionRule[] = [
// 	{ groupSize: 'Just me', immersion: 'Watch something on my phone', dwelling: 'More than 15 minutes', archetype: 'iPad Kid' },
// 	{ dwelling: 'More than 15 minutes', groupSize: 'With friends', immersion: 'Have a conversation', archetype: 'Group Hangout' },
// 	{ dwelling: 'Less than 15 minutes', priority: 'Food', archetype: 'Rushers' },
// 	{ groupSize: 'Just me', immersion: 'Get some work done', archetype: 'My way or the Highway' },
// 	{ archetype: 'Unicorn' }
// ];

// function matchesRule(input: DecisionInput, rule: DecisionRule): boolean {
// 	if (rule.groupSize && input.groupSize !== rule.groupSize) {
// 		return false;
// 		} 	
// 	if (rule.dwelling && input.dwelling !== rule.dwelling) {
// 		return false;
// 		}	
// 	if (rule.priority && input.priority !== rule.priority) {
// 		return false;
// 		}
// 	if (rule.immersion  && input.immersion !== rule.immersion) {
// 		return false;
// 		}
// 	return true;
// }

// export function determineArchetype(input: DecisionInput): string {
// 	for (const rule of decisionTree) {
// 		if (matchesRule(input, rule)) {
// 			return rule.archetype;
// 		}
// 	}
// 	return 'Unicorn';
// }

// export const ARCHETYPE_DESCRIPTIONS: Record<string, string> = {
// 	'iPad Kid': 'iPad Kids are the average Dining Hall users in the modern day. They typically eat by themselves, focusing on their phone and taking their time to eat. They make the most of their relaxation time in the dining hall by further disconnecting from reality and focusing more on the digital world. ',
// 	'Group Hangout': 'This archetype is what it sounds like: a group of friends hanging out at the dining hall. This is somewhat unusual for the dining hall, where the majority of people tend to eat alone. Rather than just going there for the food, these individuals want their dining hall experience to be fun and social. ',
// 	'Rushers': 'Rushers are in and out. Some only have a short window to eat and some don’t enjoy spending time in the dining hall. They want their dining hall experience to be as fast as possible.',
// 	'My way or the Highway': 'People in the “My Way” category want to sit how they want no matter what. If they don’t like the seating options that they see, they will move on. First and foremost, they are at the dining hall to enjoy the experience.',
// 	'Unicorn': 'Unicorns are not like the other girls. For one reason or another, they don’t fit into our archetypes. '
// };

// export const DWELLING_OPTIONS = ['Less than 15 minutes', 'More than 15 minutes'];
// export const GROUP_OPTIONS: GroupSize[] = ['Just me', 'With friends'];
// export const PRIORITY_OPTIONS: Priority[] = ['Food', 'Seat'];
// export const IMMERSION_OPTIONS: Immersion[] = ['Watch something on my phone', 'Have a conversation', 'Just sit in silence', 'Get some work done'];
// export const MEAL_OPTIONS = ['Breakfast', 'Lunch', 'Dinner'];
