import { writable, derived } from 'svelte/store';

export interface PlacedSeat {
	id: string;
	type: 'chair' | 'bench';
}

export interface QuizState {
	currentFrame: number;
	mealTime: string | null;
	groupSize: string | null;
	priority: string | null;
	immersion: string | null;
	map1Seat: PlacedSeat | null;
	map2Seat: PlacedSeat | null;
	map3Seat: PlacedSeat | null;
	dwelling1: string | null;
	dwelling2: string | null;
	archetype: string | null;
	submitted: boolean;
}

const initialState: QuizState = {
	currentFrame: 1,
	mealTime: null,
	groupSize: null,
	priority: null,
	immersion: null,
	map1Seat: null,
	map2Seat: null,
	map3Seat: null,
	dwelling1: null,
	dwelling2: null,
	archetype: null,
	submitted: false
};

function createQuizStore() {
	const { subscribe, set, update } = writable<QuizState>({ ...initialState });

	return {
		subscribe,
		setMealTime: (value: string) => update((s) => ({ ...s, mealTime: value })),
		setGroupSize: (value: string) => update((s) => ({ ...s, groupSize: value })),
		setPriority: (value: string) => update((s) => ({ ...s, priority: value })),
		setImmersion: (value: string) => update((s) => ({ ...s, immersion: value })),
		setMap1Seat: (seat: PlacedSeat) => update((s) => ({ ...s, map1Seat: seat })),
		setMap2Seat: (seat: PlacedSeat) => update((s) => ({ ...s, map2Seat: seat })),
		setMap3Seat: (seat: PlacedSeat) => update((s) => ({ ...s, map3Seat: seat })),
		setDwelling1: (value: string) => update((s) => ({ ...s, dwelling1: value })),
		setDwelling2: (value: string) => update((s) => ({ ...s, dwelling2: value })),
		setArchetype: (value: string) => update((s) => ({ ...s, archetype: value })),
		setSubmitted: (value: boolean) => update((s) => ({ ...s, submitted: value })),
		nextFrame: () => update((s) => ({ ...s, currentFrame: s.currentFrame + 1 })),
		prevFrame: () => update((s) => ({ ...s, currentFrame: Math.max(1, s.currentFrame - 1) })),
		goToFrame: (frame: number) => update((s) => ({ ...s, currentFrame: frame })),
		reset: () => set({ ...initialState })
	};
}

export const quizStore = createQuizStore();
