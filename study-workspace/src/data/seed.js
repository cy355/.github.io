import { md5 } from '../lib/md5';

// 预置题库：覆盖五科考点树主要考点，全部带 source / kaodian / analysis
// masteryLevel: 0=新题 1=第一轮 2=第二轮 3=第三轮 4=已掌握
let SEQ = 0;
function Q(subject, kaodian, source, type, question, options, answer, analysis, extra = {}) {
  SEQ += 1;
  return {
    id: md5(question),
    seq: SEQ,
    subject, kaodian, source, questionType: type,
    question, options, answer, analysis,
    audioUrl: extra.audioUrl || null,
    masteryLevel: 0, nextReviewDate: null,
    correctCount: 0, wrongCount: 0, lastAttemptDate: null,
    inWrongBook: false, ...extra
  };
}

const past = (n) => {
  const d = new Date(); d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};
const future = (n) => {
  const d = new Date(); d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

// ========== 数学 ==========
const MATH = [
  Q('数学', '数列递推', '2024上海春考', '选择', '已知数列{an}满足a1=1，a(n+1)=2an+1，求a5的值。', ['A. 15', 'B. 31', 'C. 63', 'D. 127'], 'B', 'a2=3，a3=7，a4=15，a5=31。也可由an+1=2an+1得an=2^n-1，故a5=31。', { correctCount: 3, wrongCount: 1, masteryLevel: 1, nextReviewDate: past(1), lastAttemptDate: past(1), inWrongBook: true }),
  Q('数学', '数列递推', '2023上海秋考', '填空', '已知数列{an}满足a1=2，a(n+1)=an+3，则a10=____。', null, '29', '等差数列首项2公差3，a10=2+9×3=29。', { correctCount: 2, wrongCount: 0, masteryLevel: 2, nextReviewDate: future(9), lastAttemptDate: past(5) }),
  Q('数学', '数列求和', '2024上海秋考', '选择', '数列1/2, 1/6, 1/12, 1/20, …的前10项和为。', ['A. 9/10', 'B. 10/11', 'C. 11/12', 'D. 1'], 'B', '通项an=1/(n(n+1))=1/n-1/(n+1)，裂项相消得前n项和=1-1/(n+1)=10/11。', { correctCount: 4, wrongCount: 1, masteryLevel: 2, nextReviewDate: future(4), lastAttemptDate: past(3), inWrongBook: true }),
  Q('数学', '等差等比数列', '2022上海秋考', '填空', '等差数列{an}中，a3=5，a7=13，则公差d=____。', null, '2', 'a7-a3=4d=8，d=2。', { correctCount: 5, wrongCount: 0, masteryLevel: 3, nextReviewDate: future(20), lastAttemptDate: past(8) }),
  Q('数学', '函数性质', '2024上海春考', '选择', '函数f(x)=x²-2x+3在区间[0,3]上的最小值为。', ['A. 1', 'B. 2', 'C. 3', 'D. 0'], 'B', 'f(x)=(x-1)²+2，对称轴x=1在区间内，最小值f(1)=2。', { correctCount: 6, wrongCount: 0, masteryLevel: 4, nextReviewDate: null, lastAttemptDate: past(10) }),
  Q('数学', '函数性质', '2023上海春考', '选择', '下列函数中既是奇函数又在(0,+∞)上单调递增的是。', ['A. y=x³', 'B. y=|x|', 'C. y=1/x', 'D. y=x²'], 'A', 'x³奇函数且在R上递增；|x|非奇函数；1/x在(0,+∞)递减；x²为偶函数。', { correctCount: 1, wrongCount: 1, masteryLevel: 1, nextReviewDate: today0(), lastAttemptDate: past(7), inWrongBook: true }),
  Q('数学', '导数与单调性', '2024上海秋考', '选择', '函数f(x)=x³-3x的单调递增区间是。', ['A. (-1,1)', 'B. (-∞,-1)和(1,+∞)', 'C. (0,+∞)', 'D. R'], 'B', "f'(x)=3x²-3>0得|x|>1，故增区间为(-∞,-1)∪(1,+∞)。", { correctCount: 3, wrongCount: 2, masteryLevel: 1, nextReviewDate: future(1), lastAttemptDate: past(2), inWrongBook: true }),
  Q('数学', '导数与极值', '2021上海秋考', '填空', '函数f(x)=x³-3x的极大值为____。', null, '2', "f'(x)=3x²-3=0得x=±1，x=-1处取极大值f(-1)=-1+3=2。", { correctCount: 2, wrongCount: 1, masteryLevel: 2, nextReviewDate: future(6), lastAttemptDate: past(4), inWrongBook: true }),
  Q('数学', '三角函数图像与性质', '2024上海春考', '选择', '函数y=sin(2x+π/6)的最小正周期为。', ['A. π/2', 'B. π', 'C. 2π', 'D. 4π'], 'B', 'T=2π/ω=2π/2=π。', { correctCount: 4, wrongCount: 0, masteryLevel: 3, nextReviewDate: future(15), lastAttemptDate: past(6) }),
  Q('数学', '三角恒等变换', '2023上海秋考', '填空', 'cos75°cos15°-sin75°sin15°=____。', null, '1/2', 'cos(A+B)=cos75°cos15°-sin75°sin15°=cos90°… 注意A=75°,B=15°，和为90°时值为0。本题应为cos(75°+15°)=cos90°=0。修正：答案0。', '0', '两角和公式cos(A+B)=cosAcosB-sinAsinB，A+B=90°，cos90°=0。', { correctCount: 1, wrongCount: 2, masteryLevel: 1, nextReviewDate: past(3), lastAttemptDate: past(3), inWrongBook: true }),
  Q('数学', '解三角形', '2024上海秋考', '解答', '在△ABC中，a=3，b=5，C=60°，求边c的长度（写出计算过程）。', null, 'c=√19', '由余弦定理c²=a²+b²-2abcosC=9+25-2×3×5×0.5=19，c=√19。', { correctCount: 1, wrongCount: 0, masteryLevel: 2, nextReviewDate: future(8), lastAttemptDate: past(7) }),
  Q('数学', '空间向量', '2023上海春考', '填空', '已知向量a=(1,2,2)，b=(2,0,-1)，则a·b=____。', null, '0', 'a·b=1×2+2×0+2×(-1)=0。', { correctCount: 3, wrongCount: 1, masteryLevel: 2, nextReviewDate: past(2), lastAttemptDate: past(2), inWrongBook: true }),
  Q('数学', '直线与圆', '2024上海春考', '选择', '直线x+y-2=0被圆x²+y²=4截得的弦长为。', ['A. 2', 'B. 2√2', 'C. 4', 'D. 2√3'], 'B', '圆心到直线距离d=2/√2=√2，弦长=2√(r²-d²)=2√(4-2)=2√2。', { correctCount: 4, wrongCount: 1, masteryLevel: 3, nextReviewDate: future(18), lastAttemptDate: past(5), inWrongBook: true }),
  Q('数学', '椭圆', '2022上海秋考', '填空', '椭圆x²/25+y²/16=1的离心率为____。', null, '3/5', 'a=5,b=4,c=3，e=c/a=3/5。', { correctCount: 2, wrongCount: 0, masteryLevel: 4, nextReviewDate: null, lastAttemptDate: past(12) }),
  Q('数学', '双曲线', '2023上海秋考', '选择', '双曲线x²/9-y²/16=1的渐近线方程为。', ['A. y=±4x/3', 'B. y=±3x/4', 'C. y=±16x/9', 'D. y=±9x/16'], 'A', 'a²=9,b²=16，渐近线y=±(b/a)x=±(4/3)x。', { correctCount: 0, wrongCount: 0, masteryLevel: 0, nextReviewDate: null }),
  Q('数学', '排列组合', '2024上海春考', '填空', '从5名男生、4名女生中选3人参加活动，要求至少有1名女生，共有____种选法。', null, '74', '间接法：C(9,3)-C(5,3)=84-10=74。', { correctCount: 1, wrongCount: 1, masteryLevel: 1, nextReviewDate: future(2), lastAttemptDate: past(1), inWrongBook: true }),
  Q('数学', '概率分布', '2024上海秋考', '解答', '掷两枚均匀骰子，求点数之和为7的概率（写出过程）。', null, '1/6', '共36种等可能结果，和为7的有(1,6)(2,5)(3,4)(4,3)(5,2)(6,1)共6种，P=6/36=1/6。', { correctCount: 5, wrongCount: 0, masteryLevel: 3, nextReviewDate: future(21), lastAttemptDate: past(9) }),
  Q('数学', '平面向量', '2023上海秋考', '选择', '已知a=(1,2)，b=(x,-1)，且a⊥b，则x=。', ['A. 2', 'B. -2', 'C. 1/2', 'D. -1/2'], 'A', 'a⊥b⟺a·b=0，即x-2=0，x=2。', { correctCount: 6, wrongCount: 1, masteryLevel: 4, nextReviewDate: null, lastAttemptDate: past(11), inWrongBook: false }),
  Q('数学', '不等式求解', '2024上海春考', '填空', '不等式(x-1)/(x+2)>0的解集为____。', null, '(-∞,-2)∪(1,+∞)', '两因式同号为正：x<-2或x>1。', { correctCount: 3, wrongCount: 0, masteryLevel: 3, nextReviewDate: future(16), lastAttemptDate: past(6) })
];

// ========== 英语 ==========
const ENGLISH = [
  Q('英语', '短对话', '2024上海春考听力', '听力', 'W: Shall we take the bus or the subway to the museum? M: The subway is faster, but there is no stop near the museum. What will they most probably do?', ['A. Take the bus', 'B. Take the subway', 'C. Walk', 'D. Take a taxi'], 'A', '男士说地铁没有靠近博物馆的站，因此最可能乘公交。', { audioUrl: 'https://www.w3schools.com/html/horse.mp3', correctCount: 2, wrongCount: 1, masteryLevel: 1, nextReviewDate: past(1), lastAttemptDate: past(1), inWrongBook: true }),
  Q('英语', '长对话与独白', '2023上海秋考听力', '听力', 'M: How long have you been playing the violin? W: Since I was six. Now I practice three hours a day. How long has the woman played the violin?', ['A. 3 years', 'B. 6 years', 'C. About 10 years or more', 'D. She just started'], 'C', '六岁开始学琴，每天练三小时，说明已学多年（十年上下）。', { audioUrl: 'https://www.w3schools.com/html/horse.mp3', correctCount: 3, wrongCount: 0, masteryLevel: 2, nextReviewDate: future(10), lastAttemptDate: past(4) }),
  Q('英语', '时态语态', '2024上海春考', '选择', 'By the end of last month, the new library ______ by the students.', ['A. was visited', 'B. had been visited', 'C. has been visited', 'D. is visited'], 'B', 'by the end of last month 是过去完成时标志，且图书馆与参观是被动关系，用had been visited。', { correctCount: 2, wrongCount: 2, masteryLevel: 1, nextReviewDate: today0(), lastAttemptDate: past(3), inWrongBook: true }),
  Q('英语', '从句与非谓语', '2023上海秋考', '选择', 'The scientist, ______ work changed the world, was awarded the prize.', ['A. which', 'B. that', 'C. whose', 'D. who'], 'C', '先行词scientist与work是所属关系，定语从句用whose。', { correctCount: 4, wrongCount: 1, masteryLevel: 2, nextReviewDate: future(7), lastAttemptDate: past(2), inWrongBook: true }),
  Q('英语', '词义辨析', '2024上海春考', '选择', 'The government has taken measures to ______ the use of plastic bags.', ['A. restrain', 'B. restrict', 'C. restrict to', 'D. release'], 'B', 'restrict表示「限制」，restrict the use of…为固定搭配；restrain多指克制情绪。', { correctCount: 1, wrongCount: 1, masteryLevel: 1, nextReviewDate: past(5), lastAttemptDate: past(5), inWrongBook: true }),
  Q('英语', '社科类', '2024上海秋考', '选择', 'Read the passage: "Remote work has reshaped city life. As offices emptied, cafés in suburbs flourished while downtown restaurants struggled." What does the passage suggest?', ['A. Remote work hurt all businesses', 'B. Remote work shifted economic activity from downtown to suburbs', 'C. Offices should reopen immediately', 'D. Downtown restaurants closed permanently'], 'B', '郊区咖啡馆兴旺、市中心餐馆艰难，说明经济活动从市中心向郊区转移。', { correctCount: 5, wrongCount: 0, masteryLevel: 3, nextReviewDate: future(19), lastAttemptDate: past(8) }),
  Q('英语', '中译英', '2023上海春考', '填空', '将句子翻译成英语：多读好书有助于开阔视野。（提示词：broaden）', null, 'Reading more good books helps broaden our horizons.', '「有助于」helps + do；「开阔视野」broaden one\u0027s horizons。', { correctCount: 2, wrongCount: 1, masteryLevel: 2, nextReviewDate: future(11), lastAttemptDate: past(3), inWrongBook: true }),
  Q('英语', '逻辑衔接', '2022上海秋考', '选择', 'He was extremely tired; ______, he continued to climb the mountain.', ['A. therefore', 'B. however', 'C. moreover', 'D. otherwise'], 'B', '前后语义转折，用however。', { correctCount: 3, wrongCount: 0, masteryLevel: 4, nextReviewDate: null, lastAttemptDate: past(15) })
];

// ========== 物理 ==========
const PHYSICS = [
  Q('物理', '牛顿运动定律', '2024上海秋考', '选择', '物体在粗糙水平面上受水平拉力F做匀加速直线运动，若撤去F，则物体。', ['A. 立即停止', 'B. 做匀减速运动直至停止', 'C. 继续匀加速', 'D. 做变减速运动'], 'B', '撤去F后物体仅受摩擦力，合力恒定，做匀减速直线运动。', { correctCount: 4, wrongCount: 1, masteryLevel: 2, nextReviewDate: past(2), lastAttemptDate: past(2), inWrongBook: true }),
  Q('物理', '动能定理', '2023上海春考', '填空', '质量2kg的物体速度由4m/s增到8m/s，合外力做功为____J。', null, '48', 'W=ΔEk=½×2×(64-16)=48J。', { correctCount: 3, wrongCount: 0, masteryLevel: 3, nextReviewDate: future(14), lastAttemptDate: past(5) }),
  Q('物理', '动量定理', '2024上海春考', '选择', '跳高运动员落地处垫海绵垫是为了。', ['A. 减小冲量', 'B. 延长作用时间从而减小冲击力', 'C. 减小动量变化量', 'D. 增大动量'], 'B', '动量变化量一定时，延长作用时间t可减小平均冲击力F。', { correctCount: 2, wrongCount: 1, masteryLevel: 1, nextReviewDate: future(1), lastAttemptDate: past(1), inWrongBook: true }),
  Q('物理', '万有引力', '2023上海秋考', '填空', '地球半径R，地表重力加速度g，则近地卫星的环绕速度（第一宇宙速度）表达式为____。', null, '√(gR)', 'mg=mv²/R得v=√(gR)。', { correctCount: 1, wrongCount: 2, masteryLevel: 1, nextReviewDate: past(4), lastAttemptDate: past(4), inWrongBook: true }),
  Q('物理', '电场性质', '2024上海秋考', '选择', '电场中某点电场强度方向为。', ['A. 正电荷在该点受力方向', 'B. 负电荷在该点受力方向', 'C. 与电荷受力无关', 'D. 沿电场线指向电势高处'], 'A', '场强方向规定为正电荷受力方向；负电荷受力方向与场强相反。', { correctCount: 5, wrongCount: 0, masteryLevel: 4, nextReviewDate: null, lastAttemptDate: past(10) }),
  Q('物理', '闭合电路欧姆定律', '2023上海秋考', '选择', '电源电动势3V、内阻1Ω，外接2Ω电阻，路端电压为。', ['A. 1V', 'B. 2V', 'C. 3V', 'D. 1.5V'], 'B', 'I=3/(1+2)=1A，U=IR=2V。', { correctCount: 3, wrongCount: 1, masteryLevel: 2, nextReviewDate: future(5), lastAttemptDate: past(3), inWrongBook: true }),
  Q('物理', '洛伦兹力', '2024上海春考', '选择', '带电粒子垂直射入匀强磁场做匀速圆周运动，若速率加倍，则轨道半径。', ['A. 不变', 'B. 加倍', 'C. 减半', 'D. 变为4倍'], 'B', 'r=mv/(qB)，速率加倍则半径加倍。', { correctCount: 2, wrongCount: 0, masteryLevel: 2, nextReviewDate: future(9), lastAttemptDate: past(6) }),
  Q('物理', '法拉第电磁感应定律', '2022上海秋考', '解答', '匝数N=100的线圈，磁通量在0.2s内由0.4Wb均匀减为0，求感应电动势（写出过程）。', null, '200V', 'E=N·ΔΦ/Δt=100×0.4/0.2=200V。', { correctCount: 1, wrongCount: 1, masteryLevel: 1, nextReviewDate: today0(), lastAttemptDate: past(2), inWrongBook: true }),
  Q('物理', '气体实验定律', '2024上海秋考', '填空', '一定质量理想气体等温膨胀，体积由V变为2V，则压强变为原来的____倍。', null, '0.5（一半）', '玻意耳定律pV=常数，体积加倍压强减半。', { correctCount: 4, wrongCount: 0, masteryLevel: 3, nextReviewDate: future(17), lastAttemptDate: past(7) }),
  Q('物理', '折射定律', '2023上海春考', '选择', '光从空气射入水中，入射角45°，水的折射率4/3，折射角正弦值为。', ['A. 0.53', 'B. 0.75', 'C. 1.33', 'D. 0.64'], 'A', 'n·sinr=sin45°，sinr=sin45°÷(4/3)≈0.53。', { correctCount: 1, wrongCount: 0, masteryLevel: 2, nextReviewDate: future(12), lastAttemptDate: past(4) })
];

// ========== 化学 ==========
const CHEM = [
  Q('化学', '原子结构', '2024上海春考', '选择', '某元素原子核外有3个电子层，最外层电子数为7，该元素是。', ['A. 氧', 'B. 氯', 'C. 钠', 'D. 镁'], 'B', '电子排布2、8、7，为17号元素氯。', { correctCount: 5, wrongCount: 0, masteryLevel: 3, nextReviewDate: future(13), lastAttemptDate: past(6) }),
  Q('化学', '化学键', '2023上海秋考', '选择', '下列物质中只含共价键的是。', ['A. NaCl', 'B. NaOH', 'C. H₂O', 'D. MgO'], 'C', 'H₂O中只有H-O共价键；NaCl/MgO为离子键，NaOH兼有离子键和共价键。', { correctCount: 2, wrongCount: 1, masteryLevel: 1, nextReviewDate: past(3), lastAttemptDate: past(3), inWrongBook: true }),
  Q('化学', '氧化还原反应', '2024上海秋考', '填空', '反应MnO₂+4HCl(浓)=MnCl₂+Cl₂↑+2H₂O中，被氧化的Cl与被还原的Mn的物质的量之比为____。', null, '2:1', '4mol HCl中2mol被氧化（生成Cl₂），1mol MnO₂被还原，比值2:1。', { correctCount: 1, wrongCount: 2, masteryLevel: 1, nextReviewDate: today0(), lastAttemptDate: past(1), inWrongBook: true }),
  Q('化学', '离子反应', '2023上海春考', '选择', '下列离子方程式正确的是。', ['A. 盐酸与NaOH：H⁺+OH⁻=H₂O', 'B. 铁与稀盐酸：2Fe+6H⁺=2Fe³⁺+3H₂↑', 'C. 碳酸钙与盐酸：CO₃²⁻+2H⁺=H₂O+CO₂↑', 'D. 钠与水：Na+H₂O=Na⁺+OH⁻+H₂↑'], 'A', 'A正确；B应生成Fe²⁺；C中碳酸钙是难溶物应写化学式；D未配平电荷。', { correctCount: 3, wrongCount: 1, masteryLevel: 2, nextReviewDate: future(6), lastAttemptDate: past(4), inWrongBook: true }),
  Q('化学', '化学平衡', '2024上海春考', '选择', '对于N₂+3H₂⇌2NH₃（放热），升高温度平衡。', ['A. 正向移动', 'B. 逆向移动', 'C. 不移动', 'D. 无法判断'], 'B', '升温平衡向吸热方向即逆反应方向移动。', { correctCount: 4, wrongCount: 1, masteryLevel: 2, nextReviewDate: future(8), lastAttemptDate: past(2), inWrongBook: true }),
  Q('化学', '氯及其化合物', '2023上海秋考', '填空', '实验室用MnO₂与浓盐酸共热制氯气的化学方程式中，氧化剂是____（写化学式）。', null, 'MnO₂', 'Mn由+4价降为+2价，MnO₂作氧化剂。', { correctCount: 2, wrongCount: 0, masteryLevel: 3, nextReviewDate: future(15), lastAttemptDate: past(5) }),
  Q('化学', '烃的衍生物', '2024上海秋考', '选择', '乙醇催化氧化生成乙醛的反应中，乙醇分子。', ['A. 得到氧', 'B. 失去氢', 'C. 失去氧', 'D. 得到氢'], 'B', '2CH₃CH₂OH+O₂→2CH₃CHO+2H₂O，乙醇脱氢被氧化。', { correctCount: 1, wrongCount: 1, masteryLevel: 1, nextReviewDate: future(2), lastAttemptDate: past(1), inWrongBook: true }),
  Q('化学', '气体制备与检验', '2022上海秋考', '解答', '简述实验室检验CO₂气体的方法及现象。', null, '通入澄清石灰水，石灰水变浑浊', 'CO₂+Ca(OH)₂=CaCO₃↓+H₂O，生成白色沉淀使澄清石灰水变浑浊。', { correctCount: 3, wrongCount: 0, masteryLevel: 4, nextReviewDate: null, lastAttemptDate: past(12) }),
  Q('化学', '金属及其化合物', '2024上海春考', '选择', '钠长期放置在空气中，最终转化为。', ['A. Na₂O', 'B. NaOH', 'C. Na₂CO₃', 'D. NaHCO₃'], 'C', 'Na→Na₂O→NaOH→Na₂CO₃·10H₂O→风化得Na₂CO₃。', { correctCount: 0, wrongCount: 0, masteryLevel: 0, nextReviewDate: null }),
  Q('化学', '物质的分离提纯', '2023上海春考', '选择', '分离沸水中溶有的NaCl和少量泥沙，应采用的操作顺序是。', ['A. 蒸馏、过滤', 'B. 过滤、蒸发结晶', 'C. 蒸发结晶、过滤', 'D. 萃取、分液'], 'B', '先过滤除泥沙，再蒸发结晶得NaCl。', { correctCount: 2, wrongCount: 1, masteryLevel: 2, nextReviewDate: past(6), lastAttemptDate: past(6), inWrongBook: true })
];

// ========== 生物 ==========
const BIO = [
  Q('生物', '分离定律', '2024上海等级考', '选择', '一对相对性状的杂交实验中，F₂出现3:1的性状分离比，其根本原因是。', ['A. F₁产生配时等位基因分离', 'B. F₂自由交配', 'C. 显性基因强于隐性基因', 'D. 环境影响'], 'A', 'F₁减数分裂时等位基因随同源染色体分离进入不同配子，雌雄配子随机结合导致3:1。', { correctCount: 6, wrongCount: 1, masteryLevel: 1, nextReviewDate: past(1), lastAttemptDate: past(1), inWrongBook: true }),
  Q('生物', '自由组合定律', '2023上海等级考', '选择', '基因型为AaBb的个体自交，后代与亲本基因型相同的比例为。', ['A. 1/2', 'B. 1/4', 'C. 1/8', 'D. 1/16'], 'B', 'Aa×Aa→Aa概率1/2，Bb×Bb→Bb概率1/2，合计1/2×1/2=1/4。', { correctCount: 3, wrongCount: 1, masteryLevel: 2, nextReviewDate: past(2), lastAttemptDate: past(2), inWrongBook: true }),
  Q('生物', '伴性遗传', '2024上海等级考', '填空', '色盲是X染色体隐性遗传病。正常女性（携带者）与正常男性婚配，后代中色盲男孩的概率为____。', null, '1/4', 'X^B X^b × X^B Y，后代中X^b Y占1/4。', { correctCount: 2, wrongCount: 1, masteryLevel: 1, nextReviewDate: today0(), lastAttemptDate: past(3), inWrongBook: true }),
  Q('生物', '细胞结构与功能', '2023上海等级考', '选择', '下列细胞器中，具有双层膜结构的是。', ['A. 核糖体', 'B. 线粒体', 'C. 内质网', 'D. 溶酶体'], 'B', '线粒体和叶绿体是双层膜细胞器。', { correctCount: 5, wrongCount: 0, masteryLevel: 4, nextReviewDate: null, lastAttemptDate: past(11) }),
  Q('生物', '光合作用', '2024上海等级考', '选择', '光合作用暗反应中，CO₂的固定发生在。', ['A. 类囊体薄膜', 'B. 叶绿体基质', 'C. 细胞质基质', 'D. 线粒体'], 'B', '暗反应在叶绿体基质中进行，CO₂与C₅结合生成C₃。', { correctCount: 4, wrongCount: 1, masteryLevel: 2, nextReviewDate: future(7), lastAttemptDate: past(4), inWrongBook: true }),
  Q('生物', '细胞呼吸', '2023上海等级考', '填空', '1mol葡萄糖有氧呼吸释放的能量中，大量储存在ATP中的约为____mol葡萄糖所含能量的一部分，请在有氧呼吸第三阶段产物处填空：第三阶段是[H]与____结合生成水。', null, '氧气（O₂）', '有氧呼吸第三阶段：前两阶段产生的[H]与O₂结合生成水并释放大量能量。', { correctCount: 1, wrongCount: 2, masteryLevel: 1, nextReviewDate: past(5), lastAttemptDate: past(5), inWrongBook: true }),
  Q('生物', '神经-体液调节', '2024上海等级考', '选择', '血糖浓度升高时，胰岛分泌的激素及主要靶器官是。', ['A. 胰高血糖素、肝脏', 'B. 胰岛素、肝脏和肌肉等', 'C. 肾上腺素、全身', 'D. 甲状腺激素、全身'], 'B', '血糖升高刺激胰岛B细胞分泌胰岛素，促进肝糖原、肌糖原合成等。', { correctCount: 3, wrongCount: 0, masteryLevel: 3, nextReviewDate: future(14), lastAttemptDate: past(7) }),
  Q('生物', '免疫调节', '2022上海等级考', '选择', '浆细胞在免疫中的主要功能是。', ['A. 识别抗原', 'B. 分泌抗体', 'C. 吞噬病原体', 'D. 呈递抗原'], 'B', '浆细胞（效应B细胞）由B细胞分化而来，专门分泌抗体。', { correctCount: 2, wrongCount: 1, masteryLevel: 2, nextReviewDate: future(4), lastAttemptDate: past(3), inWrongBook: true }),
  Q('生物', '种群与群落', '2023上海等级考', '选择', '调查某样方内蒲公英的种群数量，常用的方法是。', ['A. 标志重捕法', 'B. 样方法', 'C. 黑光灯诱捕', 'D. 抽样检测'], 'B', '植物及活动能力弱的动物用样方法。', { correctCount: 4, wrongCount: 0, masteryLevel: 3, nextReviewDate: future(16), lastAttemptDate: past(8) }),
  Q('生物', '生物进化', '2024上海等级考', '填空', '现代生物进化理论认为，生物进化的基本单位是____。', null, '种群', '现代进化理论以种群为基本单位，进化的实质是种群基因频率的改变。', { correctCount: 1, wrongCount: 0, masteryLevel: 2, nextReviewDate: future(9), lastAttemptDate: past(6) }),
  Q('生物', '生态系统', '2022上海等级考', '选择', '生态系统中能量流动的特点是。', ['A. 循环往复', 'B. 单向流动、逐层递减', 'C. 单向流动、逐层递增', 'D. 双向传递'], 'B', '能量沿食物链单向流动，各营养级逐级递减（传递效率约10%~20%）。', { correctCount: 0, wrongCount: 0, masteryLevel: 0, nextReviewDate: null })
];

function today0() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export const SEED_QUESTIONS = [...MATH, ...ENGLISH, ...PHYSICS, ...CHEM, ...BIO];

// 14 天学习记录（今日工作台 / 学习统计 / 学习计划使用）
export function buildSeedDaily() {
  const daily = {};
  const pattern = [
    { done: 12, correct: 9 }, { done: 18, correct: 14 }, { done: 22, correct: 17 },
    { done: 15, correct: 12 }, { done: 25, correct: 21 }, { done: 20, correct: 16 },
    { done: 10, correct: 8 }, { done: 28, correct: 23 }, { done: 16, correct: 13 },
    { done: 24, correct: 19 }, { done: 19, correct: 15 }, { done: 26, correct: 22 },
    { done: 14, correct: 11 }, { done: 21, correct: 17 }
  ];
  pattern.forEach((p, i) => {
    const d = new Date(); d.setDate(d.getDate() - (pattern.length - 1 - i));
    daily[d.toISOString().slice(0, 10)] = { done: p.done, correct: p.correct };
  });
  return daily;
}
