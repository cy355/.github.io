import { useRef, useState } from 'react';
import { Card, PageTitle, Tag } from '../components/ui';
import { getQuestions, setQuestions, SUBJECTS } from '../lib/storage';
import { OUTLINE } from '../data/outline';
import { md5 } from '../lib/md5';

const TABS = ['粘贴文本导入', '上传文件导入', '图片OCR导入', '手动录入'];

const TEXT_SAMPLE = `题目：已知数列{an}满足a1=1，an+1=2an+1，求a5的值。
选项：A.15 B.31 C.63 D.127
答案：B
考点：数列递推
来源：2024上海春考`;

export default function ImportPage() {
  const [tab, setTab] = useState(TABS[0]);
  return (
    <div className="space-y-4 max-w-4xl">
      <PageTitle desc="导入的题目自动并入对应科目题库，与预置题库合并去重（题干 MD5 去重）">⬆️ 题库导入</PageTitle>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 rounded-btn shrink-0 text-sm ${tab === t ? 'bg-lotus text-white font-semibold shadow-soft' : 'bg-white text-sub shadow-soft'}`}>
            {t}
          </button>
        ))}
      </div>
      {tab === '粘贴文本导入' && <PasteImport />}
      {tab === '上传文件导入' && <FileImport />}
      {tab === '图片OCR导入' && <OcrImport />}
      {tab === '手动录入' && <ManualForm />}
    </div>
  );
}

// ---------- 通用：预览确认后写入 ----------
function useImport() {
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const confirm = (items) => {
    const qs = getQuestions() || [];
    const exist = new Set(qs.map((q) => q.id));
    let added = 0, dup = 0;
    items.forEach((it) => {
      const q = {
        id: md5(it.question), subject: it.subject, kaodian: it.kaodian, source: it.source || '自导入',
        questionType: it.questionType || (it.options && it.options.length ? '选择' : '填空'),
        question: it.question, options: it.options || null, answer: it.answer, analysis: it.analysis || '',
        audioUrl: it.audioUrl || null,
        masteryLevel: 0, nextReviewDate: null, correctCount: 0, wrongCount: 0, lastAttemptDate: null, inWrongBook: false
      };
      if (exist.has(q.id)) { dup += 1; return; }
      qs.push(q); exist.add(q.id); added += 1;
    });
    setQuestions(qs);
    setResult({ added, dup });
    setPreview(null);
  };
  return { preview, setPreview, result, confirm };
}

function PreviewList({ items, onConfirm, onCancel }) {
  return (
    <Card>
      <h3 className="font-bold mb-3">解析结果预览（{items.length} 题）</h3>
      <ul className="space-y-3 max-h-80 overflow-y-auto mb-4">
        {items.map((it, i) => (
          <li key={i} className="border border-[#F0EAE1] rounded-btn p-3 text-sm">
            <p className="text-ink mb-1">{it.question}</p>
            <p className="text-sub text-xs mb-1">{it.options ? it.options.join('　') : '（填空/解答）'} — 答案：{it.answer}</p>
            <div className="flex gap-2 flex-wrap">
              <Tag text={it.subject} /><Tag text={`考点：${it.kaodian}`} color="lotus" />
            </div>
          </li>
        ))}
      </ul>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 bg-[#F5F1EA] text-sub rounded-btn py-3">取消</button>
        <button onClick={onConfirm} className="flex-1 bg-lotus text-white rounded-btn py-3 font-semibold">确认导入</button>
      </div>
    </Card>
  );
}

// ---------- 粘贴文本 ----------
function PasteImport() {
  const [text, setText] = useState('');
  const [err, setErr] = useState('');
  const { preview, setPreview, result, confirm } = useImport();

  const parse = () => {
    setErr('');
    const blocks = text.split(/\n\s*\n/).filter((b) => b.trim());
    const items = [];
    for (const b of blocks) {
      const get = (label) => {
        const m = b.match(new RegExp(`${label}[:：]\\s*(.+)`));
        return m ? m[1].trim() : '';
      };
      const question = get('题目');
      if (!question) { setErr('存在未识别的题目块（缺少「题目：」行），请检查格式'); return; }
      const optStr = get('选项');
      const options = optStr ? optStr.match(/[A-D][.．、]?\s*[^A-D]+/g)?.map((s) => s.trim()).filter(Boolean) : null;
      items.push({
        question, options, answer: get('答案'),
        kaodian: get('考点') || '未分类', source: get('来源') || '自导入', subject: get('科目') || '数学',
        analysis: get('解析') || ''
      });
    }
    if (!items.length) { setErr('未解析到题目，请按示例格式粘贴'); return; }
    setPreview(items);
  };

  return (
    <div className="space-y-4">
      <Card>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8}
          placeholder={TEXT_SAMPLE}
          className="w-full border border-[#E5DFD5] rounded-btn p-4 focus:outline-none focus:border-lotus" />
        <div className="mt-3 bg-[#F7F3EC] rounded-btn p-4 text-xs text-sub leading-6">
          <b>格式示例</b>（多题之间用空行分隔）：
          <pre className="whitespace-pre-wrap mt-1 text-ink">{TEXT_SAMPLE}</pre>
        </div>
        {err && <p className="text-sm text-[#c62828] mt-2">{err}</p>}
        <button onClick={parse} className="mt-3 w-full bg-lotus text-white rounded-btn py-3.5 font-bold">解析并导入</button>
      </Card>
      {result && <ResultBar result={result} />}
      {preview && <PreviewList items={preview} onConfirm={() => confirm(preview)} onCancel={() => setPreview(null)} />}
    </div>
  );
}

// ---------- 文件导入 ----------
const CSV_TEMPLATE = '题干,选项A,选项B,选项C,选项D,答案,考点,来源,科目\n"1+1=?","A.1","B.2","C.3","D.4",B,基本初等函数,示例,数学';
function FileImport() {
  const fileRef = useRef(null);
  const [err, setErr] = useState('');
  const { preview, setPreview, result, confirm } = useImport();

  const parseCsvLine = (line) => {
    const out = []; let cur = '', inQ = false;
    for (const ch of line) {
      if (ch === '"') inQ = !inQ;
      else if (ch === ',' && !inQ) { out.push(cur); cur = ''; }
      else cur += ch;
    }
    out.push(cur);
    return out;
  };

  const handleFile = (e) => {
    setErr('');
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        let items = [];
        if (f.name.endsWith('.json')) {
          const arr = JSON.parse(reader.result);
          items = arr.map((x) => ({ question: x.question, options: x.options, answer: x.answer, kaodian: x.kaodian || '未分类', source: x.source || '自导入', subject: x.subject || '数学', analysis: x.analysis || '', questionType: x.questionType, audioUrl: x.audioUrl }));
        } else {
          const lines = String(reader.result).split(/\r?\n/).filter((l) => l.trim());
          items = lines.slice(1).map((l) => {
            const [question, A, B, C, D, answer, kaodian, source, subject, analysis] = parseCsvLine(l);
            return { question, options: [A, B, C, D].filter(Boolean), answer, kaodian: kaodian || '未分类', source: source || '自导入', subject: subject || '数学', analysis: analysis || '' };
          });
        }
        items = items.filter((x) => x.question && x.answer);
        if (!items.length) { setErr('文件中没有有效题目'); return; }
        setPreview(items);
      } catch (ex) { setErr('解析失败：' + ex.message); }
    };
    reader.readAsText(f, 'utf-8');
    e.target.value = '';
  };

  const downloadTemplate = () => {
    const blob = new Blob(['\ufeff' + CSV_TEMPLATE], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = '题库模板.csv'; a.click();
  };

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-sm text-sub mb-2">支持 <b>CSV</b> 和 <b>JSON</b> 题库文件：</p>
        <div className="bg-[#F7F3EC] rounded-btn p-4 text-xs space-y-2 mb-4">
          <p className="text-ink"><b>CSV 列顺序：</b>题干,选项A,选项B,选项C,选项D,答案,考点,来源,科目</p>
          <pre className="text-ink whitespace-pre-wrap">{`[{"question":"...","options":["A...","B...","C...","D..."],"answer":"B","kaodian":"数列递推","source":"2024上海春考","subject":"数学"}]`}</pre>
        </div>
        <input ref={fileRef} type="file" accept=".csv,.json" onChange={handleFile}
          className="w-full border border-dashed border-mist rounded-btn p-4 text-sm" />
        {err && <p className="text-sm text-[#c62828] mt-2">{err}</p>}
        <button onClick={downloadTemplate} className="mt-3 w-full bg-mist text-white rounded-btn py-3 font-semibold">下载 CSV 模板</button>
      </Card>
      {result && <ResultBar result={result} />}
      {preview && <PreviewList items={preview} onConfirm={() => confirm(preview)} onCancel={() => setPreview(null)} />}
    </div>
  );
}

// ---------- OCR 导入 ----------
function OcrImport() {
  const fileRef = useRef(null);
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const { preview, setPreview, result, confirm } = useImport();

  const compress = (file) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const max = 1500;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale; canvas.height = img.height * scale;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.85);
    };
    img.src = URL.createObjectURL(file);
  });

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBusy(true); setStatus('正在压缩图片…'); setProgress(0);
    const blob = await compress(file);
    setStatus('正在加载 OCR 引擎与中文语言包（首次较慢）…');
    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker(['chi_sim', 'eng'], 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') { setStatus('正在识别…'); setProgress(Math.round(m.progress * 100)); }
        }
      });
      const { data } = await worker.recognize(blob);
      await worker.terminate();
      setText(data.text);
      setStatus('识别完成，请检查并修正识别错误后导入');
    } catch (ex) {
      setStatus('识别失败：' + ex.message + '（OCR 需要联网下载语言包）');
    }
    setBusy(false);
  };

  const parseToPreview = () => {
    // OCR 文本按空行分块，尽量抽取「答案/考点」行，其余并入题干
    const blocks = text.split(/\n\s*\n/).filter((b) => b.trim());
    const items = blocks.map((b) => {
      const lines = b.split('\n').map((l) => l.trim()).filter(Boolean);
      let answer = '', kaodian = '未分类';
      const body = [];
      lines.forEach((l) => {
        let m = l.match(/^(答案|正确答案)[:：]\s*(.+)/);
        if (m) { answer = m[2]; return; }
        m = l.match(/^考点[:：]\s*(.+)/);
        if (m) { kaodian = m[1]; return; }
        body.push(l);
      });
      return { question: body.join('\n'), options: null, answer: answer || '（请手动填写）', kaodian, source: 'OCR导入', subject: '数学' };
    }).filter((x) => x.question);
    if (items.length) setPreview(items);
  };

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-sm text-sub mb-2">上传或拍照上传题目截图（自动压缩到长边 1500px 后识别，支持中英文）：</p>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleImage} disabled={busy}
          className="w-full border border-dashed border-mist rounded-btn p-4 text-sm" />
        {busy && (
          <div className="mt-3">
            <p className="text-sm text-sub mb-1">{status}</p>
            <div className="w-full bg-[#EFEAE2] rounded-full h-2 overflow-hidden">
              <div className="h-full bg-lotus rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
        {!busy && status && <p className="text-sm text-sub mt-2">{status}</p>}
        {text && (
          <>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8}
              className="w-full border border-[#E5DFD5] rounded-btn p-4 mt-3 focus:outline-none focus:border-lotus" />
            <button onClick={parseToPreview} className="mt-3 w-full bg-lotus text-white rounded-btn py-3.5 font-bold">修正完毕，解析并导入</button>
          </>
        )}
      </Card>
      {result && <ResultBar result={result} />}
      {preview && <PreviewList items={preview} onConfirm={() => confirm(preview)} onCancel={() => setPreview(null)} />}
    </div>
  );
}

// ---------- 手动录入 ----------
function ManualForm() {
  const [form, setForm] = useState({ subject: '数学', kaodian: '', questionType: '选择', question: '', options: '', answer: '', analysis: '', source: '' });
  const [msg, setMsg] = useState(null);
  const kaodianOptions = OUTLINE[form.subject].flatMap((g) => g.children);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const saveQ = () => {
    if (!form.question.trim() || !form.answer.trim()) { setMsg({ ok: false, text: '题干和答案不能为空' }); return; }
    const qs = getQuestions() || [];
    const id = md5(form.question.trim());
    if (qs.some((q) => q.id === id)) { setMsg({ ok: false, text: '该题已存在（题干重复），未导入' }); return; }
    const options = form.questionType === '选择' || form.questionType === '听力'
      ? form.options.split('\n').map((s) => s.trim()).filter(Boolean) : null;
    qs.push({
      id, subject: form.subject, kaodian: form.kaodian || '未分类', source: form.source || '自录入',
      questionType: form.questionType, question: form.question.trim(), options, answer: form.answer.trim(),
      analysis: form.analysis, audioUrl: null,
      masteryLevel: 0, nextReviewDate: null, correctCount: 0, wrongCount: 0, lastAttemptDate: null, inWrongBook: false
    });
    setQuestions(qs);
    setMsg({ ok: true, text: '已保存到题库 ✅' });
    setForm((f) => ({ ...f, question: '', options: '', answer: '', analysis: '' }));
  };

  const inputCls = 'w-full border border-[#E5DFD5] rounded-btn px-4 py-3 focus:outline-none focus:border-lotus';

  return (
    <Card className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <select value={form.subject} onChange={(e) => set('subject', e.target.value)} className={inputCls}>
          {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={form.kaodian} onChange={(e) => set('kaodian', e.target.value)} className={inputCls}>
          <option value="">选择考点</option>
          {kaodianOptions.map((k) => <option key={k}>{k}</option>)}
        </select>
        <select value={form.questionType} onChange={(e) => set('questionType', e.target.value)} className={inputCls}>
          {['选择', '填空', '解答', '听力'].map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>
      <textarea value={form.question} onChange={(e) => set('question', e.target.value)} rows={3} placeholder="题干（必填）" className={inputCls} />
      {(form.questionType === '选择' || form.questionType === '听力') && (
        <textarea value={form.options} onChange={(e) => set('options', e.target.value)} rows={3} placeholder={'选项，每行一个，如：\nA. 15\nB. 31'} className={inputCls} />
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input value={form.answer} onChange={(e) => set('answer', e.target.value)} placeholder="答案（必填）" className={inputCls} />
        <input value={form.source} onChange={(e) => set('source', e.target.value)} placeholder="来源，如：2024上海春考" className={inputCls} />
      </div>
      <textarea value={form.analysis} onChange={(e) => set('analysis', e.target.value)} rows={2} placeholder="解析（选填）" className={inputCls} />
      {msg && <p className={`text-sm ${msg.ok ? 'text-[#2e7d32]' : 'text-[#c62828]'}`}>{msg.text}</p>}
      <button onClick={saveQ} className="w-full bg-lotus text-white rounded-btn py-3.5 font-bold">保存到题库</button>
    </Card>
  );
}

function ResultBar({ result }) {
  return (
    <Card className="!py-3 bg-[#A5D6A7]/15">
      <p className="text-sm text-[#2e7d32]">导入完成：新增 {result.added} 题，跳过重复 {result.dup} 题 ✅</p>
    </Card>
  );
}
