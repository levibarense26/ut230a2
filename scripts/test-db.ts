import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function main() {
	console.log('Inserting test row...');
	const result = await sql`
		INSERT INTO submissions (meal_time, group_size, priority, immersion, map1_seat, map2_seat, map3_seat, dwelling1, dwelling2, archetype)
		VALUES (
			'Lunch',
			'Solo',
			'Food',
			'Laptop',
			'{"x":100,"y":200}'::jsonb,
			'{"x":150,"y":250}'::jsonb,
			'{"x":180,"y":220}'::jsonb,
			'15-30',
			'15-30',
			'iPad Kid'
		)
		RETURNING id
	`;
	console.log('Inserted with id:', result[0].id);

	const rows = await sql`SELECT * FROM submissions`;
	console.log('All rows:', JSON.stringify(rows, null, 2));
}

main().catch(e => console.error('Error:', e.message));
