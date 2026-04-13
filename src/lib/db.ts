import Database from 'better-sqlite3';
import { building } from '$app/environment';

let db: Database.Database;

function getDb(): Database.Database {
	if (!db) {
		db = new Database('dining-hall-quiz.db');
		db.pragma('journal_mode = WAL');
		initSchema();
	}
	return db;
}

function initSchema() {
	db.exec(`
		CREATE TABLE IF NOT EXISTS submissions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			meal_time TEXT NOT NULL,
			group_size TEXT NOT NULL,
			priority TEXT NOT NULL,
			immersion TEXT NOT NULL,
			map1_seat TEXT NOT NULL,
			map2_seat TEXT NOT NULL,
			map3_seat TEXT NOT NULL,
			dwelling1 TEXT NOT NULL,
			dwelling2 TEXT NOT NULL,
			archetype TEXT NOT NULL
		)
	`);
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

export function saveSubmission(data: Submission): number {
	const db = getDb();
	const stmt = db.prepare(`
		INSERT INTO submissions (meal_time, group_size, priority, immersion, map1_seat, map2_seat, map3_seat, dwelling1, dwelling2, archetype)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`);
	const result = stmt.run(
		data.meal_time,
		data.group_size,
		data.priority,
		data.immersion,
		JSON.stringify(data.map1_seat),
		JSON.stringify(data.map2_seat),
		JSON.stringify(data.map3_seat),
		data.dwelling1,
		data.dwelling2,
		data.archetype
	);
	return result.lastInsertRowid as number;
}

export function getAllSubmissions(): AggregateData {
	const db = getDb();
	const rows = db.prepare('SELECT * FROM submissions').all() as any[];
	return {
		submissions: rows.map((row) => ({
			...row,
			map1_seat: JSON.parse(row.map1_seat),
			map2_seat: JSON.parse(row.map2_seat),
			map3_seat: JSON.parse(row.map3_seat)
		}))
	};
}

export function getSubmissionsByMealTime(mealTime: string): AggregateData {
	const db = getDb();
	const rows = db.prepare('SELECT * FROM submissions WHERE meal_time = ?').all(mealTime) as any[];
	return {
		submissions: rows.map((row) => ({
			...row,
			map1_seat: JSON.parse(row.map1_seat),
			map2_seat: JSON.parse(row.map2_seat),
			map3_seat: JSON.parse(row.map3_seat)
		}))
	};
}
