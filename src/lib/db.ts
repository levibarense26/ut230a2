import { neon } from '@neondatabase/serverless';
import { env } from '$env/dynamic/private';

let sql: ReturnType<typeof neon> | null = null;

function getSql() {
	if (!sql) {
		sql = neon(env.DATABASE_URL);
	}
	return sql;
}

export interface Submission {
	id?: number;
	created_at?: string;
	meal_time: string;
	group_size: string;
	priority: string;
	immersion: string;
	map1_seat: { x: number; y: number };
	map2_seat: { x: number; y: number };
	map3_seat: { x: number; y: number };
	dwelling1: string;
	dwelling2: string;
	archetype: string;
}

export interface AggregateData {
	submissions: Submission[];
}

export async function saveSubmission(data: Submission): Promise<number> {
	const db = getSql();
	const result = await db`
		INSERT INTO submissions (meal_time, group_size, priority, immersion, map1_seat, map2_seat, map3_seat, dwelling1, dwelling2, archetype)
		VALUES (
			${data.meal_time},
			${data.group_size},
			${data.priority},
			${data.immersion},
			${JSON.stringify(data.map1_seat)}::jsonb,
			${JSON.stringify(data.map2_seat)}::jsonb,
			${JSON.stringify(data.map3_seat)}::jsonb,
			${data.dwelling1},
			${data.dwelling2},
			${data.archetype}
		)
		RETURNING id
	`;
	return (result as any)[0].id;
}

export async function getAllSubmissions(): Promise<AggregateData> {
	const db = getSql();
	const rows = await db`SELECT * FROM submissions` as Record<string, any>[];
	return {
		submissions: rows.map((row) => ({
			...row,
			map1_seat: row.map1_seat,
			map2_seat: row.map2_seat,
			map3_seat: row.map3_seat
		})) as Submission[]
	};
}

export async function getSubmissionsByMealTime(mealTime: string): Promise<AggregateData> {
	const db = getSql();
	const rows = await db`SELECT * FROM submissions WHERE meal_time = ${mealTime}` as Record<string, any>[];
	return {
		submissions: rows.map((row) => ({
			...row,
			map1_seat: row.map1_seat,
			map2_seat: row.map2_seat,
			map3_seat: row.map3_seat
		})) as Submission[]
	};
}
