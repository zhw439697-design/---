import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const dbPath = path.join(process.cwd(), 'ecocycle.db');
const db = new Database(dbPath);

// Initialize Database
export function initDB() {
    db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password_hash TEXT,
      role TEXT DEFAULT 'user',
      avatar_url TEXT,
      bio TEXT,
      birthday TEXT,
      email TEXT,
      phone TEXT,
      location TEXT,
      nickname TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Migration: Add new columns if they don't exist
    const migrations = [
        'ALTER TABLE users ADD COLUMN avatar_url TEXT',
        'ALTER TABLE users ADD COLUMN bio TEXT',
        'ALTER TABLE users ADD COLUMN birthday TEXT',
        'ALTER TABLE users ADD COLUMN email TEXT',
        'ALTER TABLE users ADD COLUMN phone TEXT',
        'ALTER TABLE users ADD COLUMN location TEXT',
        'ALTER TABLE users ADD COLUMN nickname TEXT',
        'ALTER TABLE users ADD COLUMN verification_status TEXT DEFAULT "none"',
        'ALTER TABLE users ADD COLUMN verification_type TEXT'
    ];

    migrations.forEach(migration => {
        try {
            db.exec(migration);
        } catch (err: any) {
            // Column already exists, ignore error
            if (!err.message.includes('duplicate column name')) {
                console.error('Migration error:', err.message);
            }
        }
    });

    // Create default admin user if not exists
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    const admin = stmt.get('admin');

    if (!admin) {
        // Simple hash for demo (in production use bcrypt)
        const salt = 'ecocycle_salt';
        const hash = crypto.createHash('sha256').update('admin123' + salt).digest('hex');

        const insert = db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)');
        insert.run('admin', hash, 'admin');
        console.log('Default admin user created: admin / admin123');
    }
}

// User helper functions
export function getUser(username: string) {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    return stmt.get(username);
}

export function verifyUser(username: string, password: string): boolean {
    const user: any = getUser(username);
    if (!user) return false;

    const salt = 'ecocycle_salt';
    const hash = crypto.createHash('sha256').update(password + salt).digest('hex');

    return hash === user.password_hash;
}

export function createUser(username: string, password: string) {
    // Check if user exists
    const existing = getUser(username);
    if (existing) {
        throw new Error("Username already exists");
    }

    const salt = 'ecocycle_salt';
    const hash = crypto.createHash('sha256').update(password + salt).digest('hex');

    const insert = db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)');
    const info = insert.run(username, hash, 'user');

    return { id: info.lastInsertRowid, username, role: 'user' };
}

export function updateUser(username: string, updates: any) {
    const allowedFields = ['avatar_url', 'bio', 'birthday', 'email', 'phone', 'location', 'nickname'];
    const fields = Object.keys(updates).filter(key => allowedFields.includes(key));

    if (fields.length === 0) return getUser(username);

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => updates[field]);

    const stmt = db.prepare(`UPDATE users SET ${setClause} WHERE username = ?`);
    stmt.run(...values, username);
    return getUser(username);
}

// Run initialization
try {
    initDB();
} catch (err) {
    console.error("Failed to initialize database:", err);
}

export default db;
