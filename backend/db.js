const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'data', 'myfinans.db');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db = null;

async function getDb() {
  if (db) return db;

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Enable foreign keys
  await db.run('PRAGMA foreign_keys = ON');

  // Initialize Tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS banks (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS expense_groups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL, -- 'credit_card', 'loan', 'debt', 'other'
      due_day INTEGER NOT NULL DEFAULT 15,
      statement_day INTEGER DEFAULT NULL,
      bank_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (bank_id) REFERENCES banks(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      group_id TEXT,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL, -- YYYY-MM-DD
      is_installment INTEGER NOT NULL DEFAULT 0,
      installment_count INTEGER NOT NULL DEFAULT 1,
      company_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (group_id) REFERENCES expense_groups(id) ON DELETE CASCADE,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS transaction_payments (
      transaction_id TEXT,
      year INTEGER,
      month INTEGER,
      is_paid INTEGER DEFAULT 0,
      PRIMARY KEY (transaction_id, year, month),
      FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
    );
  `);

  // Migration: Add statement_day column to expense_groups if it does not exist
  try {
    await db.run('ALTER TABLE expense_groups ADD COLUMN statement_day INTEGER DEFAULT NULL');
    console.log('Migrated db: Added statement_day to expense_groups');
  } catch (e) {
    // Column already exists, safe to ignore
  }

  // Migration: Add bank_id column to expense_groups if it does not exist
  try {
    await db.run('ALTER TABLE expense_groups ADD COLUMN bank_id TEXT REFERENCES banks(id) ON DELETE SET NULL');
    console.log('Migrated db: Added bank_id to expense_groups');
  } catch (e) {
    // Column already exists, safe to ignore
  }

  // Migration: Add company_id column to transactions if it does not exist
  try {
    await db.run('ALTER TABLE transactions ADD COLUMN company_id TEXT REFERENCES companies(id) ON DELETE SET NULL');
    console.log('Migrated db: Added company_id to transactions');
  } catch (e) {
    // Column already exists, safe to ignore
  }

  console.log('Database initialized successfully at:', dbPath);
  return db;
}

module.exports = { getDb };
