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

    // Community tables
    db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      author_username TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_username) REFERENCES users(username)
    )
  `);

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

// ==================== Community Helper Functions ====================

// Posts
export function createPost(title: string, content: string, authorUsername: string) {
    const stmt = db.prepare('INSERT INTO posts (title, content, author_username) VALUES (?, ?, ?)');
    const info = stmt.run(title, content, authorUsername);
    return { id: info.lastInsertRowid, title, content, author_username: authorUsername };
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

    if (filter?.likedBy) {
        query += ` WHERE p.id IN (SELECT post_id FROM likes WHERE user_username = ?)`;
        params.push(filter.likedBy);
    }

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

export function deletePost(id: number, username: string, isAdmin: boolean = false) {
    const post: any = getPostById(id);
    if (!post) return false;

    if (post.author_username !== username && !isAdmin) {
        throw new Error('Unauthorized');
    }

    const stmt = db.prepare('DELETE FROM posts WHERE id = ?');
    stmt.run(id);
    return true;
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

    return {
        postsCount,
        followingCount,
        followersCount
    };
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

// Run initialization
try {
    initDB();
} catch (err) {
    console.error("Failed to initialize database:", err);
}

export default db;
