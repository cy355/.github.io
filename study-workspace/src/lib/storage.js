import { SEED_QUESTIONS, buildSeedDaily } from '../data/seed';

export const LS_PREFIX = 'wb_study_';
export const VERSION = '1.0.0';
export const SUBJECTS = ['数学', '英语', '物理', '化学', '生物'];

export function load(key, fallback) {
  try {
    const v = localStorage.getItem(LS_PREFIX + key);
    return v ? JSON.parse(v) : fallback;
  } catch (e) {
    return fallback;
  }
}
export function save(key, val) {
  localStorage.setItem(LS_PREFIX + key, JSON.stringify(val));
}

export const getQuestions = () => load('questions', null);
export const setQuestions = (qs) => save('questions', qs);
export const getSettings = () => load('settings', null);
export const setSettings = (s) => save('settings', s);
export const getDaily = () => load('dailyStats', null);
export const setDaily = (d) => save('dailyStats', d);

export function todayStr(d = new Date()) {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
}
export function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return todayStr(d);
}
export function daysBetween(a, b) {
  return Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000);
}

export const DEFAULT_SETTINGS = {
  name: '',
  dailyGoal: 20,
  backupReminder: true,
  lastBackupRemindWeek: '',
  imaConfigured: false
};

export function initApp() {
  if (!getQuestions() || !getQuestions().length) setQuestions(SEED_QUESTIONS);
  if (!getDaily()) setDaily(buildSeedDaily());
  if (!getSettings()) setSettings(DEFAULT_SETTINGS);
}

// ---------- 统计 ----------
export function recordAttempt(q, correct, seconds) {
  const daily = getDaily() || {};
  const t = todayStr();
  if (!daily[t]) daily[t] = { done: 0, correct: 0 };
  daily[t].done += 1;
  if (correct) daily[t].correct += 1;
  setDaily(daily);
}

export function subjectStats(qs, subject) {
  const list = qs.filter((q) => q.subject === subject);
  const total = list.length;
  const attempted = list.filter((q) => (q.correctCount + q.wrongCount) > 0);
  const correct = list.reduce((s, q) => s + q.correctCount, 0);
  const wrong = list.reduce((s, q) => s + q.wrongCount, 0);
  const acc = correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0;
  const toReview = list.filter((q) => q.masteryLevel < 4 && q.nextReviewDate && q.nextReviewDate <= todayStr()).length;
  return { total, correct, wrong, acc, toReview, mastered: list.filter((q) => q.masteryLevel === 4).length };
}

export function kaodianStats(qs, subject, kaodian) {
  const list = qs.filter((q) => q.subject === subject && q.kaodian === kaodian);
  const correct = list.reduce((s, q) => s + q.correctCount, 0);
  const wrong = list.reduce((s, q) => s + q.wrongCount, 0);
  const acc = correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : null;
  let last = null;
  list.forEach((q) => { if (q.lastAttemptDate && (!last || q.lastAttemptDate > last)) last = q.lastAttemptDate; });
  return { total: list.length, correct, wrong, acc, last, mastered: list.filter((q) => q.masteryLevel === 4).length };
}

export function streakInfo(daily) {
  const dates = Object.keys(daily).filter((d) => daily[d].done > 0).sort();
  if (!dates.length) return { streak: 0, best: 0 };
  // 最长连续
  let best = 1, run = 1;
  for (let i = 1; i < dates.length; i++) {
    if (daysBetween(dates[i - 1], dates[i]) === 1) run += 1; else run = 1;
    best = Math.max(best, run);
  }
  // 当前连续（从今天或昨天往回数）
  let streak = 0;
  let cur = new Date();
  if (!daily[todayStr(cur)] || daily[todayStr(cur)].done === 0) cur.setDate(cur.getDate() - 1);
  while (daily[todayStr(cur)] && daily[todayStr(cur)].done > 0) {
    streak += 1;
    cur.setDate(cur.getDate() - 1);
  }
  return { streak, best: Math.max(best, streak) };
}
