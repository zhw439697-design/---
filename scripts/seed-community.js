// 社区数据种子脚本
// 使用 better-sqlite3 插入示例数据

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'ecocycle.db');
const db = new Database(dbPath);

console.log('📊 开始插入社区示例数据...\n');

try {
    // 检查是否已有数据
    const existingPosts = db.prepare('SELECT COUNT(*) as count FROM posts').get();

    if (existingPosts.count > 0) {
        console.log(`⚠️  数据库中已有 ${existingPosts.count} 条帖子`);
        console.log('是否要继续添加示例数据? (这将添加更多帖子)\n');
    }

    // 插入示例帖子
    const insertPost = db.prepare(`
        INSERT INTO posts (title, content, author_username, created_at) 
        VALUES (?, ?, ?, ?)
    `);

    const posts = [
        {
            title: '动力电池回收行业的未来趋势',
            content: '随着新能源汽车的快速发展,动力电池回收已成为一个重要的环保议题。本文探讨了当前行业面临的挑战和未来的发展方向,包括技术创新、政策支持和商业模式等方面。',
            author: 'admin',
            daysAgo: 5
        },
        {
            title: '如何提高电池回收率?',
            content: '目前我国动力电池回收率还比较低,大家有什么好的建议吗?我认为可以从以下几个方面入手:1. 建立完善的回收网络 2. 提高回收技术水平 3. 加强政策引导和监管',
            author: 'admin',
            daysAgo: 4
        },
        {
            title: '梯次利用vs直接拆解,哪个更环保?',
            content: '退役动力电池有两种主要处理方式:梯次利用和直接拆解回收。从环保和经济角度来看,大家认为哪种方式更好?欢迎讨论!',
            author: 'admin',
            daysAgo: 3
        },
        {
            title: '新政策解读:《新能源汽车废旧动力电池综合利用行业规范条件》',
            content: '工信部最新发布的规范条件对行业有哪些影响?主要包括:企业准入门槛提高、技术要求更严格、环保标准升级等。这对中小企业来说既是挑战也是机遇。',
            author: 'admin',
            daysAgo: 2
        },
        {
            title: '分享:我们公司的电池回收实践经验',
            content: '我们公司从事动力电池回收已经3年了,积累了一些经验。主要包括:建立回收网点、与车企合作、开发自动化拆解设备等。欢迎同行交流!',
            author: 'admin',
            daysAgo: 1
        },
        {
            title: '锂电池回收技术的最新进展',
            content: '最近看到一些关于锂电池回收技术的新研究,包括湿法冶金、火法冶金和机械物理法的改进。有没有专家可以分享一下这些技术的优缺点?',
            author: 'admin',
            hoursAgo: 12
        },
        {
            title: '电池回收企业如何获得政府补贴?',
            content: '听说国家对电池回收企业有补贴政策,但申请流程比较复杂。有经验的朋友可以分享一下吗?需要准备哪些材料?',
            author: 'admin',
            hoursAgo: 6
        },
        {
            title: '动力电池全生命周期管理的重要性',
            content: '从电池生产、使用到回收,全生命周期管理对于提高资源利用率和降低环境影响至关重要。建议建立电池溯源系统,实现全程可追溯。',
            author: 'admin',
            hoursAgo: 3
        },
        {
            title: '求推荐:电池检测设备供应商',
            content: '我们公司准备采购一批电池检测设备,用于评估退役电池的健康状态。有没有推荐的供应商?主要关注性价比和售后服务。',
            author: 'admin',
            hoursAgo: 2
        },
        {
            title: '国际经验借鉴:欧美的电池回收体系',
            content: '欧美国家在电池回收方面起步较早,已经建立了比较完善的回收体系。我们可以学习他们的生产者责任延伸制度、押金制度等做法。',
            author: 'admin',
            hoursAgo: 1
        }
    ];

    let insertedCount = 0;
    const insertMany = db.transaction((posts) => {
        for (const post of posts) {
            const createdAt = post.daysAgo
                ? new Date(Date.now() - post.daysAgo * 24 * 60 * 60 * 1000).toISOString()
                : new Date(Date.now() - post.hoursAgo * 60 * 60 * 1000).toISOString();

            insertPost.run(post.title, post.content, post.author, createdAt);
            insertedCount++;
        }
    });

    insertMany(posts);
    console.log(`✅ 成功插入 ${insertedCount} 条帖子\n`);

    // 插入点赞数据
    const insertLike = db.prepare(`
        INSERT INTO likes (post_id, user_username, created_at) 
        VALUES (?, ?, ?)
    `);

    const likes = [
        { postId: 1, username: 'admin', daysAgo: 4 },
        { postId: 2, username: 'admin', daysAgo: 3 },
        { postId: 4, username: 'admin', daysAgo: 1 }
    ];

    let likesCount = 0;
    for (const like of likes) {
        const createdAt = new Date(Date.now() - like.daysAgo * 24 * 60 * 60 * 1000).toISOString();
        try {
            insertLike.run(like.postId, like.username, createdAt);
            likesCount++;
        } catch (err) {
            // 忽略重复点赞错误
            if (!err.message.includes('UNIQUE constraint')) {
                throw err;
            }
        }
    }
    console.log(`✅ 成功插入 ${likesCount} 条点赞记录\n`);

    // 插入话题关注
    const insertTopicFollow = db.prepare(`
        INSERT INTO topic_follows (user_username, topic_name, created_at) 
        VALUES (?, ?, ?)
    `);

    const topicFollows = [
        { username: 'admin', topic: '动力电池回收', daysAgo: 5 },
        { username: 'admin', topic: '政策法规', daysAgo: 3 }
    ];

    let topicFollowsCount = 0;
    for (const follow of topicFollows) {
        const createdAt = new Date(Date.now() - follow.daysAgo * 24 * 60 * 60 * 1000).toISOString();
        try {
            insertTopicFollow.run(follow.username, follow.topic, createdAt);
            topicFollowsCount++;
        } catch (err) {
            // 忽略重复关注错误
            if (!err.message.includes('UNIQUE constraint')) {
                throw err;
            }
        }
    }
    console.log(`✅ 成功插入 ${topicFollowsCount} 条话题关注记录\n`);

    // 显示统计信息
    console.log('📊 数据库统计:\n');

    const totalPosts = db.prepare('SELECT COUNT(*) as count FROM posts').get();
    console.log(`   帖子总数: ${totalPosts.count}`);

    const totalLikes = db.prepare('SELECT COUNT(*) as count FROM likes').get();
    console.log(`   点赞总数: ${totalLikes.count}`);

    const totalTopicFollows = db.prepare('SELECT COUNT(*) as count FROM topic_follows').get();
    console.log(`   话题关注: ${totalTopicFollows.count}`);

    console.log('\n✨ 数据插入完成!');
    console.log('🌐 访问 http://localhost:3000/community 查看效果\n');

} catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
} finally {
    db.close();
}
