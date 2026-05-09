# ABDL Space 更新日志

## v5.1.3 — 2026-05-09

### ✨ 新功能
- **页面标题动态更新**：浏览器标签页标题随路由自动更新（如「论坛 — ABDL Space」）
- **术语 Wiki 复制按钮**：每个术语卡片新增「复制」按钮，一键复制术语名称和定义
- **排行榜骨架屏**：排行榜加载时使用骨架屏动画代替转圈加载，体验更流畅

### ♿ 无障碍改进
- **键盘焦点可见**：全局添加 `focus-visible` 样式，Tab 键导航时显示清晰的主题色焦点环

### 🔧 修复与优化
- **Sidebar 移动端**：遮罩层使用 opacity 过渡动画（替代 display:none），支持 Escape 键关闭
- **路由切换滚动**：新增 ScrollToTop 组件，导航到新页面时自动滚动到顶部
- **纸尿裤详情**：分享按钮移至标题行右侧，baby diaper 提示移到标签下方（布局更紧凑）
- **帖子详情**：作者行添加分享按钮
- **论坛加载更多**：「加载更多」按钮显示禁用态和加载动画
- **首页空状态**：筛选无结果时显示友好空状态和「清除所有筛选」按钮
- **API 修复**：`forumAPI.like` 调用签名修正为 `{ target_type, target_id }` 格式

### 📝 文件变更
- `App.jsx` — 新增 RouteTitles 映射 + ScrollToTop 组件
- `App.css` — 新增 focus-visible 键盘焦点样式
- `TermWiki.jsx` — 导入 useToast，卡片添加复制按钮
- `Rankings.jsx` — 导入 LoadingSkeleton，加载时显示 rank 骨架
- `LoadingSkeleton.jsx` — 新增 rank 类型骨架（圆形排名+文字行+分数）
- `Sidebar.jsx` — Escape 关闭 + 搜索后关闭移动侧栏
- `DiaperDetail.jsx` — 分享按钮 + 布局调整
- `PostDetail.jsx` — 分享按钮 + like API 修复
- `ForumFeed.jsx` — loadingMore 状态 + like API 修复
- `Home.jsx` — 空状态 + 清除筛选按钮

## v5.1.2 — 2026-05-09

### ✨ 新功能
- **滚动进度条**：页面顶部新增渐变色进度条，实时显示当前阅读进度
- **筛选标签可视化**：纸尿裤列表页激活筛选条件时，显示可点击清除的筛选标签
- **论坛发帖字符计数**：发帖框显示实时字符数，接近上限时颜色警告（黄→红）
- **密码显隐切换**：登录/注册页密码输入框新增 👁 显示/隐藏密码按钮
- **帖子详情空评论提示**：无评论时显示友好空状态，引导用户参与讨论
- **对比工具加载骨架**：纸尿裤列表加载时使用骨架屏代替空白

### 🎨 UI/UX 优化
- 深色模式下 `<select>` 下拉框使用 `color-scheme: dark`，自定义下拉箭头图标
- 深色模式下 checkbox/radio 使用主题色 accent-color
- 筛选标签使用主题色背景（蓝色），悬停高亮
- LoadingSkeleton 新增 `list` 类型骨架（复选框+文字行）

### 📝 文件变更
- `App.jsx` — 新增 ScrollProgress 组件
- `App.css` — 新增 `.scroll-progress`、`.filter-tag` 样式，深色模式 select/checkbox/radio 适配
- `Home.jsx` — 新增筛选标签栏（搜索词/品牌/尺码/排序）
- `ForumFeed.jsx` — 发帖框新增字符计数器
- `Login.jsx` / `Register.jsx` — 密码显隐切换按钮
- `PostDetail.jsx` — 空评论空状态提示
- `ComparePage.jsx` — 导入 LoadingSkeleton，列表加载时使用骨架屏
- `LoadingSkeleton.jsx` — 新增 list 类型骨架

## v5.1.1 — 2026-05-09

### 🐛 Bug 修复
- **Profile 深色模式修复**：使用感受标签的硬编码颜色（绿/红）替换为 CSS 变量 `--success-bg`/`--feeling-bg`，深色模式下正确显示

### ✨ 新功能
- **分享按钮 Toast 反馈**：论坛帖子点击分享后，弹出「链接已复制到剪贴板」提示
- **回到顶部按钮淡出动画**：按钮消失时播放流畅的 fadeOutDown 动画，不再突然消失
- **排行榜标签滑动指示器**：切换排行榜分类时，底部出现平滑滑动的下划线指示器
- **对比工具引导提示**：选择 2+ 款纸尿裤后，在未点击对比前显示友好引导文案

### 🎨 UI/UX 优化
- BackToTop 组件增加退出动画状态管理（exiting 状态 + CSS transition）
- Rankings 标签按钮动画更流畅（cubic-bezier 过渡）

### 📝 文件变更
- `Profile.jsx` — 感受标签颜色变量化
- `ForumFeed.jsx` — 集成 useToast，分享按钮添加反馈
- `BackToTop.jsx` — 新增淡出动画逻辑
- `Rankings.jsx` — 新增标签滑动指示器（useRef + indicatorStyle）
- `ComparePage.jsx` — 新增对比前引导提示
- `App.css` — 新增 fadeOutDown 关键帧、tab-indicator/tab-btn 样式

## v5.1.0 — 2026-05-09

### 🐛 Bug 修复
- **搜索功能修复**：URL 参数变化时正确触发筛选（searchParams 作为依赖项）；手柄搜索清空后导航触发搜索
- **对比工具修复**：compareAPI 接受数组参数（兼容旧 `{ids}` 格式）；修复后开始对比按钮正常运作
- **黑暗模式**：所有页面组件硬编码颜色替换为 CSS 变量，全面支持暗色主题切换
- **评级消息格式**：统一使用 FA 图标移除 emoji 作为状态指示器

### ✨ 新功能
- **主题切换按钮移至右上角**：悬浮圆形按钮，附旋转动画
- **所有 emoji 替换为 Font Awesome**：导航栏、侧边栏、首页、排行、论坛、帖子详情、通知、私信、管理后台等所有组件
- **用户头像在侧边栏显示**
- **搜索框回车后自动清空关键词**

### 🎨 UI/UX 优化
- 全面 CSS 变量化：新增 `--tag-bg`、`--badge-bg`、`--hero-bg`、`--hero-text` 等 20+ 语义化令牌
- 按钮涟漪效果改进
- 排行奖牌改为 Font Awesome 图标（金银铜着色）
- 卡片边框过渡、悬停高亮
- 消息气泡暗色适配
- 通知项暗色适配
- 空状态统一使用空状态组件

### 📝 文件变更
- 所有 `.jsx` 页面和组件 — 表情符号替换 + 深色模式适配
- `App.css` — 新增 20+ CSS 变量 + 暗色覆盖 + 浮动切换按钮样式
- `App.jsx` — 浮动主题切换按钮
- `Sidebar.jsx` — 移除主题 props，头像显示
- `api.js` — compareAPI 参数兼容性修复

---

## v5.0.0 — 2026-05-09
- 使用感受系统（-5 到 5 滑块）
- AI 推荐隐私权限弹窗
- 头像上传/编辑
- 深色模式
- 动画增强
