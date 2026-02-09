export interface Post {
    id: string;
    author: {
        name: string;
        avatar?: string;
        role: 'user' | 'expert' | 'company';
    };
    title: string;
    content: string;
    tags: string[];
    likes: number;
    comments: number;
    date: string;
    isHot?: boolean;
}

export const POSTS_DATA: Post[] = [
    {
        id: '1',
        author: { name: 'TechGeek_01', role: 'expert' },
        title: '关于欧盟新电池法碳足迹计算的几个疑问，求大神解答',
        content: '最近在研究欧盟2025年即将实施的碳足迹申报要求，对于电力因子的计算部分一直没搞太懂，是按所在国电网平均值还是绿电直供？有没有了解的大佬？',
        tags: ['欧盟法规', '碳足迹', '求助'],
        likes: 45,
        comments: 12,
        date: '2小时前',
        isHot: true
    },
    {
        id: '2',
        author: { name: 'GreenEnergy_Co', role: 'company' },
        title: '【行业分析】2024年第一季度动力电池回收价格走势',
        content: '受碳酸锂价格波动影响，本季度黑粉回收系数有所下调。我们整理了最新的市场报价数据，供大家参考...',
        tags: ['市场行情', '回收价格', '数据分享'],
        likes: 128,
        comments: 34,
        date: '5小时前',
        isHot: true
    },
    {
        id: '3',
        author: { name: 'EcoWarrior', role: 'user' },
        title: '自家新能源车开了5年，续航衰减严重，现在的残值大概多少？',
        content: '车型是2019款的Model 3，目前充满电显示续航只有320km了，想问问这种情况下如果卖二手或者走回收渠道，大概能值多少钱？',
        tags: ['车主交流', '电池残值', '经验'],
        likes: 22,
        comments: 56,
        date: '1天前'
    },
    {
        id: '4',
        author: { name: 'RecycleMaster', role: 'expert' },
        title: '分享几个国内比较靠谱的动力电池回收白名单企业',
        content: '很多车友担心电池被小作坊收去污染环境，这里列举几个工信部白名单里的正规军，大家处理废旧电池时可以优先考虑...',
        tags: ['白名单', '环保', '避坑指南'],
        likes: 89,
        comments: 15,
        date: '2天前'
    }
];

export const HOT_TOPICS = [
    { name: '电池回收', count: 1250 },
    { name: '欧盟法规', count: 890 },
    { name: '碳足迹', count: 670 },
    { name: '残值评估', count: 540 },
    { name: '磷酸铁锂', count: 430 }
];
