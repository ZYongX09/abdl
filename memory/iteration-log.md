# ABDL Frontend Iteration Log

## Iteration #1 — 2026-05-14 11:26
- **类型:** 代码优化 / 工具函数提取
- **内容:** 将 `timeAgo` 函数从 4 个文件（NotificationsPage、MessagesPage、PostDetail、ForumFeed）中提取到共享工具文件 `src/utils.js`
- **变更文件:**
  - 新建 `src/utils.js` — 共享 `timeAgo` 函数
  - `src/pages/NotificationsPage.jsx` — 移除内联 `timeAgo`，改为 import
  - `src/pages/MessagesPage.jsx` — 同上
  - `src/pages/PostDetail.jsx` — 同上
  - `src/pages/ForumFeed.jsx` — 同上
- **结果:** ✅ 构建成功，JS 包体积减少约 700B（330.81 KB → 330.12 KB），模块数 62 → 63
- **影响:** 消除代码重复，统一时间格式化逻辑，便于后续维护
