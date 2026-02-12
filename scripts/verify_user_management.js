const fs = require('fs');
const logFile = 'verification_users.log';
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
        const text = await res.text();
        throw new Error(`Login failed for ${username}: ${res.status} ${res.statusText} - ${text}`);
    }

    const cookie = res.headers.get('set-cookie');
    return cookie;
}

async function register(username, password) {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, nickname: 'TestUserToDelete' })
    });

    if (!res.ok) {
        const text = await res.text();
        if (!text.includes('already exists')) {
            throw new Error(`Register failed: ${text}`);
        }
    }
}

async function run() {
    fs.writeFileSync(logFile, '', 'utf8');
    log('Starting User Management Verification...');

    const userToDelete = 'user_to_delete_' + Date.now();
    const password = 'password123';

    // 1. Register User to Delete
    log(`1. Registering user ${userToDelete}...`);
    await register(userToDelete, password);

    // 2. Login as Admin
    log('2. Logging in as Admin...');
    const adminCookie = await login('admin', 'admin123');
    log('   Admin logged in.');

    // 3. Verify User Exists in List
    log('3. Fetching user list...');
    const listRes = await fetch(`${BASE_URL}/api/admin/users`, {
        headers: { 'Cookie': adminCookie }
    });
    const listData = await listRes.json();
    const foundUser = listData.users.find(u => u.username === userToDelete);

    if (!foundUser) {
        log('Error: Newly registered user not found in admin list.');
        process.exit(1);
    }
    log('   User found in list.');

    // 4. Delete User
    log('4. Deleting user...');
    const deleteRes = await fetch(`${BASE_URL}/api/admin/users`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': adminCookie
        },
        body: JSON.stringify({ username: userToDelete })
    });

    if (!deleteRes.ok) {
        log('Error: Delete failed ' + await deleteRes.text());
        process.exit(1);
    }
    log('   User deleted successfully.');

    // 5. Verify User Gone from List
    log('5. Verifying user is gone...');
    const listRes2 = await fetch(`${BASE_URL}/api/admin/users`, {
        headers: { 'Cookie': adminCookie }
    });
    const listData2 = await listRes2.json();
    const foundUser2 = listData2.users.find(u => u.username === userToDelete);

    if (foundUser2) {
        log('Error: User still exists in list after deletion.');
        process.exit(1);
    }
    log('   User is gone from list.');

    // 6. Verify Login Fails for Deleted User
    log('6. Verifying login fails for deleted user...');
    try {
        await login(userToDelete, password);
        log('Error: Login succeeded for deleted user (should fail).');
        process.exit(1);
    } catch (e) {
        log('   Login failed as expected.');
    }

    log('VERIFICATION SUCCESSFUL');
}

run().catch(err => {
    fs.appendFileSync(logFile, 'Verification Failed: ' + err.stack + '\n', 'utf8');
    process.exit(1);
});
