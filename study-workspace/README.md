# XXX的学习工作台（个人学习工作台）

高中生个人学习工作台：刷题、错题本、间隔重复复习、掌握度热力图、学习统计与计划。

**技术栈**：React 18 + Vite 5 + Tailwind CSS 3 + vite-plugin-pwa（PWA）+ recharts（图表）+ lucide-react（图标）+ tesseract.js（图片 OCR）。

**数据存储**：全部存储在浏览器 localStorage（key 前缀 `wb_study_`），无后端、无需登录。首次打开预置五科题库与示例学习数据。

## 功能一览（9 个页面）

| 页面 | 功能 |
| --- | --- |
| 今日工作台 | 倒计时（2027-05-05 等级考 / 2027-06-07 秋考）、五科进度环、今日待复习、打卡天数 |
| 刷题中心 | 科目/考点树选择、出题数量（3/6/10/15/20）、到期错题优先、题量不足自动补充 |
| 答题页 | 选择题即点即判、填空题模糊匹配、解答题自评、听力播放器、答错显示解析并入错题本、轮末重做 |
| 错题本 | 科目/考点/状态筛选、重做、移除（二次确认，标记已掌握） |
| 考点大纲 | 按上海高考考纲组织的五科考点树 + 掌握度圆点 |
| 题库导入 | 粘贴文本 / CSV·JSON 文件 / 图片 OCR（tesseract.js，chi_sim+eng，长边压缩 1500px）/ 手动录入 |
| 掌握度热力图 | 考点 × 科目热力表格，点击查看详情 |
| 学习统计 | 四统计卡 + 14 天折线图 + 各科正确率柱状图 + 题型饼图 |
| 学习计划 | 月历打卡、每日目标、连续/最长打卡、本周报告 |

## 间隔重复算法

- 做对：0 → 1（+7 天）→ 2（+14 天）→ 3（+28 天）→ 4（已掌握，不再出现）
- 做错：重置为第 1 轮（+7 天），立即加入错题本，本轮末尾自动重做一次
- `nextReviewDate ≤ 今天` 的题进入「今日待复习」；过期超 7 天标记 ⚠️ 已过期

## 本地开发

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # 产出 dist/
```

## 部署到 Vercel（免费版，生成 .vercel.app HTTPS 链接）

1. 将本项目推送到 GitHub 仓库：
   ```bash
   git init && git add -A && git commit -m "init: 学习工作台"
   git remote add origin https://github.com/<你的用户名>/study-workspace.git
   git push -u origin main
   ```
2. 打开 [vercel.com](https://vercel.com) → **Add New → Project → Import** 该仓库。
3. Framework Preset 会自动识别为 **Vite**，无需修改构建配置（`npm run build` → `dist`）。
4. （可选，IMA 题库同步）在 **Settings → Environment Variables** 添加：
   - `IMA_CLIENT_ID`
   - `IMA_API_KEY`
   （从 https://ima.qq.com/agent-interface 获取）
5. 点击 **Deploy**，等待 1~2 分钟。
6. 部署完成后获得 `https://<项目名>.vercel.app` 公开 HTTPS 链接。

> `vercel.json` 已配置 `sw.js` 的 `Cache-Control: max-age=0, must-revalidate`，保证 Service Worker 正确更新；SPA 路由 rewrite 已内置。

## 手机端「添加到主屏幕」（PWA）

1. 手机浏览器打开部署链接。
2. **iOS（Safari）**：点分享按钮 → 「添加到主屏幕」。已内置 `apple-mobile-web-app-capable` / `apple-mobile-web-app-status-bar-style` / `apple-mobile-web-app-title` meta，添加后以独立窗口（无地址栏）打开。
3. **Android（Chrome）**：菜单 → 「添加到主屏幕 / 安装应用」。

## 数据安全

- 数据仅存储在本机浏览器 localStorage，清缓存会丢失。
- 「设置」页支持：导出 JSON 备份 / 导入恢复 / 重置（均二次确认）。
- 默认每周一打开时提醒导出备份（可在设置关闭）。
