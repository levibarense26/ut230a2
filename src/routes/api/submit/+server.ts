import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { saveSubmission } from '$lib/db';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();
		
		const required = ['meal_time', 'group_size', 'priority', 'immersion', 'map1_seat', 'map2_seat', 'map3_seat', 'dwelling1', 'dwelling2', 'archetype'];
		
		for (const field of required) {
			if (!(field in data)) {
				return json({ error: `Missing field: ${field}` }, { status: 400 });
			}
		}

		const id = saveSubmission({
			meal_time: data.meal_time,
			group_size: data.group_size,
			priority: data.priority,
			immersion: data.immersion,
			map1_seat: data.map1_seat,
			map2_seat: data.map2_seat,
			map3_seat: data.map3_seat,
			dwelling1: data.dwelling1,
			dwelling2: data.dwelling2,
			archetype: data.archetype
		});

		return json({ success: true, id });
	} catch (error) {
		console.error('Submit error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
