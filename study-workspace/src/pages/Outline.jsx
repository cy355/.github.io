import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, PageTitle, Modal } from '../components/ui';
import { getQuestions, SUBJECTS } from '../lib/storage';
import { OUTLINE } from '../data/outline';
import { pickQuestions } from '../lib/srs';

// 掌握度圆点颜色
function dotColor(acc) {
  if (acc === null) return '#E0E0E0';
  if (acc >= 90) return '#4CAF50';
  if (acc >= 70) return '#A5D6A7';
  if (acc >= 40) return '#FFD54F';
  return '#EF5350';
}

export default function Outline() {
  const nav = useNavigate();
  const [subject, setSubject] = useState('数学');
  const [confirmTarget, setConfirmTarget] = useState(null);
  const qs = useMemo(() => getQuestions() || [], []);
  const stats = useMemo(() => {
    const m = {};
    qs.forEach((q) => {
      const key = `${q.subject}|${q.kaodian}`;
      if (!m[key]) m[key] = { correct: 0, wrong: 0 };
      m[key].correct += q.correctCount;
      m[key].wrong += q.wrongCount;
    });
    return m;
  }, [qs]);

  const accOf = (k) => {
    const s = stats[`${subject}|${k}`];
    if (!s || s.correct + s.wrong === 0) return null;
    return Math.round((s.correct / (s.correct + s.wrong)) * 100);
  };

  const startQuiz = () => {
    const { picked } = pickQuestions(qs, subject, confirmTarget, 6);
    if (!picked.length) { setConfirmTarget(null); alert('该考点暂无题目，请先导入'); return; }
    nav('/answer', { state: { ids: picked.map((q) => q.id), mode: 'practice' } });
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <PageTitle desc="点击圆点查看掌握度，点击考点名称直接开始 6 题小练习">📖 考点大纲</PageTitle>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {SUBJECTS.map((s) => (
          <button key={s} onClick={() => setSubject(s)}
            className={`px-5 py-2.5 rounded-btn shrink-0 ${subject === s ? 'bg-lotus text-white font-semibold shadow-soft' : 'bg-white text-sub shadow-soft'}`}>
            {s}
          </button>
        ))}
      </div>

      <Card>
        <div className="flex flex-wrap gap-3 text-xs text-sub mb-4">
          <Legend c="#4CAF50" t="已掌握 ≥90%" /><Legend c="#A5D6A7" t="部分掌握 70-89%" />
          <Legend c="#FFD54F" t="待加强 40-69%" /><Legend c="#EF5350" t="薄弱 <40%" />
          <Legend c="#E0E0E0" t="无数据" />
        </div>
        <div className="space-y-4">
          {OUTLINE[subject].map((g) => (
            <div key={g.name}>
              <h4 className="font-bold text-ink mb-2">{g.name}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-2">
                {g.children.map((k) => {
                  const acc = accOf(k);
                  return (
                    <div key={k} className="flex items-center gap-3 bg-[#FAF7F1] rounded-btn px-3 py-2.5">
                      <button
                        onClick={() => setConfirmTarget(k)}
                        className="flex-1 text-left text-sm text-ink min-h-[44px] flex items-center hover:text-[#a06a6e]"
                      >
                        {k}
                      </button>
                      <span title={`${k}：${acc === null ? '无数据' : '正确率 ' + acc + '%'}`} className="relative group shrink-0">
                        <span className="block w-3.5 h-3.5 rounded-full" style={{ background: dotColor(acc) }} />
                        <span className="hidden group-hover:block absolute right-0 top-6 z-10 bg-ink text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
                          {acc === null ? `${k}：暂无练习数据` : `${k}：正确率 ${acc}%`}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Modal open={!!confirmTarget} onClose={() => setConfirmTarget(null)}>
        <h3 className="font-bold mb-2">开始刷题</h3>
        <p className="text-sm text-sub mb-4">考点「{confirmTarget}」，默认出 6 题（含到期错题优先）。</p>
        <div className="flex gap-3">
          <button onClick={() => setConfirmTarget(null)} className="flex-1 bg-[#F5F1EA] text-sub rounded-btn py-3">取消</button>
          <button onClick={startQuiz} className="flex-1 bg-lotus text-white rounded-btn py-3 font-semibold">开始</button>
        </div>
      </Modal>
    </div>
  );
}

function Legend({ c, t }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="w-3 h-3 rounded-full inline-block" style={{ background: c }} />{t}
    </span>
  );
}
