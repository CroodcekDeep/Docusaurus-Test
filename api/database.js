const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'db.sqlite');

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL DEFAULT 'base-de-datos-demo',
    sidebar_position INTEGER DEFAULT 0,
    author TEXT DEFAULT '',
    last_updated TEXT DEFAULT (date('now')),
    content TEXT NOT NULL DEFAULT ''
  )
`);

module.exports = db;
