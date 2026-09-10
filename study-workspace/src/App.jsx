import { useEffect, useState } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { NAV_ITEMS } from './data/nav';
import { getSettings, setSettings } from './lib/storage';
import Today from './pages/Today';
import QuizCenter from './pages/QuizCenter';
import Answer from './pages/Answer';
import WrongBook from './pages/WrongBook';
import Outline from './pages/Outline';
import ImportPage from './pages/ImportPage';
import Heatmap from './pages/Heatmap';
import Stats from './pages/Stats';
import Plan from './pages/Plan';
import Settings from './pages/Settings';
import { Modal } from './components/ui';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [name, setName] = useState('');
  const [showNameModal, setShowNameModal] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [showBackup, setShowBackup] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const s = getSettings() || {};
    if (!s.name) setShowNameModal(true);
    else setName(s.name);
    // 每周一备份提醒
    if (s.backupReminder !== false) {
      const now = new Date();
      const weekKey = `${now.getFullYear()}-W${getWeekNumber(now)}`;
      if (now.getDay() === 1 && s.lastBackupRemindWeek !== weekKey) {
        setShowBackup(true);
        setSettings({ ...s, lastBackupRemindWeek: weekKey });
      }
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const saveName = () => {
    const v = nameInput.trim();
    if (!v) return;
    const s = getSettings() || {};
    setSettings({ ...s, name: v });
    setName(v);
    setShowNameModal(false);
  };

  const title = name ? `${name}的学习工作台` : '学习工作台';

  const sidebar = (
    <nav className="flex flex-col gap-1 p-3">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-btn text-[15px] transition-colors ${
              isActive ? 'bg-lotus/25 text-ink font-semibold' : 'text-sub hover:bg-lotus/10'
            }`
          }
        >
          <item.icon size={20} strokeWidth={1.8} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-cream">
      {/* 移动端顶栏 */}
      <header className="md:hidden sticky top-0 z-40 bg-cream/90 backdrop-blur border-b border-[#EFEAE2] flex items-center gap-3 px-4 h-14">
        <button aria-label="菜单" onClick={() => setSidebarOpen(true)} className="p-2 -ml-2">
          <Menu size={24} strokeWidth={1.8} />
        </button>
        <span className="font-bold text-ink">{title}</span>
      </header>

      <div className="flex">
        {/* 桌面端固定侧边栏 */}
        <aside className="hidden md:block w-56 shrink-0 border-r border-[#EFEAE2] bg-white/60 min-h-screen sticky top-0">
          <div className="px-5 pt-6 pb-2 font-bold text-lg text-ink">🌸 {title}</div>
          {sidebar}
        </aside>

        {/* 移动端抽屉 */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
            <aside className="absolute left-0 top-0 bottom-0 w-64 bg-cream shadow-soft overflow-y-auto">
              <div className="flex items-center justify-between px-4 pt-4">
                <span className="font-bold text-ink">{title}</span>
                <button aria-label="关闭" onClick={() => setSidebarOpen(false)} className="p-2"><X size={22} /></button>
              </div>
              {sidebar}
            </aside>
          </div>
        )}

        <main className="flex-1 min-w-0 px-4 md:px-8 py-5 pb-24" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}>
          <Routes>
            <Route path="/" element={<Today name={name} />} />
            <Route path="/quiz" element={<QuizCenter />} />
            <Route path="/answer" element={<Answer />} />
            <Route path="/wrong" element={<WrongBook />} />
            <Route path="/outline" element={<Outline />} />
            <Route path="/import" element={<ImportPage />} />
            <Route path="/heatmap" element={<Heatmap />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/plan" element={<Plan />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>

      {/* 首次打开：输入姓名 */}
      <Modal open={showNameModal} onClose={() => {}}>
        <h3 className="text-lg font-bold mb-2">👋 欢迎使用学习工作台</h3>
        <p className="text-sm text-sub mb-4">请告诉我你的名字，工作台将以你的名字命名。</p>
        <input
          autoFocus
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && saveName()}
          placeholder="输入姓名，如：小雨"
          className="w-full border border-[#E5DFD5] rounded-btn px-4 py-3 mb-4 focus:outline-none focus:border-lotus"
        />
        <button onClick={saveName} className="w-full bg-lotus text-white rounded-btn py-3 font-semibold active:opacity-80">
          开始使用
        </button>
      </Modal>

      {/* 每周一备份提醒 */}
      <Modal open={showBackup} onClose={() => setShowBackup(false)}>
        <h3 className="text-lg font-bold mb-2">💾 该导出备份了</h3>
        <p className="text-sm text-sub mb-4">数据仅存储在本机浏览器，清缓存会丢失。建议前往「设置」页导出 JSON 备份，防止数据丢失。</p>
        <button onClick={() => setShowBackup(false)} className="w-full bg-lotus text-white rounded-btn py-3 font-semibold">
          知道了
        </button>
      </Modal>
    </div>
  );
}

function getWeekNumber(d) {
  const start = new Date(d.getFullYear(), 0, 1);
  return Math.floor((d - start) / (7 * 86400000));
}
