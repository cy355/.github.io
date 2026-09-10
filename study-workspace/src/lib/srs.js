import { addDays, todayStr, daysBetween, getQuestions, setQuestions } from './storage';

// 间隔重复：0→1(+7d)→2(+14d)→3(+28d)→4已掌握；答错重置为1(+7d)并入错题本
export function applyAnswer(q, correct) {
  const t = todayStr();
  q.lastAttemptDate = t;
  if (correct) {
    q.correctCount = (q.correctCount || 0) + 1;
    if (q.masteryLevel === 0) { q.masteryLevel = 1; q.nextReviewDate = addDays(t, 7); }
    else if (q.masteryLevel === 1) { q.masteryLevel = 2; q.nextReviewDate = addDays(t, 14); }
    else if (q.masteryLevel === 2) { q.masteryLevel = 3; q.nextReviewDate = addDays(t, 28); }
    else if (q.masteryLevel === 3) { q.masteryLevel = 4; q.nextReviewDate = null; q.inWrongBook = false; }
  } else {
    q.wrongCount = (q.wrongCount || 0) + 1;
    q.masteryLevel = 1;
    q.nextReviewDate = addDays(t, 7);
    q.inWrongBook = true;
  }
  return q;
}

export function persistQuestion(updated) {
  const qs = getQuestions() || [];
  const i = qs.findIndex((q) => q.id === updated.id);
  if (i >= 0) qs[i] = updated; else qs.push(updated);
  setQuestions(qs);
  return qs;
}

export function dueQuestions(qs) {
  const t = todayStr();
  return qs
    .filter((q) => q.masteryLevel < 4 && q.nextReviewDate && q.nextReviewDate <= t)
    .sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate));
}

export function isOverdue(q) {
  if (!q.nextReviewDate) return false;
  return daysBetween(q.nextReviewDate, todayStr()) > 7;
}

// 从题库选题：先抽该考点到期错题 → 从未做过的题 → 同科其他考点补充
export function pickQuestions(qs, subject, kaodian, count) {
  const inK = qs.filter((q) => q.subject === subject && q.kaodian === kaodian && q.masteryLevel < 4);
  const t = todayStr();
  const dueWrong = inK.filter((q) => q.wrongCount > 0 && q.nextReviewDate && q.nextReviewDate <= t)
    .sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate));
  const unseen = inK.filter((q) => q.correctCount + q.wrongCount === 0);
  const seen = inK.filter((q) => q.correctCount + q.wrongCount > 0 && !dueWrong.includes(q));
  let picked = [...dueWrong, ...unseen, ...seen].slice(0, count);
  let supplemented = 0;
  if (picked.length < count) {
    const ids = new Set(picked.map((q) => q.id));
    const others = qs.filter((q) => q.subject === subject && q.kaodian !== kaodian && q.masteryLevel < 4 && !ids.has(q.id));
    const extra = others.slice(0, count - picked.length);
    supplemented = extra.length;
    picked = [...picked, ...extra];
  }
  return { picked, supplemented };
}

export function normalizeAnswer(s) {
  return String(s || '').trim().toLowerCase().replace(/\s+/g, '');
}
