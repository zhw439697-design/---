-- 社区数据种子脚本
-- 插入示例帖子、点赞和话题关注数据

-- 插入示例帖子
INSERT INTO posts (title, content, author_username, created_at) VALUES
('动力电池回收行业的未来趋势', '随着新能源汽车的快速发展,动力电池回收已成为一个重要的环保议题。本文探讨了当前行业面临的挑战和未来的发展方向,包括技术创新、政策支持和商业模式等方面。', 'admin', datetime('now', '-5 days')),

('如何提高电池回收率?', '目前我国动力电池回收率还比较低,大家有什么好的建议吗?我认为可以从以下几个方面入手:1. 建立完善的回收网络 2. 提高回收技术水平 3. 加强政策引导和监管', 'admin', datetime('now', '-4 days')),

('梯次利用vs直接拆解,哪个更环保?', '退役动力电池有两种主要处理方式:梯次利用和直接拆解回收。从环保和经济角度来看,大家认为哪种方式更好?欢迎讨论!', 'admin', datetime('now', '-3 days')),

('新政策解读:《新能源汽车废旧动力电池综合利用行业规范条件》', '工信部最新发布的规范条件对行业有哪些影响?主要包括:企业准入门槛提高、技术要求更严格、环保标准升级等。这对中小企业来说既是挑战也是机遇。', 'admin', datetime('now', '-2 days')),

('分享:我们公司的电池回收实践经验', '我们公司从事动力电池回收已经3年了,积累了一些经验。主要包括:建立回收网点、与车企合作、开发自动化拆解设备等。欢迎同行交流!', 'admin', datetime('now', '-1 day')),

('锂电池回收技术的最新进展', '最近看到一些关于锂电池回收技术的新研究,包括湿法冶金、火法冶金和机械物理法的改进。有没有专家可以分享一下这些技术的优缺点?', 'admin', datetime('now', '-12 hours')),

('电池回收企业如何获得政府补贴?', '听说国家对电池回收企业有补贴政策,但申请流程比较复杂。有经验的朋友可以分享一下吗?需要准备哪些材料?', 'admin', datetime('now', '-6 hours')),

('动力电池全生命周期管理的重要性', '从电池生产、使用到回收,全生命周期管理对于提高资源利用率和降低环境影响至关重要。建议建立电池溯源系统,实现全程可追溯。', 'admin', datetime('now', '-3 hours')),

('求推荐:电池检测设备供应商', '我们公司准备采购一批电池检测设备,用于评估退役电池的健康状态。有没有推荐的供应商?主要关注性价比和售后服务。', 'admin', datetime('now', '-2 hours')),

('国际经验借鉴:欧美的电池回收体系', '欧美国家在电池回收方面起步较早,已经建立了比较完善的回收体系。我们可以学习他们的生产者责任延伸制度、押金制度等做法。', 'admin', datetime('now', '-1 hour'));

-- 插入一些点赞数据 (模拟不同用户点赞)
-- 注意: 这里使用 admin 用户,实际应该有多个用户
INSERT INTO likes (post_id, user_username, created_at) VALUES
(1, 'admin', datetime('now', '-4 days')),
(2, 'admin', datetime('now', '-3 days')),
(4, 'admin', datetime('now', '-1 day'));

-- 插入话题关注数据
INSERT INTO topic_follows (user_username, topic_name, created_at) VALUES
('admin', '动力电池回收', datetime('now', '-5 days')),
('admin', '政策法规', datetime('now', '-3 days'));

-- 查看插入结果
SELECT '=== 帖子列表 ===' as info;
SELECT id, title, author_username, created_at FROM posts ORDER BY created_at DESC;

SELECT '=== 点赞统计 ===' as info;
SELECT p.id, p.title, COUNT(l.id) as likes_count 
FROM posts p 
LEFT JOIN likes l ON p.id = l.post_id 
GROUP BY p.id 
ORDER BY p.created_at DESC;

SELECT '=== 话题关注 ===' as info;
SELECT * FROM topic_follows;
