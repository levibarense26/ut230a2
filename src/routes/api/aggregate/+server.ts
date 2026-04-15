import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAllSubmissions, getSubmissionsByMealTime } from '$lib/db';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const mealTime = url.searchParams.get('meal_time');

		let data;
		if (mealTime) {
			data = await getSubmissionsByMealTime(mealTime);
		} else {
			data = await getAllSubmissions();
		}

		return json(data);
	} catch (error) {
		console.error('Aggregate error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
