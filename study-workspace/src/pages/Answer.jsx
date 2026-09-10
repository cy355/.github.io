import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Tag, ProgressBar, Modal } from '../components/ui';
import { getQuestions, recordAttempt, todayStr } from '../lib/storage';
import { applyAnswer, persistQuestion, normalizeAnswer } from '../lib/srs';

export default function Answer() {
  const { state } = useLocation();
  const nav = useNavigate();
  const session = state || {};
  const allQs = useMemo(() => getQuestions() || [], []);

  // 初始队列；session.single=true 时（单题复习/重做）答错也不在轮内重做
  const initial = useMemo(() => {
    const map = new Map(allQs.map((q) => [q.id, q]));
    return (session.ids || []).map((id) => map.get(id)).filter(Boolean);
  }, [allQs, session.ids]);

  const [queue, setQueue] = useState(initial);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState('answering'); // answering | correct | wrong | done
  const [input, setInput] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [log, setLog] = useState([]); // {id, correct, seconds}
  const [suppNotice, setSuppNotice] = useState(session.supplemented || 0);
  const timerRef = useRef(null);
  const q = queue[idx];

  useEffect(() => {
    setSeconds(0);
    if (phase === 'answering' && q) {
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [idx, phase, q]);

  if (!queue.length) {
    return (
      <Card className="max-w-2xl text-center">
        <p className="text-sub py-6">没有可作答的题目，请从刷题中心选择。</p>
        <button onClick={() => nav('/quiz')} className="bg-lotus text-white rounded-btn px-6 py-3">去刷题中心</button>
      </Card>
    );
  }

  const finish = (finalLog) => {
    const correctCount = finalLog.filter((l) => l.correct).length;
    const acc = finalLog.length ? Math.round((correctCount / finalLog.length) * 100) : 0;
    setLog(finalLog);
    setPhase('done');
    setSummary({ total: finalLog.length, correct: correctCount, acc });
  };

  const advance = (finalLog) => {
    if (idx + 1 >= queue.length) finish(finalLog);
    else { setIdx(idx + 1); setPhase('answering'); setInput(''); }
  };

  const judge = (correct) => {
    clearInterval(timerRef.current);
    const updated = applyAnswer({ ...q }, correct);
    persistQuestion(updated);
    recordAttempt(updated, correct, seconds);
    const newLog = [...log, { id: q.id, correct, seconds }];
    setLog(newLog);
    if (correct) {
      setPhase('correct');
      setTimeout(() => advance(newLog), 1500);
    } else {
      setPhase('wrong');
      // 答错的题在本轮末尾自动重做一次（单题模式除外）
      if (!session.single) setQueue((prev) => [...prev, { ...updated, _retry: true }]);
    }
  };

  const onOption = (optText) => {
    if (phase !== 'answering') return;
    // 选项形如 "A. 15"，取字母判定；也允许整串匹配
    const letter = optText.trim().charAt(0).toUpperCase();
    const ans = normalizeAnswer(q.answer);
    const ok = ans === normalizeAnswer(letter) || ans === normalizeAnswer(optText);
    judge(ok);
  };

  const onFillSubmit = () => {
    if (phase !== 'answering') return;
    judge(normalizeAnswer(input) === normalizeAnswer(q.answer));
  };

  const retryCurrent = () => {
    // 「已理解，继续」后，若该题在队尾有重做副本则直接跳到下一题（副本保留）
    advance(log);
  };

  if (phase === 'done') {
    return (
      <Card className="max-w-xl mx-auto text-center space-y-3">
        <div className="text-4xl">🌷</div>
        <h2 className="text-xl font-bold">本轮小结</h2>
        <p className="text-sub">本轮共 <b className="text-ink">{summary.total}</b> 题，正确 <b className="text-[#2e7d32]">{summary.correct}</b> 题，正确率 <b className="text-ink">{summary.acc}%</b></p>
        <p className="text-xs text-sub">答错的题已自动加入错题本，并安排了复习时间。</p>
        <div className="flex gap-3 justify-center pt-2">
          <button onClick={() => nav('/quiz')} className="bg-lotus text-white rounded-btn px-6 py-3 font-semibold">再来一轮</button>
          <button onClick={() => nav('/')} className="bg-mist text-white rounded-btn px-6 py-3 font-semibold">回工作台</button>
        </div>
      </Card>
    );
  }

  const isChoice = q.questionType === '选择';
  const isFill = q.questionType === '填空';
  const isSelf = q.questionType === '解答';
  const isListen = q.questionType === '听力';
  const showTags = true;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* 进度 */}
      <div>
        <div className="flex justify-between text-sm text-sub mb-2">
          <span>第 {idx + 1} / {queue.length} 题</span>
          <span>本题用时 {seconds} 秒</span>
        </div>
        <ProgressBar percent={((idx + 1) / queue.length) * 100} color="#A8B8C8" />
      </div>

      {suppNotice > 0 && idx === 0 && (
        <Card className="bg-mist/15 border border-mist/40 !py-3">
          <p className="text-sm text-[#5a6b7c]">该考点题量不足，已从其他考点补充 {suppNotice} 题</p>
        </Card>
      )}

      <Card>
        {q._retry && <Tag text="错题重做" color="red" />}
        <div className="flex gap-2 flex-wrap mb-3">
          <Tag text={`来源：${q.source}`} color="mist" />
          <Tag text={`考点：${q.kaodian}`} color="lotus" />
        </div>

        {isListen && <AudioPlayer src={q.audioUrl} />}
        <p className="text-ink leading-relaxed mb-4 whitespace-pre-wrap">{q.question}</p>

        {isChoice || isListen ? (
          <div className="space-y-3">
            {(q.options || []).map((opt) => (
              <button
                key={opt}
                disabled={phase !== 'answering'}
                onClick={() => onOption(opt)}
                className="w-full text-left border border-[#E5DFD5] rounded-btn px-4 py-3.5 min-h-[44px] text-ink active:border-lotus hover:border-lotus transition-colors disabled:opacity-60"
              >
                {opt}
              </button>
            ))}
          </div>
        ) : isFill ? (
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onFillSubmit()}
              disabled={phase !== 'answering'}
              placeholder="输入答案"
              className="flex-1 border border-[#E5DFD5] rounded-btn px-4 py-3 focus:outline-none focus:border-lotus"
            />
            <button onClick={onFillSubmit} disabled={phase !== 'answering'} className="bg-lotus text-white rounded-btn px-6 font-semibold">提交</button>
          </div>
        ) : isSelf ? (
          <div className="flex gap-3">
            <button onClick={() => judge(true)} disabled={phase !== 'answering'} className="flex-1 bg-[#A5D6A7] text-[#2e7d32] rounded-btn py-3.5 font-semibold">我答对了</button>
            <button onClick={() => judge(false)} disabled={phase !== 'answering'} className="flex-1 bg-[#EF5350]/90 text-white rounded-btn py-3.5 font-semibold">我答错了</button>
          </div>
        ) : null}

        {/* 判分反馈 */}
        {phase === 'correct' && (
          <div className="mt-4 bg-[#A5D6A7]/25 text-[#2e7d32] rounded-btn px-4 py-3 font-semibold">✓ 正确</div>
        )}
        {phase === 'wrong' && (
          <div className="mt-4 space-y-3">
            <div className="bg-[#EF5350]/15 text-[#c62828] rounded-btn px-4 py-3 font-semibold">✗ 错误</div>
            <div className="bg-[#F7F3EC] rounded-btn p-4 text-sm space-y-2">
              <p><span className="text-sub">正确答案：</span><b className="text-ink">{q.answer}</b></p>
              <p><span className="text-sub">解题思路：</span><span className="text-ink">{q.analysis}</span></p>
            </div>
            <button onClick={retryCurrent} className="w-full bg-lotus text-white rounded-btn py-3.5 font-bold">已理解，继续</button>
          </div>
        )}
      </Card>
    </div>
  );
}

function AudioPlayer({ src }) {
  const ref = useRef(null);
  if (!src) return <p className="text-xs text-sub mb-2">（本题未提供音频文件，可在导入时填写 audioUrl）</p>;
  return (
    <div className="mb-4 flex items-center gap-3 bg-[#F7F3EC] rounded-btn p-3">
      <button onClick={() => ref.current?.play()} className="bg-lotus text-white rounded-btn px-4 py-2 text-sm font-semibold">▶ 播放</button>
      <button onClick={() => { ref.current?.pause(); ref.current.currentTime = 0; ref.current?.play(); }} className="bg-mist text-white rounded-btn px-4 py-2 text-sm">↻ 重播</button>
      <audio ref={ref} src={src} preload="none" />
    </div>
  );
}
