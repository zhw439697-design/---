const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'ecocycle.db');
const db = new Database(dbPath);

console.log('Deleting all posts, comments, and likes...');

try {
    const deleteComments = db.prepare('DELETE FROM comments');
    const deleteLikes = db.prepare('DELETE FROM likes');
    const deletePosts = db.prepare('DELETE FROM posts');

    // Run in a transaction to ensure all or nothing
    const transaction = db.transaction(() => {
        const commentsResult = deleteComments.run();
        console.log(`Deleted ${commentsResult.changes} comments.`);

        const likesResult = deleteLikes.run();
        console.log(`Deleted ${likesResult.changes} likes.`);

        const postsResult = deletePosts.run();
        console.log(`Deleted ${postsResult.changes} posts.`);
    });

    transaction();
    console.log('✅ Successfully deleted all posts and related data.');
} catch (error) {
    console.error('❌ Error deleting posts:', error);
}
