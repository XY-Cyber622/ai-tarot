# AI Tarot · Development Task List

> 版本：v1.0 · 状态：Sprint 计划稿
> 角色：Tech Lead
> 关联文档：[PRD.md](./PRD.md) · [TS_Architecture.md](./TS_Architecture.md) · [TS_Features.md](./TS_Features.md) · [UI_SPEC.md](./UI_SPEC.md) · [PROMPT_SPEC.md](./PROMPT_SPEC.md)
> 周期：3 Sprint / 1~2 周

---

## 总体规划

| Sprint | 主题 | 产出 | 可运行 | 任务数 | 工时 |
| --- | --- | --- | --- | --- | --- |
| **Sprint 1** | Foundation（基础设施）| 路由壳 + 类型 + 数据 + 工具 + 基础组件 | ✅ 空壳可路由 | 12 | ~7.5h |
| **Sprint 2** | Core Flow（核心流程）| Landing → Question → Spread → Shuffle → Draw | ✅ 抽牌闭环（无 AI）| 11 | ~10h |
| **Sprint 3** | AI + Result + History + Deploy | 完整 MVP 部署上线 | ✅ 完整产品 | 18 | ~15h |
| **合计** | — | — | — | **41** | **~32.5h** |

> 单任务时长：30~90 分钟。完成即可测试。

---

## 任务编号体系

```
T{Sprint 编号}.{子任务}
├── T1.1 = Sprint 1 第 1 个任务
├── T2.5 = Sprint 2 第 5 个任务
└── T3.10 = Sprint 3 第 10 个任务
```

---

# Sprint 1 · Foundation（基础设施）

## Sprint 1 目标

- ✅ 项目脚手架跑起来（`npm run dev` 可访问）
- ✅ 7 个路由可访问（占位页）
- ✅ 22 张大阿尔卡纳数据可读
- ✅ SessionContext 状态可共享
- ✅ 基础组件（Button / Background / Layout）可用

## Sprint 1 Definition of Done

- [ ] `npm run dev` 启动后无错误
- [ ] 可访问 7 个路由
- [ ] `tsc --noEmit` 通过
- [ ] 设计 Token 全部生效
- [ ] 22 张牌数据可在 DevTools 看到

---

### T1.1 · 初始化 Vite + React + TS 项目

| 维度 | 内容 |
| --- | --- |
| **目标** | 创建 Vite + React + TypeScript 项目骨架 |
| **涉及文件** | `package.json` · `vite.config.ts` · `tsconfig.json` · `tsconfig.node.json` · `index.html` · `src/main.tsx` · `src/App.tsx` · `.gitignore` |
| **完成标准** | `npm install` 成功；`npm run dev` 启动并显示 "AI Tarot" |
| **验收标准** | 浏览器访问 `http://localhost:5173` 看到占位页；无 console error |
| **预计时间** | 30 min |

#### 执行步骤
1. `npm create vite@latest . -- --template react-ts`
2. 安装路由：`npm i react-router-dom`
3. 修改 `App.tsx` 显示 "AI Tarot"
4. 验证 `npm run dev`

---

### T1.2 · 配置路径别名与 TS 严格模式

| 维度 | 内容 |
| --- | --- |
| **目标** | 配置 `@/*` 路径别名 + 启用 strict 模式 |
| **涉及文件** | `tsconfig.json` · `vite.config.ts` |
| **完成标准** | `import Button from '@/components/Button'` 可解析 |
| **验收标准** | `tsc --noEmit` 通过；`@/types/tarot` 可正常导入 |
| **预计时间** | 30 min |

#### 关键配置
```ts
// tsconfig.json
"baseUrl": ".",
"paths": { "@/*": ["src/*"] }
```

---

### T1.3 · 全局样式与 Design Token

| 维度 | 内容 |
| --- | --- |
| **目标** | 实现 UI_SPEC 附录 A 的所有 Token |
| **涉及文件** | `src/styles/reset.css` · `src/styles/variables.css` · `src/styles/global.css` · `src/styles/animations.css` |
| **完成标准** | 所有 CSS Variables 可在任意位置使用 |
| **验收标准** | 在任一组件 `var(--gold-primary)` 可生效；reset 生效 |
| **预计时间** | 60 min |

#### Token 清单
- 颜色：15 个 · 字号：12 个 · 间距：10 个 · 圆角：5 个 · 时长：5 个 · 缓动：4 个

---

### T1.4 · 配置 React Router

| 维度 | 内容 |
| --- | --- |
| **目标** | 配置 9 个路由（7 主 + 1 详情 + 1 404）+ 懒加载 |
| **涉及文件** | `src/router.tsx` · `src/pages/{Landing,Question,Spread,Shuffle,Draw,Result,History,HistoryDetail,NotFound}/index.tsx` |
| **完成标准** | 9 个页面可访问并显示占位文字 |
| **验收标准** | 浏览器地址栏输入各路径均能跳转；占位页有 Page Name |
| **预计时间** | 45 min |

#### 路由表
| Path | Page |
| --- | --- |
| `/` | Landing |
| `/question` | Question |
| `/spread` | Spread |
| `/shuffle` | Shuffle |
| `/draw` | Draw |
| `/result` | Result |
| `/history` | History |
| `/history/:id` | HistoryDetail |
| `*` | NotFound |

---

### T1.5 · TypeScript 类型定义

| 维度 | 内容 |
| --- | --- |
| **目标** | 定义所有 TS 接口（来自 TS_Features §2）|
| **涉及文件** | `src/types/tarot.ts` · `src/types/spread.ts` · `src/types/ai.ts` · `src/types/index.ts` |
| **完成标准** | 14 个 Interface 定义完整 |
| **验收标准** | `tsc --noEmit` 通过；其他文件可 `import type` |
| **预计时间** | 30 min |

---

### T1.6 · 22 张大阿尔卡纳数据

| 维度 | 内容 |
| --- | --- |
| **目标** | 落地 PRD 附录 F 的 22 张牌数据 |
| **涉及文件** | `src/data/major-arcana.ts` |
| **完成标准** | 22 张牌全部录入完整字段 |
| **验收标准** | `MAJOR_ARCANA.length === 22`；`getCardById('major-00')` 返回 The Fool |
| **预计时间** | 30 min |

#### 字段必填
id / name / nameZh / arcana / number / keywords / reversedKeywords / uprightMeaning / reversedMeaning / uprightAdvice / reversedAdvice / symbolism / element / numerology / imageUrl

---

### T1.7 · 牌阵数据

| 维度 | 内容 |
| --- | --- |
| **目标** | 定义 Three Card 牌阵（启用）+ Celtic Cross（禁用）|
| **涉及文件** | `src/data/spreads.ts` |
| **完成标准** | 2 个牌阵定义完整 |
| **验收标准** | `SPREADS[0].cardCount === 3`；`SPREADS[1].enabled === false` |
| **预计时间** | 20 min |

---

### T1.8 · 工具函数：洗牌与抽牌

| 维度 | 内容 |
| --- | --- |
| **目标** | 实现 Fisher-Yates 洗牌 + drawCards |
| **涉及文件** | `src/utils/shuffle.ts` · `src/utils/tarot.ts` |
| **完成标准** | `drawCards(3)` 返回 3 张 DrawnCard |
| **验收标准** | 调用 1000 次 `drawCards(3)`，逆位比例 25%~35%；无重复 ID |
| **预计时间** | 30 min |

#### 函数
- `shuffle<T>(arr)` - Fisher-Yates
- `drawCards(count, reversedRate?)` - 返回 DrawnCard[]
- `getCardById(id)` - 查询单张牌

---

### T1.9 · LocalStorage 工具

| 维度 | 内容 |
| --- | --- |
| **目标** | 类型安全的 storage 封装 |
| **涉及文件** | `src/utils/storage.ts` |
| **完成标准** | `get<T>()` / `set<T>()` / `remove()` 工作 |
| **验收标准** | `storage.set('test', { a: 1 })` 后刷新页面，`storage.get('test')` 仍能读到 |
| **预计时间** | 30 min |

---

### T1.10 · 基础 UI 组件：Button / Background / Layout

| 维度 | 内容 |
| --- | --- |
| **目标** | 实现 3 个全局基础组件 |
| **涉及文件** | `src/components/Button/` · `src/components/Background/` · `src/components/Layout/` |
| **完成标准** | 3 个组件可独立使用 |
| **验收标准** | Button 支持 5 种 variant；Background 含星空粒子；Layout 有顶部/内容/底部 |
| **预计时间** | 75 min |

---

### T1.11 · SessionContext

| 维度 | 内容 |
| --- | --- |
| **目标** | 全局会话状态管理 |
| **涉及文件** | `src/context/SessionContext.tsx` |
| **完成标准** | `useSession()` 可读写 question/spread/drawnCards/reading |
| **验收标准** | 在两个不同页面修改 Session，另一页面能读到最新值 |
| **预计时间** | 60 min |

#### 关键能力
- useReducer 统一管理
- reset() 方法
- useMemo 缓存 value

---

### T1.12 · 自定义 Hooks

| 维度 | 内容 |
| --- | --- |
| **目标** | useLocalStorage + useSession |
| **涉及文件** | `src/hooks/useLocalStorage.ts` · `src/hooks/useSession.ts` |
| **完成标准** | 两个 Hook 可独立使用 |
| **验收标准** | `useLocalStorage('test', 'default')` 双向绑定；`useSession()` 返回完整 context |
| **预计时间** | 30 min |

---

## Sprint 1 检查清单

- [ ] T1.1 ~ T1.12 全部完成
- [ ] `npm run dev` 无错误
- [ ] `tsc --noEmit` 通过
- [ ] 9 个路由占位页可访问
- [ ] 控制台 0 error

**Sprint 1 完成后可演示**：项目骨架、路由、基础数据、样式 Token。

---

# Sprint 2 · Core Flow（核心流程）

## Sprint 2 目标

- ✅ 5 个核心页面可正常浏览
- ✅ 抽牌闭环跑通（无 AI）
- ✅ 关键动画就位（Shuffle 切牌 + Draw 翻牌）
- ✅ Session 状态在 5 个页面间正确流转

## Sprint 2 Definition of Done

- [ ] Landing → Question → Spread → Shuffle → Draw 全流程跑通
- [ ] 抽到的 3 张牌数据正确（牌面 + 位置 + 逆位）
- [ ] Shuffle 动画时长 ≥ 2s
- [ ] Draw 翻牌 3D 效果正确
- [ ] 刷新 Draw 页不会丢失已抽牌
- [ ] Result 页占位（先用 mock 数据）

---

### T2.1 · Landing 页面 · 静态结构

| 维度 | 内容 |
| --- | --- |
| **目标** | 实现 Landing 页面 UI（不含最终动效）|
| **涉及文件** | `src/pages/Landing/index.tsx` · `src/pages/Landing/Landing.module.css` · `src/components/Logo/` |
| **完成标准** | 页面包含 Logo / 标题 / 副标题 / 两个 CTA |
| **验收标准** | 视觉与 UI_SPEC §15.1 一致；点击 "Start" 跳转到 /question |
| **预计时间** | 60 min |

---

### T2.2 · Landing 页面 · 动画

| 维度 | 内容 |
| --- | --- |
| **目标** | 加上 Logo 旋转 / 文字淡入 / 星光闪烁 |
| **涉及文件** | `src/pages/Landing/Landing.module.css` |
| **完成标准** | 首次加载有 3 种以上动画 |
| **验收标准** | Logo 缓慢呼吸（3~4s 一周期）；标题淡入 ≤ 1.5s；星空闪烁 |
| **预计时间** | 45 min |

---

### T2.3 · Question 页面 · 输入 UI

| 维度 | 内容 |
| --- | --- |
| **目标** | 实现问题输入框 + 字符计数 |
| **涉及文件** | `src/pages/Question/Question.tsx` · `src/components/QuestionInput/` |
| **完成标准** | textarea + 计数器 + 提交按钮 |
| **验收标准** | 字符数实时更新；超过 200 字禁用；按钮在空内容时禁用 |
| **预计时间** | 45 min |

---

### T2.4 · Question 页面 · 草稿 + 校验

| 维度 | 内容 |
| --- | --- |
| **目标** | 加入 LocalStorage 草稿保存 + 表单校验 |
| **涉及文件** | `src/pages/Question/` · `src/utils/storage.ts` |
| **完成标准** | 输入时自动保存草稿，刷新可恢复 |
| **验收标准** | 输入 50 字 → 刷新 → 仍在；进入 Spread 后清空草稿 |
| **预计时间** | 45 min |

---

### T2.5 · Spread 页面 · 牌阵选择

| 维度 | 内容 |
| --- | --- |
| **目标** | 展示牌阵卡片 + 选择交互 |
| **涉及文件** | `src/pages/Spread/` · `src/components/SpreadCard/` |
| **完成标准** | Three Card 可点；Celtic Cross 显示 "Coming Soon" |
| **验收标准** | 点击 Three Card 高亮 + 跳转到 /shuffle；Context 中 spread 已更新 |
| **预计时间** | 60 min |

---

### T2.6 · Shuffle 页面 · 静态布局

| 维度 | 内容 |
| --- | --- |
| **目标** | Shuffle 页面骨架 + 标题 |
| **涉及文件** | `src/pages/Shuffle/index.tsx` · `src/pages/Shuffle/Shuffle.module.css` |
| **完成标准** | 页面显示标题 + 提示文案 + 占位牌 |
| **验收标准** | 视觉与 UI_SPEC §15.5 一致；进入页面后 2s 自动跳到 /draw |
| **预计时间** | 30 min |

---

### T2.7 · Shuffle 页面 · 切牌动画

| 维度 | 内容 |
| --- | --- |
| **目标** | 实现 22 张牌叠放 + 随机旋转 + 切换动画 |
| **涉及文件** | `src/components/Deck/` · `src/pages/Shuffle/components/ShuffleAnimation.tsx` |
| **完成标准** | 牌堆 22 张，3D 叠放 + 顶部牌随机旋转 -8°~+8° |
| **验收标准** | 切牌动画 2.5s；动画结束后导航到 /draw |
| **预计时间** | 90 min |

#### 关键参数
- 持续时间：2500ms
- 切换次数：3~4 次
- 缓动：easeInOutCubic
- 牌间距：translateY(-1px * index)

---

### T2.8 · Tarot Card 组件

| 维度 | 内容 |
| --- | --- |
| **目标** | 实现可复用的 Card 组件，支持正位/逆位 |
| **涉及文件** | `src/components/Card/` · `src/components/Card/Card.module.css` |
| **完成标准** | 支持正/逆位切换 + 缩放 + 边框 |
| **验收标准** | `<Card card={c} reversed={true} />` 显示 180° 旋转的牌面 |
| **预计时间** | 60 min |

---

### T2.9 · Deck 组件

| 维度 | 内容 |
| --- | --- |
| **目标** | 多张牌的视觉叠放 |
| **涉及文件** | `src/components/Deck/` |
| **完成标准** | `<Deck count={22} />` 渲染 22 张牌叠放 |
| **验收标准** | 顶部牌微旋转；点击/悬浮有反馈 |
| **预计时间** | 30 min |

---

### T2.10 · Draw 页面 · 牌堆 + 进度

| 维度 | 内容 |
| --- | --- |
| **目标** | Draw 页面静态版 + 进度条 |
| **涉及文件** | `src/pages/Draw/Draw.tsx` · `src/components/Progress/` |
| **完成标准** | 显示牌堆 + 进度（0/3, 1/3, ...）|
| **验收标准** | 视觉与 UI_SPEC §15.6 一致；进度条随状态变化 |
| **预计时间** | 45 min |

---

### T2.11 · Draw 页面 · 翻牌 + 状态同步

| 维度 | 内容 |
| --- | --- |
| **目标** | 点击牌堆抽牌 + 3D 翻牌 + 状态同步到 Session |
| **涉及文件** | `src/pages/Draw/components/CardStack.tsx` · `src/pages/Draw/hooks/useDrawFlow.ts` |
| **完成标准** | 点 3 次牌堆 → 翻 3 张牌 → 翻完自动跳到 /result |
| **验收标准** | Session.drawnCards.length === 3；DevTools 看到每张牌的正/逆位 |
| **预计时间** | 90 min |

#### 关键流程
```
0/3: 显示牌堆，可点击
1/3: 第一张牌翻面 + 缩放
2/3: 第二张牌翻面
3/3: 第三张牌翻面 + 800ms 延迟 → 跳转 /result（mock）
```

---

## Sprint 2 检查清单

- [ ] T2.1 ~ T2.11 全部完成
- [ ] 全流程无错误跑通
- [ ] DevTools 看到 3 张正确抽到的牌
- [ ] Shuffle 动画流畅（≥ 30fps）
- [ ] Draw 翻牌流畅
- [ ] Result 页显示 mock 解读

**Sprint 2 完成后可演示**：完整抽牌体验，含 Shuffle 仪式感 + 翻牌揭晓感。

---

# Sprint 3 · AI + Result + History + Deploy

## Sprint 3 目标

- ✅ AI 解读集成
- ✅ Result 页完整呈现
- ✅ History 页可查询/查看
- ✅ 错误兜底完善
- ✅ 部署到 GitHub Pages

## Sprint 3 Definition of Done

- [ ] AI 调用稳定（JSON 解析成功率 ≥ 99%）
- [ ] Result 页 6 块内容齐全
- [ ] History 增删查正常
- [ ] AI 失败时使用兜底
- [ ] 部署可访问
- [ ] 移动端 375px 可正常浏览

---

### T3.1 · HTTP 客户端

| 维度 | 内容 |
| --- | --- |
| **目标** | Axios 实例 + 拦截器 |
| **涉及文件** | `src/services/http.ts` |
| **完成标准** | `http.post(url, data)` 可用 |
| **验收标准** | 超时 30s；401 抛错；5xx 抛错 |
| **预计时间** | 30 min |

---

### T3.2 · Prompt 构造器

| 维度 | 内容 |
| --- | --- |
| **目标** | 实现 System + User Prompt 拼接 |
| **涉及文件** | `src/utils/prompt.ts` · `src/data/prompts/system-v1.0.0.ts` |
| **完成标准** | `buildSystemPrompt()` / `buildUserPrompt(req)` 工作 |
| **验收标准** | 输出与 PROMPT_SPEC §1 / §2 完全一致 |
| **预计时间** | 60 min |

---

### T3.3 · AI Service · 解读 API

| 维度 | 内容 |
| --- | --- |
| **目标** | 实现 `callReading()`，含校验 + 重试 |
| **涉及文件** | `src/services/ai.ts` · `src/utils/validator.ts` |
| **完成标准** | `callReading(req)` 返回 `AIResponse<AIReadingOutput>` |
| **验收标准** | 成功路径返回结构化数据；Schema 失败重试 1 次 |
| **预计时间** | 90 min |

---

### T3.4 · useReading Hook

| 维度 | 内容 |
| --- | --- |
| **目标** | 封装 loading / error / data 状态 |
| **涉及文件** | `src/hooks/useReading.ts` |
| **完成标准** | `const { data, loading, error, refetch } = useReading(req)` |
| **验收标准** | loading 期间返回 true；error 抛出；data 解析后为对象 |
| **预计时间** | 45 min |

---

### T3.5 · Loading 组件

| 维度 | 内容 |
| --- | --- |
| **目标** | 全屏 Loading（旋转 Sigil + 文案）|
| **涉及文件** | `src/components/Loading/` |
| **完成标准** | SVG 旋转 + 文案循环 |
| **验收标准** | 视觉与 UI_SPEC §9 一致；3 句文案轮播（解读中 / 接收能量 / 即将揭晓）|
| **预计时间** | 30 min |

---

### T3.6 · Draw 页 · AI 集成

| 维度 | 内容 |
| --- | --- |
| **目标** | 翻完 3 张牌后调用 AI + 跳到 Result |
| **涉及文件** | `src/pages/Draw/Draw.tsx` |
| **完成标准** | 3 张牌翻完 → 显示 Loading → 跳到 Result |
| **验收标准** | Loading 时不闪屏；Result 页有数据 |
| **预计时间** | 60 min |

---

### T3.7 · 打字机 Hook

| 维度 | 内容 |
| --- | --- |
| **目标** | 实现 useTypewriter |
| **涉及文件** | `src/hooks/useTypewriter.ts` |
| **完成标准** | 文字逐字显示 |
| **验收标准** | 30ms/字；返回当前显示文本 |
| **预计时间** | 30 min |

---

### T3.8 · Result 页 · 整体解读

| 维度 | 内容 |
| --- | --- |
| **目标** | 展示 overview + perCard + advice |
| **涉及文件** | `src/pages/Result/Result.tsx` · `src/pages/Result/components/ReadingOverview.tsx` · `src/pages/Result/components/PerCardReading.tsx` |
| **完成标准** | 3 大块内容都渲染 |
| **验收标准** | 视觉与 UI_SPEC §15.7 一致；打字机效果 |
| **预计时间** | 90 min |

---

### T3.9 · Result 页 · 幸运元素

| 维度 | 内容 |
| --- | --- |
| **目标** | 显示幸运颜色 / 数字 / 寄语 |
| **涉及文件** | `src/pages/Result/components/LuckyCard.tsx` |
| **完成标准** | 3 个 LuckyItem 卡片 |
| **验收标准** | 颜色 swatch + 含义；数字 + 含义；寄语高亮 |
| **预计时间** | 45 min |

---

### T3.10 · Result 页 · 保存 + 行为

| 维度 | 内容 |
| --- | --- |
| **目标** | 自动保存到 LocalStorage + 4 个行为按钮 |
| **涉及文件** | `src/pages/Result/Result.tsx` · `src/utils/storage.ts` |
| **完成标准** | 进入 Result 自动保存；"再抽一次"重置；"看历史"跳 /history |
| **验收标准** | 刷新 Result 页数据仍在；点 "再抽一次" 回到 Landing |
| **预计时间** | 45 min |

---

### T3.11 · History 页 · 列表

| 维度 | 内容 |
| --- | --- |
| **目标** | 显示所有历史记录 |
| **涉及文件** | `src/pages/History/History.tsx` · `src/components/HistoryCard/` |
| **完成标准** | 卡片列表 + 缩略图 + 问题摘要 + 时间 |
| **验收标准** | 视觉与 UI_SPEC §15.8 一致；空态有插图 |
| **预计时间** | 60 min |

---

### T3.12 · History 页 · 搜索 + 筛选

| 维度 | 内容 |
| --- | --- |
| **目标** | Tab 筛选（全部/本周/本月）+ 搜索 |
| **涉及文件** | `src/pages/History/` |
| **完成标准** | Tab 切换有效；搜索过滤有效 |
| **验收标准** | 输入关键词过滤；Tab 切换渲染数量变化 |
| **预计时间** | 60 min |

---

### T3.13 · History 详情页

| 维度 | 内容 |
| --- | --- |
| **目标** | 显示完整历史记录 |
| **涉及文件** | `src/pages/HistoryDetail/` |
| **完成标准** | 完整阅读体验（复用 Result 布局）|
| **验收标准** | 点击 /history 卡片跳详情；URL 含 id |
| **预计时间** | 45 min |

---

### T3.14 · 兜底文案 + 错误处理

| 维度 | 内容 |
| --- | --- |
| **目标** | 实现 fallback + 错误 UI |
| **涉及文件** | `src/utils/fallback.ts` · `src/components/ErrorState/` |
| **完成标准** | AI 失败时显示兜底 + 重试按钮 |
| **验收标准** | 模拟 500 错误 → 仍能显示解读（标记 isFallback）|
| **预计时间** | 60 min |

---

### T3.15 · 移动端响应式

| 维度 | 内容 |
| --- | --- |
| **目标** | 适配 375px 移动端 |
| **涉及文件** | 各页面的 `.module.css` |
| **完成标准** | iPhone SE 尺寸下无横向滚动 |
| **验收标准** | 触摸目标 ≥ 44px；字号 ≥ 14px；牌面正常显示 |
| **预计时间** | 75 min |

---

### T3.16 · 页面切换动效

| 维度 | 内容 |
| --- | --- |
| **目标** | 加入路由切换淡入 + 滚动到顶 |
| **涉及文件** | `src/components/PageTransition.tsx` |
| **完成标准** | 切页时淡入 0.3s |
| **验收标准** | 视觉平滑；不影响功能 |
| **预计时间** | 30 min |

---

### T3.17 · 性能优化

| 维度 | 内容 |
| --- | --- |
| **目标** | 图片懒加载 + 路由懒加载 + 关键 CSS 内联 |
| **涉及文件** | `src/utils/lazyLoad.ts` · `index.html` |
| **完成标准** | 路由级代码分割生效 |
| **验收标准** | Network 面板看到独立 chunk；首屏 < 1.5s |
| **预计时间** | 45 min |

---

### T3.18 · GitHub Pages 部署

| 维度 | 内容 |
| --- | --- |
| **目标** | 部署到 GitHub Pages |
| **涉及文件** | `vite.config.ts`（base） · `package.json`（deploy 脚本） · `src/404.html` |
| **完成标准** | `npm run deploy` 成功 |
| **验收标准** | 访问 `https://<user>.github.io/ai-tarot` 看到完整应用 |
| **预计时间** | 45 min |

---

## Sprint 3 检查清单

- [ ] T3.1 ~ T3.18 全部完成
- [ ] AI 调用成功率 ≥ 99%
- [ ] 全流程移动端可正常浏览
- [ ] 部署 URL 可访问
- [ ] Lighthouse 性能分 ≥ 80
- [ ] 关键路径 E2E 测试通过

**Sprint 3 完成后可演示**：完整可用的 AI Tarot MVP，可在线访问。

---

# 附录 A · 任务总览

## 按 Sprint 汇总

| Sprint | 任务数 | 总工时 | 主要交付 |
| --- | --- | --- | --- |
| Sprint 1 | 12 | ~7.5h | 项目骨架 + 类型 + 数据 + 工具 + 基础组件 |
| Sprint 2 | 11 | ~10h | Landing/Question/Spread/Shuffle/Draw 完整流程 |
| Sprint 3 | 18 | ~15h | AI 集成 + Result + History + 部署 |

## 关键路径（Critical Path）

```
T1.1 → T1.4 → T1.5 → T1.6 → T2.3 → T2.5 → T2.7 → T2.8 → T2.11 → T3.3 → T3.6 → T3.8 → T3.10 → T3.18
```

> 此路径上的任务不能并行；其他任务可适当并行。

## 可并行任务示例

| 主任务 | 可并行的子任务 |
| --- | --- |
| T1.1 项目初始化 | — |
| T1.5 类型 | 与 T1.6/T1.7/T1.8/T1.9 数据/工具并行 |
| T2.1 Landing 静态 | 与 T2.3 Question UI 并行 |
| T2.8 Card | 与 T2.9 Deck 并行 |
| T3.1 HTTP | 与 T3.2 Prompt 构造器并行 |
| T3.5 Loading | 与 T3.7 useTypewriter 并行 |
| T3.8 Result 整体 | 与 T3.9 Result 幸运元素并行 |
| T3.11 History 列表 | 与 T3.13 History 详情并行 |
| T3.15 移动端 | 与 T3.16 页面动效并行 |

## 风险与备选方案

| 任务 | 风险 | 备选方案 |
| --- | --- | --- |
| T2.7 Shuffle 动画 | 性能问题 | 减少到 12 张牌 |
| T3.3 AI 集成 | API 限流 | 使用本地 fallback |
| T3.6 AI 集成 | 速度慢 | 显示进度文案 |
| T3.18 部署 | base path 错误 | 改用根目录 |
| T1.10 Background | 粒子卡顿 | 减少到 30 个 |

## 每周节奏建议

| 周 | 任务 | 建议完成点 |
| --- | --- | --- |
| Day 1-2 | Sprint 1 全部 | T1.12 |
| Day 3-4 | Sprint 2 全部 | T2.11 |
| Day 5-7 | Sprint 3 全部 | T3.18 |

---

# 附录 B · 验证脚本（快速自测）

```bash
# Sprint 1 完成后
npm run dev
# 浏览 9 个路由
# DevTools Console: console.log(MAJOR_ARCANA.length) === 22

# Sprint 2 完成后
# 完整跑：Landing → Question → Spread → Shuffle → Draw
# DevTools: Session.drawnCards.length === 3

# Sprint 3 完成后
npm run build
npm run deploy
# 访问部署 URL
```

---

# 附录 C · 六份文档体系

```
PRD.md              产品需求（Why + What）
TS_Architecture.md  项目架构（How to build）
TS_Features.md      功能设计（How to implement）
UI_SPEC.md          视觉规范（How to look）
PROMPT_SPEC.md      Prompt 工程（How AI answers）
TASK_LIST.md        开发任务（When + Who + How long）  ← 本文档
```

---

> **文档结束**
> 本 Task List 是 AI Tarot 项目的**执行手册**。
> 严格按 Sprint 推进，每个 Task 完成后立即验证。
> 关联文档：[PRD.md](./PRD.md) · [TS_Architecture.md](./TS_Architecture.md) · [TS_Features.md](./TS_Features.md) · [UI_SPEC.md](./UI_SPEC.md) · [PROMPT_SPEC.md](./PROMPT_SPEC.md)
