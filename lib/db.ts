import { createClient, type Client } from "@libsql/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "app.db");

declare global {
  var __bibleDb: Client | undefined;
  var __bibleDbInit: Promise<void> | undefined;
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

/** Cria (ou reaproveita) o cliente do banco. Usa o Turso em produção
 * (TURSO_DATABASE_URL/TURSO_AUTH_TOKEN) ou um arquivo SQLite local em desenvolvimento. */
function getClient(): Client {
  if (!global.__bibleDb) {
    const url = process.env.TURSO_DATABASE_URL;
    if (url) {
      global.__bibleDb = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
    } else {
      if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
      global.__bibleDb = createClient({ url: `file:${DB_PATH}` });
    }
  }
  return global.__bibleDb;
}

async function migrate(db: Client) {
  await db.batch(
    [
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        pin_hash TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS confirmations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id),
        day INTEGER NOT NULL,
        confirmed_at TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE(user_id, day)
      )`,
      `CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )`,
    ],
    "write"
  );
}

async function seedUsers(db: Client) {
  for (const member of membersFromEnv()) {
    const pinHash = bcrypt.hashSync(member.pin, 10);
    await db.execute({
      sql: `INSERT INTO users (name, pin_hash) VALUES (?, ?)
            ON CONFLICT(name) DO UPDATE SET pin_hash = excluded.pin_hash`,
      args: [member.name, pinHash],
    });
  }
}

async function seedStartDate(db: Client) {
  const existing = await db.execute({
    sql: `SELECT value FROM settings WHERE key = 'plan_start_date'`,
    args: [],
  });
  if (existing.rows.length === 0) {
    const startDate = process.env.PLAN_START_DATE || new Date().toISOString().slice(0, 10);
    await db.execute({
      sql: `INSERT INTO settings (key, value) VALUES ('plan_start_date', ?)`,
      args: [startDate],
    });
  }
}

async function ensureInit(): Promise<Client> {
  const db = getClient();
  if (!global.__bibleDbInit) {
    global.__bibleDbInit = (async () => {
      await migrate(db);
      await seedUsers(db);
      await seedStartDate(db);
    })();
  }
  await global.__bibleDbInit;
  return db;
}

export interface User {
  id: number;
  name: string;
  pin_hash: string;
}

function rowToUser(row: Record<string, unknown>): User {
  return { id: Number(row.id), name: String(row.name), pin_hash: String(row.pin_hash) };
}

export async function findUserByName(name: string): Promise<User | undefined> {
  const db = await ensureInit();
  const res = await db.execute({ sql: `SELECT * FROM users WHERE name = ?`, args: [name] });
  return res.rows[0] ? rowToUser(res.rows[0] as Record<string, unknown>) : undefined;
}

export async function getUserById(id: number): Promise<User | undefined> {
  const db = await ensureInit();
  const res = await db.execute({ sql: `SELECT * FROM users WHERE id = ?`, args: [id] });
  return res.rows[0] ? rowToUser(res.rows[0] as Record<string, unknown>) : undefined;
}

export async function listUsers(): Promise<User[]> {
  const db = await ensureInit();
  const res = await db.execute(`SELECT * FROM users ORDER BY id`);
  return res.rows.map((r) => rowToUser(r as Record<string, unknown>));
}

export function verifyPin(user: User, pin: string): boolean {
  return bcrypt.compareSync(pin, user.pin_hash);
}

export async function getPlanStartDate(): Promise<string> {
  const db = await ensureInit();
  const res = await db.execute(`SELECT value FROM settings WHERE key = 'plan_start_date'`);
  return String(res.rows[0].value);
}

export async function confirmReading(userId: number, day: number): Promise<void> {
  const db = await ensureInit();
  await db.execute({
    sql: `INSERT INTO confirmations (user_id, day) VALUES (?, ?)
          ON CONFLICT(user_id, day) DO NOTHING`,
    args: [userId, day],
  });
}

export async function unconfirmReading(userId: number, day: number): Promise<void> {
  const db = await ensureInit();
  await db.execute({
    sql: `DELETE FROM confirmations WHERE user_id = ? AND day = ?`,
    args: [userId, day],
  });
}

export interface ConfirmationRow {
  user_id: number;
  day: number;
  confirmed_at: string;
}

function rowToConfirmation(row: Record<string, unknown>): ConfirmationRow {
  return {
    user_id: Number(row.user_id),
    day: Number(row.day),
    confirmed_at: String(row.confirmed_at),
  };
}

export async function getConfirmationsForDay(day: number): Promise<ConfirmationRow[]> {
  const db = await ensureInit();
  const res = await db.execute({
    sql: `SELECT * FROM confirmations WHERE day = ?`,
    args: [day],
  });
  return res.rows.map((r) => rowToConfirmation(r as Record<string, unknown>));
}

export async function getConfirmationsForUser(userId: number): Promise<ConfirmationRow[]> {
  const db = await ensureInit();
  const res = await db.execute({
    sql: `SELECT * FROM confirmations WHERE user_id = ? ORDER BY day`,
    args: [userId],
  });
  return res.rows.map((r) => rowToConfirmation(r as Record<string, unknown>));
}

export async function getAllConfirmations(): Promise<ConfirmationRow[]> {
  const db = await ensureInit();
  const res = await db.execute(`SELECT * FROM confirmations`);
  return res.rows.map((r) => rowToConfirmation(r as Record<string, unknown>));
}
