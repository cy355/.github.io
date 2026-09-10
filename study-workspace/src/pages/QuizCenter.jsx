import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, Play } from 'lucide-react';
import { Card, Tag, PageTitle } from '../components/ui';
import { getQuestions, SUBJECTS } from '../lib/storage';
import { OUTLINE } from '../data/outline';
import { pickQuestions } from '../lib/srs';

const COUNT_OPTIONS = [3, 6, 10, 15, 20];

export default function QuizCenter() {
  const nav = useNavigate();
  const [subject, setSubject] = useState('数学');
  const [selected, setSelected] = useState(null); // { group, kaodian }
  const [count, setCount] = useState(6);
  const [expanded, setExpanded] = useState(null);
  const [notice, setNotice] = useState('');
  const qs = useMemo(() => getQuestions() || [], []);

  const groups = OUTLINE[subject];
  const previews = useMemo(() => qs.filter((q) => q.subject === subject).slice(0, 8), [qs, subject]);

  const start = () => {
    if (!selected) { setNotice('请先选择一个考点'); return; }
    const { picked, supplemented } = pickQuestions(qs, subject, selected.kaodian, count);
    if (!picked.length) { setNotice('该考点暂无题目，请先导入或选择其他考点'); return; }
    nav('/answer', { state: { ids: picked.map((q) => q.id), mode: 'practice', supplemented } });
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <PageTitle desc="选择科目和考点，系统会优先安排到期错题和新题">✏️ 刷题中心</PageTitle>

      {/* 科目标签栏 */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {SUBJECTS.map((s) => (
          <button
            key={s}
            onClick={() => { setSubject(s); setSelected(null); setNotice(''); setExpanded(null); }}
            className={`px-5 py-2.5 rounded-btn shrink-0 text-[15px] transition-colors ${
              subject === s ? 'bg-lotus text-white font-semibold shadow-soft' : 'bg-white text-sub shadow-soft'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 考点树 */}
        <Card>
          <h3 className="font-bold mb-2">{subject} · 考点树</h3>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {groups.map((g) => (
              <div key={g.name}>
                <button
                  onClick={() => setExpanded(expanded === g.name ? null : g.name)}
                  className="w-full flex items-center gap-2 py-2.5 px-2 rounded-btn hover:bg-lotus/10 text-left font-medium"
                >
                  {expanded === g.name ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  {g.name}
                </button>
                {expanded === g.name && (
                  <div className="ml-6 mb-2 space-y-1">
                    {g.children.map((k) => (
                      <button
                        key={k}
                        onClick={() => { setSelected({ group: g.name, kaodian: k }); setNotice(''); }}
                        className={`w-full text-left px-3 py-2.5 rounded-btn text-sm min-h-[44px] ${
                          selected?.kaodian === k ? 'bg-lotus/25 font-semibold' : 'hover:bg-[#F5F1EA] text-sub'
                        }`}
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* 出题设置 */}
        <Card className="flex flex-col">
          <h3 className="font-bold mb-2">本次出题设置</h3>
          <p className="text-sm text-sub mb-3">
            已选考点：<span className="font-semibold text-ink">{selected ? `${selected.group} · ${selected.kaodian}` : '未选择'}</span>
          </p>
          <div className="text-sm text-sub mb-2">出题数量</div>
          <div className="flex gap-2 flex-wrap mb-4">
            {COUNT_OPTIONS.map((c) => (
              <button
                key={c}
                onClick={() => setCount(c)}
                className={`px-4 py-2.5 rounded-btn min-w-[52px] ${count === c ? 'bg-mist text-white font-semibold' : 'bg-[#F5F1EA] text-sub'}`}
              >
                {c} 题
              </button>
            ))}
          </div>
          {notice && <p className="text-sm text-[#c62828] mb-3">{notice}</p>}
          <button onClick={start} className="mt-auto w-full bg-lotus text-white rounded-btn py-3.5 font-bold flex items-center justify-center gap-2 active:opacity-80">
            <Play size={18} /> 开始答题
          </button>
          <p className="text-xs text-sub mt-2">出题规则：优先到期错题 → 新题，不足时自动从同科其他考点补充。</p>
        </Card>
      </div>

      {/* 题目预览列表 */}
      <Card>
        <h3 className="font-bold mb-3">{subject} · 题库预览</h3>
        <ul className="space-y-3">
          {previews.map((q) => (
            <li key={q.id} className="border border-[#F0EAE1] rounded-btn p-3">
              <p className="text-sm text-ink mb-2">{q.question.length > 50 ? q.question.slice(0, 50) + '…' : q.question}</p>
              <div className="flex gap-2 flex-wrap">
                <Tag text={`考点：${q.kaodian}`} color="lotus" />
                <Tag text={`来源：${q.source}`} color="mist" />
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
