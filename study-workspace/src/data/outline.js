// 考点大纲（按上海高考考纲组织）
export const OUTLINE = {
  数学: [
    { name: '函数与导数', children: ['函数性质', '基本初等函数', '导数与单调性', '导数与极值'] },
    { name: '三角函数与解三角形', children: ['三角函数图像与性质', '三角恒等变换', '解三角形'] },
    { name: '数列', children: ['等差等比数列', '数列递推', '数列求和'] },
    { name: '立体几何', children: ['空间向量', '空间角与距离'] },
    { name: '平面解析几何', children: ['直线与圆', '椭圆', '双曲线', '抛物线'] },
    { name: '概率统计', children: ['排列组合', '概率分布', '统计推断'] },
    { name: '向量与不等式', children: ['平面向量', '不等式求解'] }
  ],
  英语: [
    { name: '听力理解', children: ['短对话', '长对话与独白'] },
    { name: '语法填空', children: ['时态语态', '从句与非谓语'] },
    { name: '完形填空', children: ['词义辨析', '逻辑衔接'] },
    { name: '阅读理解', children: ['社科类', '文学类'] },
    { name: '翻译', children: ['中译英'] },
    { name: '写作', children: ['应用文', '概要写作'] }
  ],
  物理: [
    { name: '力学', children: ['牛顿运动定律', '动能定理', '动量定理', '万有引力'] },
    { name: '电磁学', children: ['电场性质', '闭合电路欧姆定律', '洛伦兹力', '法拉第电磁感应定律'] },
    { name: '热学', children: ['气体实验定律'] },
    { name: '光学', children: ['折射定律', '光的干涉衍射'] },
    { name: '近代物理', children: ['原子结构', '核反应'] }
  ],
  化学: [
    { name: '物质的组成与结构', children: ['原子结构', '化学键'] },
    { name: '物质的变化', children: ['氧化还原反应', '离子反应', '化学平衡'] },
    { name: '常见的无机物', children: ['氯及其化合物', '硫氮及其化合物', '金属及其化合物'] },
    { name: '常见的有机物', children: ['烃', '烃的衍生物', '有机合成'] },
    { name: '化学实验', children: ['气体制备与检验', '物质的分离提纯'] },
    { name: '化学技术与社会', children: ['化学与生活'] }
  ],
  生物: [
    { name: '分子与细胞', children: ['细胞结构与功能', '光合作用', '细胞呼吸'] },
    { name: '遗传与进化', children: ['分离定律', '自由组合定律', '伴性遗传', '生物进化'] },
    { name: '稳态与调节', children: ['神经-体液调节', '免疫调节'] },
    { name: '生物与环境', children: ['种群与群落', '生态系统'] },
    { name: '生物技术与工程', children: ['基因工程', '细胞工程'] }
  ]
};

export const SUBJECTS = ['数学', '英语', '物理', '化学', '生物'];
export const ALL_KAODIAN = SUBJECTS.flatMap((s) =>
  OUTLINE[s].flatMap((g) => g.children.map((k) => ({ subject: s, kaodian: k, group: g.name })))
);
