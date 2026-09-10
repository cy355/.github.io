import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Tag, PageTitle, Modal } from '../components/ui';
import { getQuestions, SUBJECTS, todayStr, addDays } from '../lib/storage';
import { isOverdue, persistQuestion } from '../lib/srs';

export default function WrongBook() {
  const nav = useNavigate();
  const allQs = useMemo(() => getQuestions() || [], []);
  const [subject, setSubject] = useState('全部');
  const [kaodian, setKaodian] = useState('全部');
  const [status, setStatus] = useState('全部'); // 待复习 / 已掌握
  const [removeTarget, setRemoveTarget] = useState(null);

  const wrongList = useMemo(() => allQs.filter((q) => q.inWrongBook), [allQs]);
  const dueCount = wrongList.filter((q) => q.masteryLevel < 4 && q.nextReviewDate && q.nextReviewDate <= todayStr()).length;

  const kaodianOptions = useMemo(() => {
    const set = new Set(wrongList.map((q) => q.kaodian));
    return ['全部', ...set];
  }, [wrongList]);

  const filtered = wrongList.filter((q) => {
    if (subject !== '全部' && q.subject !== subject) return false;
    if (kaodian !== '全部' && q.kaodian !== kaodian) return false;
    if (status === '待复习' && !(q.masteryLevel < 4)) return false;
    if (status === '已掌握' && q.masteryLevel !== 4) return false;
    return true;
  });

  const redo = (q) => nav('/answer', { state: { ids: [q.id], mode: 'review', single: true } });

  const remove = (q) => {
    persistQuestion({ ...q, inWrongBook: false, masteryLevel: 4, nextReviewDate: null });
    setRemoveTarget(null);
    window.location.reload(); // 简单刷新保证各模块同步
  };

  const roundText = (q) => {
    if (q.masteryLevel >= 4) return '已掌握';
    return `第${Math.max(1, q.masteryLevel)}轮，${Math.max(0, daysUntil(q.nextReviewDate))}天后复习`;
  };
  function daysUntil(d) {
    if (!d) return 0;
    return Math.ceil((new Date(d + 'T00:00:00') - new Date(todayStr() + 'T00:00:00')) / 86400000);
  }

  return (
    <div className="space-y-4 max-w-4xl">
      <PageTitle desc="答错的题会按间隔重复算法自动安排复习，直到完全掌握">📝 错题本</PageTitle>

      <Card className="!py-3">
        <p className="text-sm text-ink">
          共 <b>{wrongList.length}</b> 道错题，其中 <b className="text-[#c62828]">{dueCount}</b> 道今日待复习
        </p>
      </Card>

      {/* 筛选栏 */}
      <Card className="!py-3 space-y-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['全部', ...SUBJECTS].map((s) => (
            <button key={s} onClick={() => { setSubject(s); setKaodian('全部'); }}
              className={`px-4 py-2 rounded-btn shrink-0 text-sm ${subject === s ? 'bg-lotus text-white font-semibold' : 'bg-[#F5F1EA] text-sub'}`}>
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {kaodianOptions.map((k) => (
            <button key={k} onClick={() => setKaodian(k)}
              className={`px-3 py-2 rounded-btn shrink-0 text-xs ${kaodian === k ? 'bg-mist text-white' : 'bg-[#F5F1EA] text-sub'}`}>
              {k}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {['全部', '待复习', '已掌握'].map((s) => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-4 py-2 rounded-btn text-sm ${status === s ? 'bg-ink text-white' : 'bg-[#F5F1EA] text-sub'}`}>
              {s}
            </button>
          ))}
        </div>
      </Card>

      {/* 错题列表 */}
      {filtered.length === 0 ? (
        <Card className="text-center text-sub py-8">当前筛选下暂无错题 🎉</Card>
      ) : (
        <ul className="space-y-3">
          {filtered.map((q) => (
            <li key={q.id}>
              <Card>
                <p className="text-sm text-ink mb-2">{q.question.length > 80 ? q.question.slice(0, 80) + '…' : q.question}</p>
                <div className="flex gap-2 flex-wrap mb-3">
                  <Tag text={q.subject} />
                  <Tag text={`考点：${q.kaodian}`} color="lotus" />
                  <Tag text={`来源：${q.source}`} color="mist" />
                  <Tag text={roundText(q)} color={q.masteryLevel >= 4 ? 'green' : isOverdue(q) ? 'red' : 'mist'} />
                  {isOverdue(q) && <span className="text-xs text-[#c62828] self-center">⚠️ 已过期</span>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-sub flex-1">上次答错：{q.lastAttemptDate || '—'}</span>
                  <button onClick={() => redo(q)} className="bg-lotus text-white rounded-btn px-5 py-2.5 text-sm font-semibold min-h-[44px]">重做</button>
                  <button onClick={() => setRemoveTarget(q)} className="bg-[#F5F1EA] text-sub rounded-btn px-5 py-2.5 text-sm min-h-[44px]">移除</button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {/* 移除二次确认 */}
      <Modal open={!!removeTarget} onClose={() => setRemoveTarget(null)}>
        <h3 className="font-bold mb-2">确认移除这道错题？</h3>
        <p className="text-sm text-sub mb-4">移除后该题将标记为「已掌握」，不再出现在复习计划中。</p>
        <div className="flex gap-3">
          <button onClick={() => setRemoveTarget(null)} className="flex-1 bg-[#F5F1EA] text-sub rounded-btn py-3">取消</button>
          <button onClick={() => remove(removeTarget)} className="flex-1 bg-[#EF5350] text-white rounded-btn py-3 font-semibold">确认移除</button>
        </div>
      </Modal>
    </div>
  );
}
