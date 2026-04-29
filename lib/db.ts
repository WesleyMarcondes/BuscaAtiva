import Database from 'better-sqlite3';
import path from 'path';

let db: any = null;

const getDb = () => {
  if (db) return db;

  // Check if we are in a serverless environment (Vercel)
  const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

  try {
    const dbPath = path.resolve(process.cwd(), 'database.sqlite');

    // On Vercel, we shouldn't try to write to the filesystem
    if (isVercel) {
      console.warn('Running on Vercel: SQLite persistence is disabled. Using mock DB.');
      return createMockDb();
    }

    db = new Database(dbPath);

    // Initialize tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        class TEXT NOT NULL,
        responsible TEXT,
        phone TEXT,
        absences INTEGER DEFAULT 0,
        consecutive INTEGER DEFAULT 0,
        status TEXT DEFAULT 'Presente',
        last_notified TEXT,
        atestado_end_date TEXT,
        observations TEXT
      );

      CREATE TABLE IF NOT EXISTS absences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        FOREIGN KEY (student_id) REFERENCES students(id)
      );

      CREATE TABLE IF NOT EXISTS configs (
        key TEXT PRIMARY KEY,
        value TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_students_name ON students(name);
      CREATE INDEX IF NOT EXISTS idx_students_class ON students(class);
      CREATE INDEX IF NOT EXISTS idx_absences_student_id ON absences(student_id);
    `);

    // Migration: Add last_notified column if it doesn't exist
    try {
      db.prepare('ALTER TABLE students ADD COLUMN last_notified TEXT').run();
    } catch (e) {
      // Column already exists
    }

    // Migration: Add atestado_end_date column if it doesn't exist
    try {
      db.prepare('ALTER TABLE students ADD COLUMN atestado_end_date TEXT').run();
    } catch (e) {
      // Column already exists
    }

    // Migration: Add observations column if it doesn't exist
    try {
      db.prepare('ALTER TABLE students ADD COLUMN observations TEXT').run();
    } catch (e) {
      // Column already exists
    }

    return db;
  } catch (error) {
    console.error('Failed to initialize SQLite:', error);
    return createMockDb();
  }
};

function createMockDb() {
  return {
    prepare: () => ({
      all: () => [],
      run: () => ({}),
      get: () => null,
    }),
    exec: () => ({}),
    transaction: (cb: any) => (args: any) => cb(args),
  };
}

export default getDb;
