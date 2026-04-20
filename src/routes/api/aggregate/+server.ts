import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { neon } from '@neondatabase/serverless';
import { env } from '$env/dynamic/private';

function getSql() {
	return neon(env.DATABASE_URL);
}

export const GET: RequestHandler = async ({ url }) => {
	try {
		const mealTime = url.searchParams.get('meal_time');
		const dataMode = url.searchParams.get('data_mode') || 'submissions';
		
		const tableName = dataMode === 'observations' ? 'observations' : 'submissions';
		const db = getSql();
		
		let rows: Record<string, any>[] = [];
		
		if (mealTime && mealTime !== 'All') {
			if (tableName === 'submissions') {
				rows = await db`SELECT * FROM submissions WHERE meal_time = ${mealTime}`;
			} else {
				rows = await db`SELECT * FROM observations WHERE meal_time = ${mealTime}`;
			}
		} else {
			if (tableName === 'submissions') {
				rows = await db`SELECT * FROM submissions`;
			} else {
				rows = await db`SELECT * FROM observations`;
			}
		}
		
		
		
		return json({ [tableName]: rows });
	} catch (error) {
		console.error('Aggregate error:', error);
		return json({ error: String(error) }, { status: 500 });
	}
};