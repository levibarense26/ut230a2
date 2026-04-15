import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL!);

async function setup() {
	console.log('Creating submissions table...');
	await sql`
		CREATE TABLE IF NOT EXISTS submissions (
			id SERIAL PRIMARY KEY,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			meal_time TEXT NOT NULL,
			group_size TEXT NOT NULL,
			priority TEXT NOT NULL,
			immersion TEXT NOT NULL,
			map1_seat JSONB NOT NULL,
			map2_seat JSONB NOT NULL,
			map3_seat JSONB NOT NULL,
			dwelling1 TEXT NOT NULL,
			dwelling2 TEXT NOT NULL,
			archetype TEXT NOT NULL
		)
	`;
	console.log('Done!');
}

setup().catch(console.error);
