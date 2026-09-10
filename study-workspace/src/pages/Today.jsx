import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Flame } from 'lucide-react';
import { Card, Ring, ProgressBar, Tag } from '../components/ui';
import { getQuestions, getDaily, getSettings, subjectStats, SUBJECTS, todayStr, daysBetween, streakInfo } from '../lib/storage';
import { dueQuestions, isOverdue } from '../lib/srs';

const EXAM_DATES = [
  { label: '等级考', date: '2027-05-05' },
  { label: '秋考', date: '2027-06-07' }
];

export default function Today({ name }) {
  const nav = useNavigate();
  const [qs, setQs] = useState(() => getQuestions() || []);
  const daily = useMemo(() => getDaily() || [], []);
  const today = todayStr();

  const due = useMemo(() => dueQuestions(qs), [qs]);
  const streak = useMemo(() => streakInfo(daily), [daily]);

  const countdowns = EXAM_DATES.map((e) => ({ ...e, days: daysBetween(today, e.date) }));

  const startReview = (q) => nav('/answer', { state: { ids: [q.id], mode: 'review', single: true } });

  const todayDone = daily[today]?.done || 0;
  const goal = getSettings()?.dailyGoal || 20;

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-ink">{name ? `${name}的学习工作台` : '学习工作台'}</h1>
        <p className="text-sub mt-1">你好，{name || '同学'}！今天也要加油呀 🌷</p>
      </div>

      {/* 倒计时 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {countdowns.map((c) => (
          <Card key={c.label} className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-lotus/20 flex flex-col items-center justify-center shrink-0">
              <span className="text-2xl font-bold text-[#a06a6e]">{c.days}</span>
            </div>
            <div>
              <div className="text-sm text-sub">距 {c.date.slice(0, 4)}年{parseInt(c.date.slice(5, 7))}月{parseInt(c.date.slice(8, 10))}日</div>
              <div className="font-bold text-ink text-lg">{c.label}还有 {c.days} 天</div>
            </div>
          </Card>
        ))}
      </div>

      {/* 五科进度 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {SUBJECTS.map((s) => {
          const st = subjectStats(qs, s);
          return (
            <Card key={s} className="flex flex-col items-center gap-2 py-4">
              <span className="font-semibold text-ink">{s}</span>
              <Ring percent={st.acc} color={s === '数学' ? '#E8B4B8' : s === '英语' ? '#A8B8C8' : s === '物理' ? '#B8C8A8' : s === '化学' ? '#C8B8D8' : '#A8D8C8'} />
              <div className="text-xs text-sub text-center">
                总题量 {st.total} · 答对 {st.correct}
                <br />待复习 <span className="text-[#c62828] font-semibold">{st.toReview}</span> 题
              </div>
            </Card>
          );
        })}
      </div>

      {/* 今日进度 + 打卡 */}
      <Card className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-sub">今日完成</span>
            <span className="font-semibold">{todayDone} / {goal} 题</span>
          </div>
          <ProgressBar percent={(todayDone / goal) * 100} />
        </div>
        <div className="flex items-center gap-2 text-[#e07b39] font-semibold shrink-0">
          <Flame size={20} strokeWidth={1.8} />
          已连续学习 {streak.streak} 天
        </div>
      </Card>

      {/* 今日待复习 */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-ink">今日待复习（{due.length} 题）</h3>
          <Tag text={due.length ? `${due.filter(isOverdue).length} 题已过期` : '已清零'} color={due.some(isOverdue) ? 'red' : 'green'} />
        </div>
        {due.length === 0 ? (
          <p className="text-sm text-sub py-4 text-center">今天的复习任务已全部完成，太棒了！✨</p>
        ) : (
          <ul className="divide-y divide-[#F2EDE6]">
            {due.slice(0, 8).map((q) => (
              <li key={q.id}>
                <button onClick={() => startReview(q)} className="w-full text-left py-3 flex items-center gap-3 min-h-[44px] active:bg-lotus/10 rounded-btn px-2 -mx-2">
                  <Tag text={q.subject} />
                  <span className="flex-1 text-sm text-ink truncate">{q.kaodian} · 第{q.masteryLevel === 0 ? 1 : q.masteryLevel}轮复习</span>
                  {isOverdue(q) && <span className="text-xs text-[#c62828]">⚠️ 已过期</span>}
                  <ArrowRight size={16} className="text-sub" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {due.length > 8 && <p className="text-xs text-sub mt-2">还有 {due.length - 8} 题待复习…</p>}
      </Card>

      <button
        onClick={() => nav('/quiz')}
        className="w-full bg-lotus text-white rounded-btn py-4 text-lg font-bold shadow-soft active:opacity-80 flex items-center justify-center gap-2"
      >
        <ArrowRight size={22} /> 开始刷题
      </button>
    </div>
  );
}
