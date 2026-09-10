import { useMemo, useState } from 'react';
import { Card, PageTitle, ProgressBar, Modal } from '../components/ui';
import { getDaily, getSettings, setSettings, todayStr, streakInfo } from '../lib/storage';

const WEEK_LABELS = ['一', '二', '三', '四', '五', '六', '日'];

export default function Plan() {
  const [cur, setCur] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; });
  const daily = useMemo(() => getDaily() || {}, []);
  const [settings, setLocalSettings] = useState(() => getSettings() || { dailyGoal: 20 });
  const [goalInput, setGoalInput] = useState(settings.dailyGoal || 20);
  const streak = useMemo(() => streakInfo(daily), [daily]);
  const today = todayStr();
  const todayDone = daily[today]?.done || 0;

  const saveGoal = () => {
    const g = Math.max(1, parseInt(goalInput) || 20);
    const s = { ...settings, dailyGoal: g };
    setSettings(s); setLocalSettings(s);
  };

  // 月历网格（周一起始）
  const { cells, monthDots } = useMemo(() => {
    const first = new Date(cur.y, cur.m, 1);
    const daysInMonth = new Date(cur.y, cur.m + 1, 0).getDate();
    let startIdx = first.getDay() - 1; if (startIdx < 0) startIdx = 6;
    const arr = [];
    for (let i = 0; i < startIdx; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${cur.y}-${String(cur.m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      arr.push({ day: d, key, count: daily[key]?.done || 0 });
    }
    const maxCount = Math.max(20, ...arr.filter(Boolean).map((c) => c.count));
    return { cells: arr, monthDots: { maxCount } };
  }, [cur, daily]);

  // 本周报告
  const weekly = useMemo(() => {
    const sum = (offset) => {
      let done = 0, correct = 0;
      for (let i = 0; i < 7; i++) {
        const d = new Date(); d.setDate(d.getDate() - i - offset * 7);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        done += daily[key]?.done || 0;
        correct += daily[key]?.correct || 0;
      }
      return { done, correct };
    };
    const thisW = sum(0), lastW = sum(1);
    return {
      ...thisW,
      acc: thisW.done ? Math.round((thisW.correct / thisW.done) * 100) : 0,
      diff: thisW.done - lastW.done
    };
  }, [daily]);

  return (
    <div className="space-y-4 max-w-3xl">
      <PageTitle desc="坚持每天完成目标题量，打卡记录一目了然">📅 学习计划</PageTitle>

      {/* 日历 */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => stepMonth(-1)} className="px-4 py-2 rounded-btn bg-[#F5F1EA] text-sub min-h-[44px]">‹ 上月</button>
          <span className="font-bold text-ink">{cur.y} 年 {cur.m + 1} 月</span>
          <button onClick={() => stepMonth(1)} className="px-4 py-2 rounded-btn bg-[#F5F1EA] text-sub min-h-[44px]">下月 ›</button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-sub mb-1">
          {WEEK_LABELS.map((w) => <div key={w} className="py-1">{w}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((c, i) => {
            if (!c) return <div key={`e${i}`} />;
            const isToday = c.key === today;
            const opacity = c.count ? 0.25 + 0.75 * Math.min(1, c.count / monthDots.maxCount) : 0;
            return (
              <div key={c.key} className="relative flex flex-col items-center justify-center rounded-lg py-2 min-h-[48px]"
                style={{ background: isToday ? 'rgba(232,180,184,0.15)' : 'transparent' }}>
                <span className={`text-sm ${isToday ? 'font-bold text-[#a06a6e]' : 'text-ink'}`}>{c.day}</span>
                {c.count > 0 && (
                  <span className="w-2.5 h-2.5 rounded-full mt-1" style={{ background: '#E8B4B8', opacity }} title={`${c.count} 题`} />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* 每日目标 */}
      <Card>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
          <h3 className="font-bold">每日目标题量</h3>
          <div className="flex gap-2 items-center">
            <input type="number" value={goalInput} min="1" onChange={(e) => setGoalInput(e.target.value)}
              className="w-20 border border-[#E5DFD5] rounded-btn px-3 py-2.5" />
            <button onClick={saveGoal} className="bg-lotus text-white rounded-btn px-4 py-2.5 text-sm font-semibold">保存</button>
          </div>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-sub">今日已完成</span>
          <span className="font-semibold">{todayDone} / {settings.dailyGoal} 题</span>
        </div>
        <ProgressBar percent={(todayDone / settings.dailyGoal) * 100} />
      </Card>

      {/* 打卡 & 本周报告 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="text-center">
          <p className="text-3xl font-bold text-lotus">{streak.streak} <span className="text-sm font-normal text-sub">天</span></p>
          <p className="text-sm text-sub mt-1">连续打卡天数</p>
          <p className="text-xs text-sub mt-2">最长连续记录：{streak.best} 天</p>
        </Card>
        <Card>
          <h3 className="font-bold mb-2">本周学习报告</h3>
          <p className="text-sm text-ink">本周共做 <b>{weekly.done}</b> 题，正确率 <b>{weekly.acc}%</b></p>
          <p className="text-sm mt-1">
            比上周{weekly.diff >= 0 ? <span className="text-[#2e7d32]">多 {weekly.diff} 题 🎉</span> : <span className="text-[#c62828]">少 {-weekly.diff} 题</span>}
          </p>
        </Card>
      </div>
    </div>
  );
}
