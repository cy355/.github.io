import { useMemo, useState } from 'react';
import { Card, PageTitle } from '../components/ui';
import { getQuestions, SUBJECTS } from '../lib/storage';
import { OUTLINE } from '../data/outline';

const COLORS = { hi: '#4CAF50', mid: '#A5D6A7', low: '#FFD54F', weak: '#EF5350', none: '#E0E0E0' };

function colorOf(acc) {
  if (acc === null) return COLORS.none;
  if (acc >= 90) return COLORS.hi;
  if (acc >= 70) return COLORS.mid;
  if (acc >= 40) return COLORS.low;
  return COLORS.weak;
}

export default function Heatmap() {
  const [subject, setSubject] = useState('全部');
  const [tip, setTip] = useState(null); // {kaodian, subject, stats}
  const qs = useMemo(() => getQuestions() || [], []);

  const stats = useMemo(() => {
    const m = {};
    qs.forEach((q) => {
      const key = `${q.subject}|${q.kaodian}`;
      if (!m[key]) m[key] = { total: 0, correct: 0, wrong: 0, last: null };
      const n = q.correctCount + q.wrongCount;
      if (n > 0) { m[key].total += n; m[key].correct += q.correctCount; m[key].wrong += q.wrongCount; }
      if (q.lastAttemptDate && (!m[key].last || q.lastAttemptDate > m[key].last)) m[key].last = q.lastAttemptDate;
    });
    return m;
  }, [qs]);

  const get = (s, k) => {
    const st = stats[`${s}|${k}`];
    if (!st || st.correct + st.wrong === 0) return { acc: null, ...st, total: st?.total || 0, correct: st?.correct || 0 };
    return { ...st, acc: Math.round((st.correct / (st.correct + st.wrong)) * 100) };
  };

  const subjects = subject === '全部' ? SUBJECTS : [subject];

  return (
    <div className="space-y-4 max-w-4xl">
      <PageTitle desc="颜色越绿掌握越好，点击格子查看详情">🔥 掌握度热力图</PageTitle>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {['全部', ...SUBJECTS].map((s) => (
          <button key={s} onClick={() => setSubject(s)}
            className={`px-4 py-2 rounded-btn shrink-0 text-sm ${subject === s ? 'bg-lotus text-white font-semibold' : 'bg-white text-sub shadow-soft'}`}>
            {s}
          </button>
        ))}
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ minWidth: 640 }}>
          <tbody>
            {subjects.map((s) => (
              <tr key={s}>
                <td className="pr-3 font-bold text-ink whitespace-nowrap align-middle w-16">{s}</td>
                {OUTLINE[s].flatMap((g) => g.children).map((k) => {
                  const st = get(s, k);
                  return (
                    <td key={k} className="p-0.5">
                      <button
                        onClick={() => setTip({ kaodian: k, subject: s, st })}
                        className="w-full h-11 rounded-md text-[11px] font-semibold text-[#3d3d3d] hover:ring-2 hover:ring-lotus transition-all"
                        style={{ background: colorOf(st.acc), color: st.acc !== null && st.acc < 40 ? '#fff' : '#3d3d3d' }}
                      >
                        {st.acc === null ? '—' : `${st.acc}%`}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {tip && (
        <Card className="border-l-4 !border-l-lotus">
          <h4 className="font-bold text-ink">{tip.subject} · {tip.kaodian}</h4>
          <p className="text-sm text-sub mt-1">
            总题量 {tip.st.total} · 正确 {tip.st.correct} 题 · 正确率 {tip.st.acc === null ? '暂无数据' : tip.st.acc + '%'}
            {tip.st.last ? ` · 最近练习：${tip.st.last}` : ''}
          </p>
        </Card>
      )}
    </div>
  );
}
