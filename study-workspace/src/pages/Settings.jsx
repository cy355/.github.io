import { useRef, useState } from 'react';
import { Card, PageTitle, Modal } from '../components/ui';
import { getSettings, setSettings, getQuestions, setQuestions, getDaily, setDaily, VERSION, LS_PREFIX } from '../lib/storage';

export default function Settings() {
  const [settings, setLocal] = useState(() => getSettings() || {});
  const [nameInput, setNameInput] = useState(settings.name || '');
  const [confirmImport, setConfirmImport] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [msg, setMsg] = useState('');
  const fileRef = useRef(null);

  const saveName = () => {
    const v = nameInput.trim();
    if (!v) return;
    const s = { ...settings, name: v };
    setSettings(s); setLocal(s);
    setMsg('姓名已更新 ✅');
  };

  const toggleReminder = () => {
    const s = { ...settings, backupReminder: settings.backupReminder === false };
    setSettings(s); setLocal(s);
  };

  const exportData = () => {
    const data = {
      version: VERSION, exportedAt: new Date().toISOString(),
      questions: getQuestions(), dailyStats: getDaily(), settings: getSettings()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `学习工作台备份-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setMsg('备份文件已下载 ✅');
  };

  const onImportFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data.questions) throw new Error('文件格式不正确');
        setConfirmImport(data);
      } catch (ex) { setMsg('导入失败：' + ex.message); }
    };
    reader.readAsText(f, 'utf-8');
    e.target.value = '';
  };

  const doImport = (data) => {
    setQuestions(data.questions);
    if (data.dailyStats) setDaily(data.dailyStats);
    if (data.settings) setSettings(data.settings);
    setConfirmImport(null);
    setMsg('数据恢复完成，即将刷新页面…');
    setTimeout(() => window.location.reload(), 800);
  };

  const doReset = () => {
    Object.keys(localStorage).filter((k) => k.startsWith(LS_PREFIX)).forEach((k) => localStorage.removeItem(k));
    setConfirmReset(false);
    window.location.reload();
  };

  const inputCls = 'border border-[#E5DFD5] rounded-btn px-4 py-3 focus:outline-none focus:border-lotus';

  return (
    <div className="space-y-4 max-w-2xl">
      <PageTitle desc="数据仅存储在本机浏览器，清缓存会丢失，请定期导出备份">⚙️ 设置</PageTitle>

      {msg && <Card className="!py-3 bg-lotus/10"><p className="text-sm text-[#a06a6e]">{msg}</p></Card>}

      <Card>
        <h3 className="font-bold mb-3">姓名</h3>
        <div className="flex gap-2">
          <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} className={`${inputCls} flex-1`} placeholder="你的名字" />
          <button onClick={saveName} className="bg-lotus text-white rounded-btn px-6 font-semibold">保存</button>
        </div>
      </Card>

      <Card>
        <h3 className="font-bold mb-3">数据备份</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={exportData} className="flex-1 bg-lotus text-white rounded-btn py-3.5 font-semibold">导出 JSON 备份</button>
          <button onClick={() => fileRef.current?.click()} className="flex-1 bg-mist text-white rounded-btn py-3.5 font-semibold">导入恢复</button>
        </div>
        <input ref={fileRef} type="file" accept=".json" onChange={onImportFile} className="hidden" />
        <label className="flex items-center gap-3 mt-4 cursor-pointer">
          <input type="checkbox" checked={settings.backupReminder !== false} onChange={toggleReminder} className="w-5 h-5 accent-[#E8B4B8]" />
          <span className="text-sm text-ink">每周一打开时提醒我导出备份</span>
        </label>
      </Card>

      <Card>
        <h3 className="font-bold mb-2">IMA API 配置状态</h3>
        <p className={`text-sm ${settings.imaConfigured ? 'text-[#2e7d32]' : 'text-[#c62828]'}`}>
          {settings.imaConfigured ? '● 已配置' : '● 未配置'}
        </p>
        {!settings.imaConfigured && (
          <p className="text-xs text-sub mt-1">
            未配置时提示：前往 <a className="underline text-mist" href="https://ima.qq.com/agent-interface" target="_blank" rel="noreferrer">ima.qq.com/agent-interface</a> 获取 IMA_CLIENT_ID 与 IMA_API_KEY，并配置到 Vercel 环境变量。
          </p>
        )}
      </Card>

      <Card>
        <h3 className="font-bold mb-2">危险操作</h3>
        <button onClick={() => setConfirmReset(true)} className="w-full bg-[#EF5350]/90 text-white rounded-btn py-3.5 font-semibold">重置所有数据</button>
        <p className="text-xs text-sub mt-2">将清空题库、错题本、学习记录和设置，操作不可恢复（需二次确认）。</p>
      </Card>

      <p className="text-xs text-sub text-center pb-6">
        当前版本 v{VERSION} · 数据仅存储在本机浏览器，清缓存会丢失，请定期导出备份 💾
      </p>

      {/* 导入确认 */}
      <Modal open={!!confirmImport} onClose={() => setConfirmImport(null)}>
        <h3 className="font-bold mb-2">确认恢复数据？</h3>
        <p className="text-sm text-sub mb-4">将用备份文件覆盖当前全部数据（题库 {confirmImport?.questions?.length || 0} 题），此操作不可撤销。</p>
        <div className="flex gap-3">
          <button onClick={() => setConfirmImport(null)} className="flex-1 bg-[#F5F1EA] text-sub rounded-btn py-3">取消</button>
          <button onClick={() => doImport(confirmImport)} className="flex-1 bg-lotus text-white rounded-btn py-3 font-semibold">确认恢复</button>
        </div>
      </Modal>

      {/* 重置确认 */}
      <Modal open={confirmReset} onClose={() => setConfirmReset(false)}>
        <h3 className="font-bold mb-2 text-[#c62828]">⚠️ 确定重置所有数据？</h3>
        <p className="text-sm text-sub mb-4">题库、错题本、学习记录、设置将全部清空并恢复到初始示例状态，此操作不可恢复！建议先导出备份。</p>
        <div className="flex gap-3">
          <button onClick={() => setConfirmReset(false)} className="flex-1 bg-[#F5F1EA] text-sub rounded-btn py-3">取消</button>
          <button onClick={doReset} className="flex-1 bg-[#EF5350] text-white rounded-btn py-3 font-semibold">确认重置</button>
        </div>
      </Modal>
    </div>
  );
}
