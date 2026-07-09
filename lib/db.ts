import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "app.db");

declare global {
  var __bibleDb: Database.Database | undefined;
}

interface MemberConfig {
  name: string;
  pin: string;
}

function membersFromEnv(): MemberConfig[] {
  const defaults: MemberConfig[] = [
    { name: "Membro 1", pin: "1111" },
    { name: "Membro 2", pin: "2222" },
    { name: "Membro 3", pin: "3333" },
  ];
  return defaults.map((d, i) => ({
    name: process.env[`MEMBER${i + 1}_NAME`] || d.name,
    pin: process.env[`MEMBER${i + 1}_PIN`] || d.pin,
  }));
}

function migrate(db: Database.Database) {
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      pin_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS confirmations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      day INTEGER NOT NULL,
      confirmed_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, day)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

function seedUsers(db: Database.Database) {
  const upsert = db.prepare(
    `INSERT INTO users (name, pin_hash) VALUES (?, ?)
     ON CONFLICT(name) DO UPDATE SET pin_hash = excluded.pin_hash`
  );
  for (const member of membersFromEnv()) {
    const pinHash = bcrypt.hashSync(member.pin, 10);
    upsert.run(member.name, pinHash);
  }
}

function seedStartDate(db: Database.Database) {
  const existing = db.prepare(`SELECT value FROM settings WHERE key = 'plan_start_date'`).get() as
    | { value: string }
    | undefined;
  if (!existing) {
    const startDate = process.env.PLAN_START_DATE || new Date().toISOString().slice(0, 10);
    db.prepare(`INSERT INTO settings (key, value) VALUES ('plan_start_date', ?)`).run(startDate);
  }
}

export function getDb(): Database.Database {
  if (!global.__bibleDb) {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    const db = new Database(DB_PATH);
    migrate(db);
    seedUsers(db);
    seedStartDate(db);
    global.__bibleDb = db;
  }
  return global.__bibleDb;
}

export interface User {
  id: number;
  name: string;
  pin_hash: string;
}

export function findUserByName(name: string): User | undefined {
  return getDb().prepare(`SELECT * FROM users WHERE name = ?`).get(name) as User | undefined;
}

export function getUserById(id: number): User | undefined {
  return getDb().prepare(`SELECT * FROM users WHERE id = ?`).get(id) as User | undefined;
}

export function listUsers(): User[] {
  return getDb().prepare(`SELECT * FROM users ORDER BY id`).all() as User[];
}

export function verifyPin(user: User, pin: string): boolean {
  return bcrypt.compareSync(pin, user.pin_hash);
}

export function getPlanStartDate(): string {
  const row = getDb().prepare(`SELECT value FROM settings WHERE key = 'plan_start_date'`).get() as
    | { value: string }
    | undefined;
  return row!.value;
}

export function confirmReading(userId: number, day: number): void {
  getDb()
    .prepare(
      `INSERT INTO confirmations (user_id, day) VALUES (?, ?)
       ON CONFLICT(user_id, day) DO NOTHING`
    )
    .run(userId, day);
}

export function unconfirmReading(userId: number, day: number): void {
  getDb().prepare(`DELETE FROM confirmations WHERE user_id = ? AND day = ?`).run(userId, day);
}

export interface ConfirmationRow {
  user_id: number;
  day: number;
  confirmed_at: string;
}

export function getConfirmationsForDay(day: number): ConfirmationRow[] {
  return getDb()
    .prepare(`SELECT * FROM confirmations WHERE day = ?`)
    .all(day) as ConfirmationRow[];
}

export function getConfirmationsForUser(userId: number): ConfirmationRow[] {
  return getDb()
    .prepare(`SELECT * FROM confirmations WHERE user_id = ? ORDER BY day`)
    .all(userId) as ConfirmationRow[];
}

export function getAllConfirmations(): ConfirmationRow[] {
  return getDb().prepare(`SELECT * FROM confirmations`).all() as ConfirmationRow[];
}
