import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend, CartesianGrid
} from 'recharts';
import { Card, PageTitle } from '../components/ui';
import { getQuestions, getDaily, SUBJECTS, subjectStats, streakInfo } from '../lib/storage';

const PIE_COLORS = ['#E8B4B8', '#A8B8C8', '#B8C8A8', '#C8B8D8'];

export default function Stats() {
  const nav = useNavigate();
  const qs = useMemo(() => getQuestions() || [], []);
  const daily = useMemo(() => getDaily() || {}, []);

  const totalDone = qs.reduce((s, q) => s + q.correctCount + q.wrongCount, 0);
  const totalCorrect = qs.reduce((s, q) => s + q.correctCount, 0);
  const acc = totalDone ? Math.round((totalCorrect / totalDone) * 100) : 0;
  const mastered = qs.filter((q) => q.masteryLevel === 4).length;
  const streak = streakInfo(daily);

  // 最近 14 天
  const lineData = useMemo(() => {
    const arr = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      arr.push({ date: `${d.getMonth() + 1}/${d.getDate()}`, 做题量: daily[key]?.done || 0 });
    }
    return arr;
  }, [daily]);

  const barData = SUBJECTS.map((s) => ({ subject: s, 正确率: subjectStats(qs, s).acc }));

  const pieData = useMemo(() => {
    const types = ['选择', '填空', '解答', '听力'];
    return types.map((t) => ({ name: t + '题', value: qs.filter((q) => q.questionType === t).length })).filter((x) => x.value > 0);
  }, [qs]);

  return (
    <div className="space-y-5 max-w-4xl">
      <PageTitle desc="基于你的全部做题记录自动统计">📈 学习统计</PageTitle>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="总做题量" value={totalDone} unit="题" color="#E8B4B8" />
        <StatCard label="已掌握题量" value={mastered} unit="题" color="#A5D6A7" />
        <StatCard label="总体正确率" value={acc} unit="%" color="#A8B8C8" />
        <StatCard label="连续学习" value={streak.streak} unit="天" color="#FFD54F" />
      </div>

      <Card>
        <h3 className="font-bold mb-3">最近 14 天每日做题量</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0EAE1" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8A8A8A' }} interval={1} />
            <YAxis tick={{ fontSize: 11, fill: '#8A8A8A' }} />
            <Tooltip />
            <Line type="monotone" dataKey="做题量" stroke="#E8B4B8" strokeWidth={2.5} dot={{ r: 3, fill: '#E8B4B8' }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-bold mb-3">各科目正确率对比</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0EAE1" />
              <XAxis dataKey="subject" tick={{ fontSize: 12, fill: '#8A8A8A' }} />
              <YAxis tick={{ fontSize: 11, fill: '#8A8A8A' }} domain={[0, 100]} />
              <Tooltip formatter={(v) => v + '%'} />
              <Bar dataKey="正确率" radius={[6, 6, 0, 0]}>
                {barData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="font-bold mb-3">题型分布</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={3}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value, unit, color }) {
  return (
    <Card className="flex flex-col items-center py-4">
      <span className="text-2xl font-bold" style={{ color }}>{value}<span className="text-sm font-normal text-sub ml-1">{unit}</span></span>
      <span className="text-xs text-sub mt-1">{label}</span>
    </Card>
  );
}
