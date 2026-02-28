const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'ecocycle.db');
const db = new Database(dbPath);

const data = [
    { year: "2019", volume: 15.6, rate: 45 },
    { year: "2020", volume: 20.0, rate: 52 },
    { year: "2021", volume: 29.4, rate: 65 },
    { year: "2022", volume: 41.5, rate: 75 },
    { year: "2023", volume: 62.3, rate: 82 },
    { year: "2024", volume: 65.4, rate: 86 },
];

console.log("Seeding industry recycling data into SQLite...");

data.forEach(stat => {
    try {
        db.prepare(`
            INSERT INTO recycling_stats (year, volume, rate) 
            VALUES (?, ?, ?) 
            ON CONFLICT(year) DO UPDATE SET 
            volume=excluded.volume, rate=excluded.rate, updated_at=CURRENT_TIMESTAMP
        `).run(stat.year, stat.volume, stat.rate);
        console.log(`Seeded stats for year ${stat.year}`);
    } catch (e) {
        // Table might not exist if db.ts hasn't been accessed yet to trigger init
        if (e.message.includes('no such table')) {
            console.log("Database table 'recycling_stats' not found. Creating it now...");
            db.exec(`
                CREATE TABLE IF NOT EXISTS recycling_stats (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  year TEXT UNIQUE,
                  volume REAL,
                  rate REAL,
                  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
             `);
            // retry
            db.prepare(`
                INSERT INTO recycling_stats (year, volume, rate) 
                VALUES (?, ?, ?) 
                ON CONFLICT(year) DO UPDATE SET 
                volume=excluded.volume, rate=excluded.rate, updated_at=CURRENT_TIMESTAMP
            `).run(stat.year, stat.volume, stat.rate);
            console.log(`Seeded stats for year ${stat.year} after table creation`);
        } else {
            console.error(e);
        }
    }
});

console.log("Seeding completed successfully.");
db.close();
