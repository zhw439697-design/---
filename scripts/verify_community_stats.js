const http = require('http');

async function testEndpoint(path) {
    return new Promise((resolve, reject) => {
        http.get(`http://localhost:3000${path}`, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode !== 200) {
                    reject(new Error(`Status ${res.statusCode}: ${data}`));
                } else {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(new Error(`Invalid JSON: ${data}`));
                    }
                }
            });
        }).on('error', reject);
    });
}

async function runTests() {
    console.log('Testing /api/community/stats...');
    try {
        const stats = await testEndpoint('/api/community/stats');
        console.log('✅ Stats API Success:', stats);
        if (typeof stats.postsCount !== 'number' || typeof stats.activeUsersCount !== 'number' || typeof stats.newUsersTodayCount !== 'number') {
            console.error('❌ Stats API Validation Failed: Missing numeric fields');
        } else {
            console.log('✅ Stats API Validation Passed');
        }
    } catch (e) {
        console.error('❌ Stats API Error:', e.message);
    }

    console.log('\nTesting /api/community/trending...');
    try {
        const trending = await testEndpoint('/api/community/trending');
        console.log('✅ Trending API Success:', JSON.stringify(trending, null, 2));
        if (!Array.isArray(trending.topics)) {
            console.error('❌ Trending API Validation Failed: topics is not an array');
        } else if (trending.topics.length > 0 && typeof trending.topics[0].topic !== 'string') {
            console.error('❌ Trending API Validation Failed: topics is not an array of objects with topic strings');
        } else {
            console.log('✅ Trending API Validation Passed');
        }
    } catch (e) {
        console.error('❌ Trending API Error:', e.message);
    }
}

runTests();
