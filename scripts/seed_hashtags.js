const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'ecocycle.db');
const db = new Database(dbPath);

console.log('Inserting test posts with hashtags...');

const run = db.prepare('INSERT INTO posts (title, content, author_username) VALUES (?, ?, ?)');

run.run(
    '电池回收的新技术讨论',
    '大家觉得现在的 #电池回收 技术成熟吗？另外相比之下 #锂电池 的回收利润好像更好一些。',
    'admin'
);

run.run(
    '最新环保政策解读',
    '昨天发布的 #环保政策 提到，未来对 #新能源 企业的补贴会进一步倾斜。尤其是对于 #碳中和 有贡献的企业。',
    'admin'
);

run.run(
    '为什么要做碳中和',
    '其实 #碳中和 是全球趋势，不仅是 #环保政策 导向，也关乎到 #新能源 行业的存亡。另外 #电池回收 也是重要一环。',
    'admin'
);

// Add more weights to #电池回收 and #新能源
for (let i = 0; i < 3; i++) {
    run.run(
        `测试贴：电池回收重要性 ${i}`,
        `毫无疑问 #电池回收 是核心。`,
        'admin'
    );
}

for (let i = 0; i < 2; i++) {
    run.run(
        `测试贴：新能源发展趋势 ${i}`,
        `#新能源 势不可挡。`,
        'admin'
    );
}

console.log('✅ Inserted hashtags successfully!');
