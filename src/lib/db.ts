import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const dbPath = path.join(process.cwd(), 'ecocycle.db'); //数据库路径
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
      user_id TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Migration: add user_id column if it doesn't exist
    try {
        db.exec(`ALTER TABLE users ADD COLUMN user_id TEXT`);
    } catch (e) {
        // Column already exists, ignore
    }
    // Create unique index for user_id (idempotent)
    try {
        db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id)`);
    } catch (e) {
        // Index may already exist
    }

    // Generate user_id for existing users who don't have one
    const usersWithoutId: any[] = db.prepare('SELECT username FROM users WHERE user_id IS NULL').all();
    for (const u of usersWithoutId) {
        const newId = generateUniqueUserId();
        db.prepare('UPDATE users SET user_id = ? WHERE username = ?').run(newId, u.username);
    }

    // Community tables
    db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      author_username TEXT NOT NULL,
      topic TEXT NOT NULL DEFAULT '综合',
      tags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_username) REFERENCES users(username)
    )
  `);

    // Add topic and tags columns if they don't exist
    try {
        db.exec(`ALTER TABLE posts ADD COLUMN topic TEXT NOT NULL DEFAULT '综合'`);
    } catch (e) {
        // Already exists
    }
    try {
        db.exec(`ALTER TABLE posts ADD COLUMN tags TEXT`);
    } catch (e) {
        // Already exists
    }

    db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      author_username TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (author_username) REFERENCES users(username)
    )
  `);

    db.exec(`
    CREATE TABLE IF NOT EXISTS likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_username TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(post_id, user_username),
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_username) REFERENCES users(username)
    )
  `);

    db.exec(`
    CREATE TABLE IF NOT EXISTS topic_follows (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_username TEXT NOT NULL,
      topic_name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_username, topic_name),
      FOREIGN KEY (user_username) REFERENCES users(username)
    )
  `);

    db.exec(`
    CREATE TABLE IF NOT EXISTS user_follows (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      follower_username TEXT NOT NULL,
      following_username TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(follower_username, following_username),
      FOREIGN KEY (follower_username) REFERENCES users(username),
      FOREIGN KEY (following_username) REFERENCES users(username)
    )
  `);

    db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_username TEXT NOT NULL,
      receiver_username TEXT NOT NULL,
      content TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_username) REFERENCES users(username),
      FOREIGN KEY (receiver_username) REFERENCES users(username)
    )
  `);

    db.exec(`
    CREATE TABLE IF NOT EXISTS expert_applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      name TEXT NOT NULL,
      field TEXT NOT NULL,
      contact TEXT NOT NULL,
      reason TEXT,
      type TEXT NOT NULL DEFAULT 'individual', -- individual, enterprise, organization
      status TEXT DEFAULT 'pending', -- pending, reviewing, approved, rejected
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (username) REFERENCES users(username)
    )
  `);

    // Industry Data
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
        'ALTER TABLE users ADD COLUMN verification_status TEXT DEFAULT "none"',
        'ALTER TABLE users ADD COLUMN verification_type TEXT',
        'ALTER TABLE expert_applications ADD COLUMN type TEXT DEFAULT "individual"'
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
    const userId = generateUniqueUserId();

    const insert = db.prepare('INSERT INTO users (username, password_hash, role, user_id) VALUES (?, ?, ?, ?)');
    const info = insert.run(username, hash, 'user', userId);

    return { id: info.lastInsertRowid, username, role: 'user', user_id: userId };
}

// Generate a unique 6-digit user ID
function generateUniqueUserId(): string {
    let attempts = 0;
    while (attempts < 100) {
        // Generate a random 6-digit number (100000 - 999999)
        const id = String(Math.floor(100000 + Math.random() * 900000));
        const existing = db.prepare('SELECT 1 FROM users WHERE user_id = ?').get(id);
        if (!existing) return id;
        attempts++;
    }
    // Fallback: use timestamp-based ID
    return String(Date.now()).slice(-8);
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

export function updatePassword(username: string, newPassword: string) {
    const user = getUser(username);
    if (!user) {
        throw new Error("User not found");
    }

    const salt = 'ecocycle_salt';
    const hash = crypto.createHash('sha256').update(newPassword + salt).digest('hex');

    const stmt = db.prepare('UPDATE users SET password_hash = ? WHERE username = ?');
    stmt.run(hash, username);

    return true;
}

export function getAllUsers() {
    // Return all users without sensitive info
    return db.prepare(`
        SELECT id, user_id, username, role, avatar_url, bio, birthday, email, phone, location, nickname, verification_status, verification_type, created_at 
        FROM users 
        ORDER BY created_at DESC
    `).all();
}

export function deleteUser(username: string) {
    const deleteTransaction = db.transaction(() => {
        // Delete related data manually just to be safe (though some have ON DELETE CASCADE)
        db.prepare('DELETE FROM expert_applications WHERE username = ?').run(username);
        db.prepare('DELETE FROM topic_follows WHERE user_username = ?').run(username);
        db.prepare('DELETE FROM user_follows WHERE follower_username = ? OR following_username = ?').run(username, username);
        db.prepare('DELETE FROM likes WHERE user_username = ?').run(username);

        // Comments and Posts usually cascade but let's be sure or rely on foreign keys if set
        db.prepare('DELETE FROM comments WHERE author_username = ?').run(username);
        db.prepare('DELETE FROM posts WHERE author_username = ?').run(username);

        // Finally delete user
        const result = db.prepare('DELETE FROM users WHERE username = ?').run(username);
        return result.changes > 0;
    });

    return deleteTransaction();
}

// ==================== Expert Application Helper Functions ====================

export function createExpertApplication(data: { username: string, name: string, field: string, contact: string, reason: string, type: string }) {
    // Auto-cleanup: Remove any existing PENDING applications for this user
    // This ensures "last one prevails" logic for pending requests
    db.prepare("DELETE FROM expert_applications WHERE username = ? AND status = 'pending'").run(data.username);

    const stmt = db.prepare(`
        INSERT INTO expert_applications (username, name, field, contact, reason, type)
        VALUES (?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(data.username, data.name, data.field, data.contact, data.reason, data.type);
    return { id: info.lastInsertRowid, ...data, status: 'pending' };
}

export function deleteExpertApplication(id: number) {
    const res = db.prepare('DELETE FROM expert_applications WHERE id = ?').run(id);
    return res.changes > 0;
}

export function getExpertApplication(username: string) {
    // Get the latest application for the user
    const stmt = db.prepare('SELECT * FROM expert_applications WHERE username = ? ORDER BY id DESC LIMIT 1');
    return stmt.get(username);
}

export function getAllExpertApplications(status?: string) {
    let query = 'SELECT * FROM expert_applications';
    const params: any[] = [];

    if (status) {
        query += ' WHERE status = ?';
        params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const stmt = db.prepare(query);
    return stmt.all(...params);
}

export function updateExpertApplicationStatus(id: number, status: string) {
    const stmt = db.prepare('UPDATE expert_applications SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(status, id);

    // If approved, update user role to expert (or add verification status)
    if (status === 'approved') {
        const app: any = db.prepare('SELECT username, type FROM expert_applications WHERE id = ?').get(id);
        if (app) {
            const updateStmt = db.prepare(`
                UPDATE users 
                SET role = CASE WHEN role = 'admin' THEN 'admin' ELSE 'expert' END, 
                    verification_type = ? 
                WHERE username = ?
            `);
            updateStmt.run(app.type, app.username);
        }
    }

    return db.prepare('SELECT * FROM expert_applications WHERE id = ?').get(id);
}


// ==================== Community Helper Functions ====================

// Posts (Rebuild Trigger)
export function createPost(title: string, content: string, authorUsername: string, topic: string = '综合', tags: string | null = null) {
    const stmt = db.prepare('INSERT INTO posts (title, content, author_username, topic, tags) VALUES (?, ?, ?, ?, ?)');
    const info = stmt.run(title, content, authorUsername, topic, tags);
    return { id: info.lastInsertRowid, title, content, author_username: authorUsername, topic, tags };
}

export function deletePost(id: number) {
    const deleteTransaction = db.transaction(() => {
        db.prepare('DELETE FROM likes WHERE post_id = ?').run(id);
        db.prepare('DELETE FROM comments WHERE post_id = ?').run(id);
        const result = db.prepare('DELETE FROM posts WHERE id = ?').run(id);
        return result.changes > 0;
    });
    return deleteTransaction();
}

export function getPosts(filter?: { username?: string; likedBy?: string; followedTopics?: string[] }) {
    let query = `
        SELECT 
            p.*,
            u.role as author_role,
            (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
            (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
        FROM posts p
        JOIN users u ON p.author_username = u.username
    `;

    const params: any[] = [];
    let whereClause = "";

    if (filter?.likedBy) {
        whereClause = ` WHERE p.id IN (SELECT post_id FROM likes WHERE user_username = ?)`;
        params.push(filter.likedBy);
    } else if (filter?.username) {
        whereClause = ` WHERE p.author_username = ?`;
        params.push(filter.username);
    }

    query += whereClause;

    query += ` ORDER BY p.created_at DESC`;

    const stmt = db.prepare(query);
    return stmt.all(...params);
}

export function getPostById(id: number) {
    const stmt = db.prepare(`
        SELECT 
            p.*,
            u.role as author_role,
            (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
            (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
        FROM posts p
        JOIN users u ON p.author_username = u.username
        WHERE p.id = ?
    `);
    return stmt.get(id);
}



// Comments
export function createComment(postId: number, content: string, authorUsername: string) {
    const stmt = db.prepare('INSERT INTO comments (post_id, content, author_username) VALUES (?, ?, ?)');
    const info = stmt.run(postId, content, authorUsername);
    return { id: info.lastInsertRowid, post_id: postId, content, author_username: authorUsername };
}

export function getComments(postId: number) {
    const stmt = db.prepare(`
        SELECT c.*, u.role as author_role
        FROM comments c
        JOIN users u ON c.author_username = u.username
        WHERE c.post_id = ?
        ORDER BY c.created_at ASC
    `);
    return stmt.all(postId);
}

export function deleteComment(id: number, username: string, isAdmin: boolean = false) {
    const comment: any = db.prepare('SELECT * FROM comments WHERE id = ?').get(id);
    if (!comment) return false;

    if (comment.author_username !== username && !isAdmin) {
        throw new Error('Unauthorized');
    }

    const stmt = db.prepare('DELETE FROM comments WHERE id = ?');
    stmt.run(id);
    return true;
}

// Likes
export function toggleLike(postId: number, username: string) {
    const existing = db.prepare('SELECT * FROM likes WHERE post_id = ? AND user_username = ?').get(postId, username);

    if (existing) {
        // Unlike
        db.prepare('DELETE FROM likes WHERE post_id = ? AND user_username = ?').run(postId, username);
        return { action: 'unliked', likesCount: getLikesCount(postId) };
    } else {
        // Like
        db.prepare('INSERT INTO likes (post_id, user_username) VALUES (?, ?)').run(postId, username);
        return { action: 'liked', likesCount: getLikesCount(postId) };
    }
}

export function getLikesCount(postId: number): number {
    const result: any = db.prepare('SELECT COUNT(*) as count FROM likes WHERE post_id = ?').get(postId);
    return result.count;
}

export function isPostLikedByUser(postId: number, username: string): boolean {
    const result = db.prepare('SELECT * FROM likes WHERE post_id = ? AND user_username = ?').get(postId, username);
    return !!result;
}

export function getUserLikedPosts(username: string): number[] {
    const results: any[] = db.prepare('SELECT post_id FROM likes WHERE user_username = ?').all(username);
    return results.map(r => r.post_id);
}

// Topic Follows
export function toggleTopicFollow(topicName: string, username: string) {
    const existing = db.prepare('SELECT * FROM topic_follows WHERE topic_name = ? AND user_username = ?').get(topicName, username);

    if (existing) {
        // Unfollow
        db.prepare('DELETE FROM topic_follows WHERE topic_name = ? AND user_username = ?').run(topicName, username);
        return { action: 'unfollowed' };
    } else {
        // Follow
        db.prepare('INSERT INTO topic_follows (topic_name, user_username) VALUES (?, ?)').run(topicName, username);
        return { action: 'followed' };
    }
}

export function getFollowedTopics(username: string): string[] {
    const results: any[] = db.prepare('SELECT topic_name FROM topic_follows WHERE user_username = ?').all(username);
    return results.map(r => r.topic_name);
}

// User Statistics
export function getUserStats(username: string) {
    // Get posts count
    const postsResult: any = db.prepare('SELECT COUNT(*) as count FROM posts WHERE author_username = ?').get(username);
    const postsCount = postsResult?.count || 0;

    // Get following count (users this user follows)
    const followingResult: any = db.prepare('SELECT COUNT(*) as count FROM user_follows WHERE follower_username = ?').get(username);
    const followingCount = followingResult?.count || 0;

    // Get followers count (users who follow this user)
    const followersResult: any = db.prepare('SELECT COUNT(*) as count FROM user_follows WHERE following_username = ?').get(username);
    const followersCount = followersResult?.count || 0;

    return { postsCount, followingCount, followersCount };
}

// Search users by username, nickname, or user_id
export function searchUsers(query: string, currentUsername?: string, limit = 20) {
    const searchTerm = `%${query}%`;
    let sql = `
        SELECT username, nickname, role, bio, avatar_url, user_id
        FROM users
        WHERE (username LIKE ? OR nickname LIKE ? OR user_id LIKE ?)
    `;
    const params: any[] = [searchTerm, searchTerm, searchTerm];

    if (currentUsername) {
        sql += ` AND username != ?`;
        params.push(currentUsername);
    }

    sql += ` ORDER BY username ASC LIMIT ?`;
    params.push(limit);

    return db.prepare(sql).all(...params);
}

// Global Community Statistics
export function getCommunityStats() {
    // Total posts count
    const postsResult: any = db.prepare('SELECT COUNT(*) as count FROM posts').get();
    const postsCount = postsResult?.count || 0;

    // Active users (mapped to total users)
    const usersResult: any = db.prepare('SELECT COUNT(*) as count FROM users').get();
    const activeUsersCount = usersResult?.count || 0;

    // New users today
    const newUsersResult: any = db.prepare(`
            SELECT COUNT(*) as count 
            FROM users 
            WHERE date(created_at) = date('now', 'localtime')
        `).get();
    const newUsersTodayCount = newUsersResult?.count || 0;

    return {
        postsCount,
        activeUsersCount,
        newUsersTodayCount
    };
}

// Trending Topics
export function getTrendingTopics(limit: number = 5) {
    const posts = db.prepare('SELECT tags FROM posts WHERE tags IS NOT NULL').all() as { tags: string }[];
    const tagCounts: Record<string, number> = {};

    posts.forEach(post => {
        if (!post.tags) return;
        const tags = post.tags.split(' ').filter(t => t.startsWith('#'));
        tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
    });

    const sortedTopics = Object.entries(tagCounts)
        .map(([topic, count]) => ({ topic, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);

    return sortedTopics;
}

export function isTopicFollowedByUser(topicName: string, username: string): boolean {
    const result = db.prepare('SELECT * FROM topic_follows WHERE topic_name = ? AND user_username = ?').get(topicName, username);
    return !!result;
}

// User Follows
export function toggleUserFollow(followerUsername: string, followingUsername: string) {
    const existing = db.prepare('SELECT * FROM user_follows WHERE follower_username = ? AND following_username = ?').get(followerUsername, followingUsername);

    if (existing) {
        // Unfollow
        db.prepare('DELETE FROM user_follows WHERE follower_username = ? AND following_username = ?').run(followerUsername, followingUsername);
        return { action: 'unfollowed' };
    } else {
        // Follow
        db.prepare('INSERT INTO user_follows (follower_username, following_username) VALUES (?, ?)').run(followerUsername, followingUsername);
        return { action: 'followed' };
    }
}

export function isUserFollowing(followerUsername: string, followingUsername: string): boolean {
    const result = db.prepare('SELECT * FROM user_follows WHERE follower_username = ? AND following_username = ?').get(followerUsername, followingUsername);
    return !!result;
}

export function getUserFollowers(username: string) {
    const results: any[] = db.prepare(`
        SELECT u.username, u.nickname, u.role, u.bio, u.avatar_url
        FROM user_follows uf
        JOIN users u ON uf.follower_username = u.username
        WHERE uf.following_username = ?
        ORDER BY uf.created_at DESC
    `).all(username);
    return results;
}

export function getUserFollowing(username: string) {
    const results: any[] = db.prepare(`
        SELECT u.username, u.nickname, u.role, u.bio, u.avatar_url
        FROM user_follows uf
        JOIN users u ON uf.following_username = u.username
        WHERE uf.follower_username = ?
        ORDER BY uf.created_at DESC
    `).all(username);
    return results;
}

// ==================== Messaging Functions ====================

export function saveMessage(sender: string, receiver: string, content: string) {
    const stmt = db.prepare('INSERT INTO messages (sender_username, receiver_username, content) VALUES (?, ?, ?)');
    const info = stmt.run(sender, receiver, content);
    return {
        id: info.lastInsertRowid.toString(),
        sender_username: sender,
        receiver_username: receiver,
        content,
        created_at: new Date().toISOString()
    };
}

export function getMessagesBetween(user1: string, user2: string, limit: number = 50) {
    return db.prepare(`
        SELECT * FROM messages 
        WHERE (sender_username = ? AND receiver_username = ?) 
           OR (sender_username = ? AND receiver_username = ?)
        ORDER BY created_at ASC
        LIMIT ?
    `).all(user1, user2, user2, user1, limit);
}

export function getUnreadMessageCount(recipient: string, sender: string) {
    const result = db.prepare(`
        SELECT COUNT(*) as count FROM messages 
        WHERE receiver_username = ? AND sender_username = ? AND is_read = 0
    `).get(recipient, sender) as { count: number };
    return result.count;
}

export function markMessagesAsRead(recipient: string, sender: string) {
    return db.prepare(`
        UPDATE messages SET is_read = 1 
        WHERE receiver_username = ? AND sender_username = ? AND is_read = 0
    `).run(recipient, sender);
}

// ==================== Industry Data Functions ====================

export function getRecyclingStats() {
    return db.prepare('SELECT year, volume, rate FROM recycling_stats ORDER BY year ASC').all();
}

export function upsertRecyclingStat(year: string, volume: number, rate: number) {
    const stmt = db.prepare(`
        INSERT INTO recycling_stats (year, volume, rate) 
        VALUES (?, ?, ?) 
        ON CONFLICT(year) DO UPDATE SET 
        volume=excluded.volume, rate=excluded.rate, updated_at=CURRENT_TIMESTAMP
    `);
    const info = stmt.run(year, volume, rate);
    return { id: info.lastInsertRowid, year, volume, rate };
}

// Run initialization
try {
    initDB();
} catch (err) {
    console.error("Failed to initialize database:", err);
}

export default db;
