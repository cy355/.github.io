import {
  BookOpen, CalendarDays, Flame, LayoutDashboard, LineChart,
  NotebookPen, PenLine, Settings as SettingsIcon, Upload
} from 'lucide-react';

export const NAV_ITEMS = [
  { path: '/', label: '今日工作台', icon: LayoutDashboard },
  { path: '/quiz', label: '刷题中心', icon: PenLine },
  { path: '/wrong', label: '错题本', icon: NotebookPen },
  { path: '/outline', label: '考点大纲', icon: BookOpen },
  { path: '/import', label: '题库导入', icon: Upload },
  { path: '/heatmap', label: '掌握度热力图', icon: Flame },
  { path: '/stats', label: '学习统计', icon: LineChart },
  { path: '/plan', label: '学习计划', icon: CalendarDays },
  { path: '/settings', label: '设置', icon: SettingsIcon }
];
