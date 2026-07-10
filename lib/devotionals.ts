import fs from "fs";
import path from "path";

export interface Devotional {
  day: number;
  reference: string;
  title: string;
  commentary: string;
  application: string;
}

const DEVOTIONALS_DIR = path.join(process.cwd(), "data", "devotionals");

let cache: Map<number, Devotional> | null = null;

function loadAll(): Map<number, Devotional> {
  if (cache) return cache;
  const map = new Map<number, Devotional>();
  if (fs.existsSync(DEVOTIONALS_DIR)) {
    const files = fs.readdirSync(DEVOTIONALS_DIR).filter((f) => f.endsWith(".json"));
    for (const file of files) {
      const raw = fs.readFileSync(path.join(DEVOTIONALS_DIR, file), "utf8");
      const entries = JSON.parse(raw) as Devotional[];
      for (const entry of entries) {
        map.set(entry.day, entry);
      }
    }
  }
  cache = map;
  return map;
}

export function getDevotional(day: number): Devotional | undefined {
  return loadAll().get(day);
}
