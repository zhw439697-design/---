const fs = require('fs');
const logFile = 'verification_content.log';
const BASE_URL = 'http://localhost:3000';

function log(msg) {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n', 'utf8');
}

async function login(username, password) {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
        throw new Error(`Login failed for ${username}: ${res.status}`);
    }

    return res.headers.get('set-cookie');
}

async function createPost(cookie, title, content) {
    const res = await fetch(`${BASE_URL}/api/community/posts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': cookie
        },
        body: JSON.stringify({ title, content })
    });

    if (!res.ok) {
        throw new Error(`Create post failed: ${await res.text()}`);
    }
    const data = await res.json();
    return data.post;
}

async function deletePostAsAdmin(adminCookie, postId) {
    const res = await fetch(`${BASE_URL}/api/admin/posts`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': adminCookie
        },
        body: JSON.stringify({ id: postId })
    });

    if (!res.ok) {
        throw new Error(`Delete post failed: ${await res.text()}`);
    }
    return true;
}

async function run() {
    fs.writeFileSync(logFile, '', 'utf8');
    log('Starting Content Audit Verification...');

    // 1. Login as User
    log('1. Logging in as user...');
    // Register if not exists? Assuming user exists from previous steps or use admin as user
    // register is safer
    const username = 'poster_' + Date.now();
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: 'password123', nickname: 'Poster' })
    });
    if (!regRes.ok) {
        log(`Register failed: ${regRes.status} ${await regRes.text()}`);
    } else {
        log('Register success');
    }
    const userCookie = await login(username, 'password123');

    // 2. Create Post
    log('2. Creating post...');
    const postTitle = 'Test Post ' + Date.now();
    const post = await createPost(userCookie, postTitle, 'This is a test post content.');
    log(`   Post created with ID: ${post.id}`);

    // 3. Login as Admin
    log('3. Logging in as admin...');
    const adminCookie = await login('admin', 'admin123');

    // 4. Verify Post in Admin List
    log('4. Checking admin posts list...');
    const listRes = await fetch(`${BASE_URL}/api/admin/posts`, {
        headers: { 'Cookie': adminCookie }
    });
    const listData = await listRes.json();
    const foundPost = listData.posts.find(p => p.id == post.id);

    if (!foundPost) {
        log('Error: Created post not found in admin list.');
        process.exit(1);
    }
    log('   Post found in admin list.');

    // 5. Delete Post
    log('5. Deleting post...');
    await deletePostAsAdmin(adminCookie, post.id);
    log('   Post deleted successfully.');

    // 6. Verify Post Gone from Community
    log('6. Verifying post is gone from community...');
    const communityRes = await fetch(`${BASE_URL}/api/community/posts`);
    const communityData = await communityRes.json();
    const foundPost2 = communityData.posts.find(p => p.id == post.id);

    if (foundPost2) {
        log('Error: Post still visible in community after deletion.');
        process.exit(1);
    }
    log('   Post is gone from community.');

    log('VERIFICATION SUCCESSFUL');
}

run().catch(err => {
    fs.appendFileSync(logFile, 'Verification Failed: ' + err.stack + '\n', 'utf8');
    process.exit(1);
});
