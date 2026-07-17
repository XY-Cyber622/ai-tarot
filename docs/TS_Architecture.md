# AI Tarot · Technical Specification — Project Architecture

> 版本：v1.0 · 状态：架构评审稿
> 角色：Frontend Architect / Tech Lead
> 适用：1~2 周 Vibe Coding 学习项目
> 关联文档：[PRD.md](./PRD.md)

---

## 1. 技术目标

### 1.1 总目标
构建一个**简洁、易维护、可扩展**的 React 单页应用，**1~2 周内可交付**，并能在 GitHub Pages 静态部署。

### 1.2 具体目标
| 维度 | 目标 | 衡量标准 |
| --- | --- | --- |
| **简洁性** | 0 过度设计 | 不引入 Redux/Zustand/SSR/Micro-frontend |
| **可读性** | 新人 30 分钟看懂结构 | 目录扁平、命名一致、模块边界清晰 |
| **可维护性** | 单文件 ≤ 200 行 | 组件、逻辑、样式就近组织 |
| **可扩展性** | 支持 78 张 / 多牌阵 / 登录 | 关键扩展点预留抽象、不硬编码 |
| **开发体验** | Vibe Coding 友好 | TypeScript 强类型 + 路径别名 + 快速 HMR |
| **性能** | 首屏 ≤ 2s | 路由懒加载、图片 WebP、骨架屏 |
| **可部署** | 一键 GitHub Pages | `gh-pages` 自动发布，无需后端 |

### 1.3 非目标
- ❌ 不做 SSR / Next.js
- ❌ 不引入状态库（Redux / Zustand / Recoil）
- ❌ 不引入 UI 组件库（Ant Design / MUI）
- ❌ 不引入测试框架（Jest / Vitest）—— 留待后续版本
- ❌ 不引入后端服务

---

## 2. 技术栈说明

### 2.1 选型一览

| 类别 | 选型 | 版本建议 | 替代方案 |
| --- | --- | --- | --- |
| 框架 | React | 18.x | — |
| 构建 | Vite | 5.x | CRA（已弃用） |
| 语言 | TypeScript | 5.x | JS（不推荐） |
| 路由 | React Router | 6.x | TanStack Router |
| 状态 | Context API + useState | — | Zustand |
| HTTP | Axios | 1.x | fetch |
| 持久化 | LocalStorage | 原生 | IndexedDB（杀鸡用牛刀） |
| 样式 | CSS Modules + CSS Variables | — | Tailwind / styled-components |
| 动画 | CSS Animation + Framer Motion（可选） | 11.x | GSAP |
| 部署 | GitHub Pages + gh-pages | — | Vercel / Netlify |

### 2.2 选型理由

#### ✅ React 18
- 生态最成熟，Vibe Coding 时 AI 输出最稳定。
- Concurrent Mode 提升动画体验。
- 团队/学习者基础好。

#### ✅ Vite
- 启动 < 1s，HMR < 100ms，Vibe Coding 反馈极快。
- 配置简单，开箱即用 TypeScript + JSX。
- 生产构建基于 Rollup，体积小。

#### ✅ TypeScript
- 22 张牌数据结构强类型，避免 ID/字段拼写错误。
- AI 生成代码时类型提示能减少 bug。
- 学习价值高，贴近现代前端主流。

#### ✅ React Router v6
- 声明式路由，嵌套路由支持好。
- `useNavigate` 编程式跳转便利。
- v6 的 Data Router 留待未来扩展（loader/action）。

#### ✅ Context API（而非 Zustand/Redux）
- 全局状态**只有两层**：会话状态 + 用户偏好。
- Context 完全够用，**避免引入第三方库的复杂度**。
- 状态变更频率低，不会引发性能问题。
- **判断标准**：如果未来状态 > 5 个切片且更新频繁，再升级 Zustand。

#### ✅ Axios（而非 fetch）
- 内置拦截器（interceptors）方便统一处理 loading / error。
- 自动 JSON 序列化。
- 取消请求（`AbortController`）支持好。
- **学习价值**：HTTP 库使用模式贴近生产。

#### ✅ LocalStorage（而非 IndexedDB）
- 总量小（历史记录 ≤ 50 条，每条 < 5KB）。
- 同步 API 简单可靠。
- 后续如需更大容量，可平滑迁移到 IndexedDB（封装层已抽象）。

#### ✅ CSS Modules + CSS Variables
- 样式局部作用域，**无全局污染**。
- CSS Variables 实现主题切换 / 响应式断点。
- 零运行时开销，**比 styled-components / emotion 轻量**。
- 不引入 Tailwind：避免 utility class 噪音，**符合"神秘感"设计语言**。

#### ⚠️ 动画方案：CSS 优先，Framer Motion 按需
- 80% 动画用 CSS `@keyframes` + `transition` 即可。
- 复杂编排（洗牌 3D 旋转 + 错位浮动）再引入 Framer Motion。
- 原则：**能用 CSS 解决的不用 JS 库**。

---

## 3. 项目目录

### 3.1 完整结构

```
ai-tarot/
├── public/                          # 静态资源（直接拷贝到产物根）
│   ├── cards/                       # 塔罗牌图（RWS 公开图）
│   │   ├── major-00.webp            # 愚者
│   │   ├── major-01.webp            # 魔术师
│   │   ├── ...
│   │   ├── major-21.webp            # 世界
│   │   └── card-back.webp           # 牌背
│   ├── favicon.svg
│   └── og-image.png
│
├── src/
│   ├── main.tsx                     # 应用入口
│   ├── App.tsx                      # 根组件
│   ├── router.tsx                   # 路由配置
│   │
│   ├── assets/                      # 源码内静态资源
│   │   └── icons/                   # SVG 图标（element、arrow 等）
│   │       ├── fire.svg
│   │       ├── water.svg
│   │       ├── air.svg
│   │       └── earth.svg
│   │
│   ├── pages/                       # 页面级组件（一个目录一个页面）
│   │   ├── Landing/                 # 首页
│   │   │   ├── Landing.tsx
│   │   │   └── Landing.module.css
│   │   ├── Question/                # 输入问题
│   │   │   ├── Question.tsx
│   │   │   └── Question.module.css
│   │   ├── Spread/                  # 选择牌阵
│   │   ├── Shuffle/                 # 洗牌动画
│   │   ├── Draw/                    # 抽牌 + 翻牌 + 解读
│   │   ├── Result/                  # 幸运色 / 数字 / 寄语
│   │   ├── History/                 # 历史列表
│   │   └── NotFound/                # 404
│   │
│   ├── components/                  # 通用 UI 组件
│   │   ├── Button/                  # 统一按钮（primary / ghost / icon）
│   │   ├── Card/                    # 单张塔罗牌（正/逆位）
│   │   ├── Deck/                    # 牌堆（用于 Shuffle / Draw）
│   │   ├── Background/              # 星空粒子背景
│   │   ├── Layout/                  # 页面 Layout（顶部 + 内容 + 底部）
│   │   ├── Loading/                 # 加载动画
│   │   ├── Modal/                   # 弹窗（免责声明 / 确认）
│   │   ├── Toast/                   # 轻提示
│   │   ├── Typography/              # 标题 / 段落 / 寄语
│   │   ├── Divider/                 # 分割线
│   │   └── ProgressBar/             # 抽牌进度
│   │
│   ├── context/                     # React Context
│   │   ├── SessionContext.tsx       # 当前占卜会话（question / drawn / reading）
│   │   └── SettingsContext.tsx      # 用户偏好（主题 / 动画 / 草稿）
│   │
│   ├── hooks/                       # 自定义 Hooks
│   │   ├── useLocalStorage.ts       # LocalStorage 同步 hook
│   │   ├── useSession.ts            # SessionContext 快捷调用
│   │   ├── useReading.ts            # 调用 AI 解读（含 loading / error）
│   │   └── useTypewriter.ts         # 打字机效果
│   │
│   ├── services/                    # 外部服务封装
│   │   ├── http.ts                  # Axios 实例 + 拦截器
│   │   └── ai.ts                    # AI API 调用（解读 / 幸运元素）
│   │
│   ├── data/                        # 静态业务数据
│   │   ├── major-arcana.ts          # 22 张大阿尔卡纳
│   │   ├── spreads.ts               # 牌阵定义
│   │   └── prompts.ts               # AI Prompt 模板
│   │
│   ├── types/                       # TS 类型定义
│   │   ├── tarot.ts                 # TarotCard / DrawnCard / Reading
│   │   ├── spread.ts                # Spread / Position
│   │   └── index.ts                 # 统一导出
│   │
│   ├── utils/                       # 工具函数（纯函数）
│   │   ├── tarot.ts                 # 洗牌 / 抽牌 / 正逆位
│   │   ├── storage.ts               # LocalStorage 封装
│   │   ├── prompt.ts                # Prompt 构造
│   │   ├── shuffle.ts               # Fisher-Yates 算法
│   │   └── id.ts                    # uuid 生成
│   │
│   ├── styles/                      # 全局样式
│   │   ├── reset.css                # 浏览器重置
│   │   ├── variables.css            # CSS 变量（主题、间距、字号）
│   │   ├── global.css               # 全局样式
│   │   └── animations.css           # 复用动画 keyframes
│   │
│   └── config/                      # 全局配置
│       ├── env.ts                   # 环境变量（API Key / BaseURL）
│       └── tarot.ts                 # 业务配置（逆位概率等）
│
├── docs/                            # 文档
│   ├── PRD.md
│   └── TECH_SPEC.md
│
├── .env.example                     # 环境变量示例
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### 3.2 目录设计原则

| 原则 | 说明 |
| --- | --- |
| **就近原则** | 每个组件独占目录，包含 `.tsx` + `.module.css` + `index.ts` |
| **关注点分离** | `components`（UI）/ `hooks`（逻辑）/ `services`（IO）/ `utils`（纯函数）|
| **数据驱动** | 牌组 / 牌阵 / Prompt 都是数据，与代码逻辑分离 |
| **路径别名** | `@/components`、`@/utils` 等，配置 `tsconfig` + `vite` |
| **类型先行** | 所有数据结构先在 `types/` 定义，再写实现 |

### 3.3 路径别名配置

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

---

## 4. 页面路由

### 4.1 路由表

| Path | Page | 进入方式 | 离开方式 | 数据依赖 |
| --- | --- | --- | --- | --- |
| `/` | Landing | 直接访问 | 点击 CTA → `/question` | 无 |
| `/question` | Question | Landing CTA | 提交问题 → `/spread` | Session: `question` |
| `/spread` | Spread | Question 提交 | 选牌阵 → `/shuffle` | Session: `spreadType` |
| `/shuffle` | Shuffle | Spread 选完 | 动画结束 → `/draw` | Session: `spreadType` |
| `/draw` | Draw | Shuffle 完成 | 抽完 → `/result` | Session: `drawnCards` |
| `/result` | Result | Draw 完成 | 主动跳转 → `/` 或 `/history` | Session: `reading` + `lucky` |
| `/history` | History | Landing / Result | 点击记录 → `/history/:id` | LocalStorage: history |
| `/history/:id` | HistoryDetail | History 列表 | 返回 → `/history` | LocalStorage: history |
| `*` | NotFound | 任意 | 返回 `/` | 无 |

### 4.2 路由守卫（简化版）

> 1~2 周项目不做严格守卫，**只用 Session 缺失时的兜底提示**。

| 路由 | 必备 Session | 缺失行为 |
| --- | --- | --- |
| `/question` | 无 | — |
| `/spread` | `question` | 跳转 `/question` |
| `/shuffle` | `question` + `spreadType` | 跳转 `/spread` |
| `/draw` | `drawnCards.length < N` | 跳转 `/shuffle` |
| `/result` | `reading` | 跳转 `/` |
| `/history/:id` | LocalStorage 中存在该 ID | Toast 提示后跳转 `/history` |

**实现方式**：在每个页面 `useEffect` 顶部检查 + `useNavigate` 跳转。

### 4.3 跳转流程图

```
[Landing /]
    │ click "开始占卜"
    ▼
[Question /question]
    │ submit question
    ▼
[Spread /spread]
    │ select spreadType
    ▼
[Shuffle /shuffle]
    │ animation ends (2.5s)
    ▼
[Draw /draw]
    │ all cards drawn + flipped
    ▼
[Result /result]
    │ click "保存" / "再抽一次" / "查看历史"
    ├──► [Landing /] (再抽一次，重置 Session)
    └──► [History /history]
            │ click item
            ▼
            [HistoryDetail /history/:id]
```

### 4.4 关键实现约定

- **路由模式**：`BrowserRouter`（GitHub Pages 需配 404.html 兜底）。
- **懒加载**：所有页面用 `React.lazy()` + `Suspense`。
- **滚动行为**：路由切换时滚动到顶部（`ScrollToTop` 组件）。
- **返回栈**：使用 React Router 自带历史栈；底部不放"返回"按钮（移动端用浏览器手势，桌面用 `useNavigate(-1)`）。

---

## 5. 组件拆分

### 5.1 通用 UI 组件（`src/components/`）

| 组件 | 职责 | Props 关键字段 | 复用页面 |
| --- | --- | --- | --- |
| **Button** | 统一按钮 | `variant: primary/ghost/icon`、`size`、`loading`、`onClick` | 全局 |
| **Card** | 单张塔罗牌渲染（正/逆位） | `card`、`isReversed`、`onClick`、`size` | Draw / Result / HistoryDetail |
| **Deck** | 牌堆（多张牌叠加） | `count`、`onClickPick` | Shuffle / Draw |
| **Background** | 星空粒子背景（固定全屏） | `intensity` | 全局 |
| **Layout** | 页面骨架（顶部 / 内容 / 底部） | `children`、`showHeader`、`showFooter` | 全局 |
| **Loading** | 加载态（旋转 / 脉冲） | `type: spinner/dots`、`text` | Reading / Shuffle |
| **Modal** | 弹窗 | `open`、`onClose`、`children` | Disclaimer / Confirm |
| **Toast** | 轻提示 | `type: success/error`、`message` | 全局 |
| **Typography** | 排版规范（Title / Body / Quote） | `variant`、`as` | 全局 |
| **Divider** | 装饰分割线 | `orientation: vertical/horizontal` | Result / History |
| **ProgressBar** | 抽牌进度（0/3 → 1/3 → 2/3 → 3/3） | `current`、`total` | Draw |
| **LuckyCard** | 幸运色 / 数字 / 寄语卡片 | `type: color/number/phrase`、`data` | Result |

### 5.2 业务组件（按页面分布）

> 业务组件就近放在 `pages/{Page}/components/` 下，**仅在该页面复用**。

| 页面 | 业务组件 | 职责 |
| --- | --- | --- |
| **Landing** | `HeroSection`、`CTASection` | 主视觉 + 引导 |
| **Question** | `QuestionInput`、`QuestionGuide` | 输入框 + 引导文案 |
| **Spread** | `SpreadCard` | 牌阵卡片（含 disabled 态） |
| **Shuffle** | `ShuffleAnimation` | 洗牌 3D 动画编排 |
| **Draw** | `CardStack`、`FlipCard`、`PositionLabel` | 抽牌 + 翻牌 + 位置提示 |
| **Result** | `ReadingSection`、`LuckySection`、`FeedbackBar` | 解读 + 幸运元素 + 反馈 |
| **History** | `HistoryCard`、`HistoryFilter`、`EmptyState` | 历史列表 + 筛选 + 空态 |

### 5.3 组件分层原则

```
┌────────────────────────────────────────┐
│  Page（pages/）                        │  ← 页面级，组合业务组件
│   ↓ 组合                               │
│  Business Component（pages/.../comp）  │  ← 业务组件，页面内复用
│   ↓ 组合                               │
│  UI Component（components/）           │  ← 通用 UI，无业务语义
└────────────────────────────────────────┘
```

- **UI 组件**：纯展示，无业务（如 `Button`、`Card` 不感知"塔罗"概念）。
- **业务组件**：含业务语义（如 `SpreadCard` 知道 Three Card 是什么）。
- **页面**：组合业务组件 + 接入 Context。

### 5.4 组件规模约束

- 单组件 `.tsx` 文件 **≤ 200 行**。
- 超过则拆分子组件或抽离 hooks。
- 样式就近放在 `*.module.css`，**不**另起 `styles/`。

---

## 6. 状态管理

### 6.1 三层状态划分

| 层级 | 适用场景 | 工具 | 生命周期 |
| --- | --- | --- | --- |
| **Local State** | 组件内部 UI 态 | `useState` / `useReducer` | 组件卸载即销毁 |
| **Context（全局）** | 跨页面共享的会话数据 | `Context` + `useContext` | 应用生命周期 |
| **LocalStorage（持久）** | 跨会话保留的数据 | `useLocalStorage` hook | 永久（直到用户清除） |

### 6.2 Local State（组件内 `useState`）

典型场景：

| 状态 | 所属组件 |
| --- | --- |
| 输入框当前值（未提交前） | QuestionInput |
| 按钮 hover / focus 态 | Button |
| Modal 开关 | 各使用方 |
| 当前动画播放进度 | ShuffleAnimation |
| 打字机当前显示到第几个字 | ReadingSection |
| Loading 显隐 | ReadingSection |

**原则**：**能放 Local 就别放全局**——避免 Context 频繁更新导致整树 re-render。

### 6.3 Context（跨页面共享）

#### SessionContext

> 一次占卜的会话数据，从 Question 到 Result 全程共享。

| 字段 | 类型 | 写入时机 |
| --- | --- | --- |
| `question` | `string` | Question 提交 |
| `spreadType` | `SpreadType` | Spread 选择 |
| `drawnCards` | `DrawnCard[]` | Draw 完成 |
| `reading` | `Reading \| null` | AI 返回 |
| `lucky` | `LuckyItems \| null` | AI 返回 |
| `setQuestion` / `setSpread` / `setDrawnCards` / `setReading` / `setLucky` | `() => void` | — |
| `reset()` | `() => void` | 完成 / 重新占卜 |

**实现要点**：
- 用 `useReducer` 而非多个 `useState`，便于统一 `reset()`。
- Context Provider 放在 `App.tsx` 顶层。
- 使用 `useMemo` 缓存 value，避免无关 re-render。

#### SettingsContext

> 用户偏好设置，跨会话保留。

| 字段 | 类型 | 持久化 |
| --- | --- | --- |
| `theme` | `'dark' \| 'light'` | LocalStorage |
| `reduceMotion` | `boolean` | LocalStorage |
| `soundEnabled` | `boolean` | LocalStorage |

### 6.4 LocalStorage（持久化）

#### 数据分区

| Key | 内容 | 写入时机 | 读取时机 |
| --- | --- | --- | --- |
| `ai-tarot:history` | `HistoryRecord[]` | Result 页完成 | History 列表 / Detail |
| `ai-tarot:draft` | `{ question?, step? }` | Question 每次输入 | 进入 Question 时恢复 |
| `ai-tarot:settings` | `Settings` | 设置变更 | 应用启动 |

#### 封装层（`utils/storage.ts`）

- 提供类型安全的 `get<T>()` / `set<T>()` / `remove()` 方法。
- 自动 JSON 序列化 + 异常兜底（解析失败不崩）。
- 容量监控（> 4MB 警告）。

#### 写入策略

- **历史记录**：写入即追加，**不主动清理**，用户可手动删除。
- **草稿**：debounce 500ms 写入，避免高频 IO。
- **设置**：实时同步，刷新即生效。

### 6.5 状态管理决策树

```
需要状态吗？
  │
  ├─ 否 → 不要加，纯渲染
  │
  └─ 是 → 跨页面共享吗？
            │
            ├─ 否 → Local State（useState）
            │
            └─ 是 → 需要持久化吗？
                      │
                      ├─ 否 → Context（SessionContext）
                      │
                      └─ 是 → LocalStorage（通过 useLocalStorage hook）
```

---

## 7. 开发规范

### 7.1 命名规范

| 类型 | 规范 | 示例 |
| --- | --- | --- |
| **组件文件** | PascalCase | `QuestionInput.tsx` |
| **样式文件** | 与组件同名 + `.module.css` | `QuestionInput.module.css` |
| **Hook 文件** | camelCase，以 `use` 开头 | `useReading.ts` |
| **工具函数** | camelCase | `shuffleCards.ts` |
| **类型文件** | kebab-case | `tarot.ts` |
| **Context 文件** | PascalCase + `Context` 后缀 | `SessionContext.tsx` |
| **常量** | UPPER_SNAKE | `REVERSED_RATE` |
| **枚举值** | camelCase 字符串字面量 | `'three-card'` |
| **接口** | PascalCase，无 `I` 前缀 | `TarotCard`（**不**写 `ITarotCard`） |
| **类型别名** | PascalCase | `DrawnCard`、`SpreadType` |

### 7.2 文件组织

每个组件目录标准结构：

```
Button/
├── Button.tsx           # 组件实现
├── Button.module.css    # 样式
├── Button.test.tsx      # 测试（MVP 暂不写）
└── index.ts             # 统一导出
```

`index.ts` 内容：

```ts
export { Button } from './Button';
export type { ButtonProps } from './Button';
```

### 7.3 TypeScript 规范

#### 严格度

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

#### 编码约定

- ✅ 优先 `type` 而非 `interface`（除非需要 extend）。
- ✅ Props 类型命名：`{ComponentName}Props`。
- ✅ 避免 `any`，必要时用 `unknown`。
- ✅ 枚举用 `as const` 对象，**不用** `enum` 关键字。
- ✅ 返回值类型显式标注（公共函数）。

#### 路径导入

- ✅ 使用路径别名 `@/components/Button`。
- ❌ 不使用 `../../../utils/...` 相对路径。

### 7.4 Hooks 规范

- ✅ 自定义 Hook 命名以 `use` 开头。
- ✅ 单个 Hook 只做一件事（单一职责）。
- ✅ 副作用必须写清依赖数组。
- ✅ 复杂状态用 `useReducer` 而非多个 `useState`。
- ❌ 不在条件 / 循环中调用 Hook。

### 7.5 API 规范

#### 错误处理

- 业务错误抛出自定义 `AppError`，包含 `code` + `message`。
- HTTP 错误通过 Axios 拦截器统一转换。
- 用户可见的错误信息走 Toast / 页面内嵌文案，**不** `console.error` 直接给用户看。

#### Loading 态

- 每个异步操作都有 loading 态。
- loading 集中管理（`useReading` hook 内部维护）。

#### 取消请求

- 长任务支持 `AbortController`（页面卸载时调用）。

### 7.6 Git 提交规范

采用 Conventional Commits：

```
feat: 新增抽牌动画
fix: 修复逆位判断逻辑错误
docs: 更新 README
refactor: 重构 SessionContext
style: 调整 Button 样式
chore: 升级依赖
```

### 7.7 注释规范

- ✅ 公共函数 / Hook 顶部写 JSDoc。
- ✅ 复杂业务逻辑写"为什么"而非"是什么"。
- ❌ 不写废话注释（`// 初始化 state` 这种不要）。
- ✅ TODO 标注：`// TODO: 后续接入埋点 @xiaoming`。

---

## 8. 可扩展性

### 8.1 扩展维度一：78 张完整牌组

**当前**：22 张大阿尔卡纳，写死在 `data/major-arcana.ts`。

**扩展点**：
1. 拆分文件：
   ```
   data/
   ├── major-arcana.ts          # 22 张大阿尔卡纳
   ├── minor-wands.ts           # 14 张权杖
   ├── minor-cups.ts            # 14 张圣杯
   ├── minor-swords.ts          # 14 张宝剑
   └── minor-pentacles.ts       # 14 张星币
   ```
2. 新增 `data/index.ts` 聚合：
   ```ts
   export { MAJOR_ARCANA } from './major-arcana';
   export { WANDS } from './minor-wands';
   // ...
   export const ALL_CARDS = [...MAJOR_ARCANA, ...WANDS, ...CUPS, ...SWORDS, ...PENTACLES];
   ```
3. 修改 `utils/tarot.ts` 的 `drawCards`，从 `MAJOR_ARCANA` 改为 `ALL_CARDS`：
   ```ts
   import { ALL_CARDS } from '@/data';
   // ...
   const shuffled = shuffle(ALL_CARDS);
   ```
4. 在 `public/cards/` 下补齐图片。

**影响范围**：**0 行页面代码**——这是数据驱动的胜利。

### 8.2 扩展维度二：更多牌阵

**当前**：仅 Three Card 启用，Celtic Cross 预留。

**扩展点**：
1. 在 `data/spreads.ts` 新增：
   ```ts
   {
     id: 'celtic-cross',
     name: '凯尔特十字',
     cardCount: 10,
     positions: [/* 10 个位置定义 */],
     enabled: true, // 改为 true
   }
   ```
2. Draw 页面读取 `spread.cardCount` 决定抽几张。
3. 位置渲染使用 `spread.positions` 数据驱动。

**影响范围**：Draw 页面 + Result 页面，**0 行工具代码**。

### 8.3 扩展维度三：登录 / 用户系统

**当前**：完全匿名，LocalStorage 本地存储。

**扩展点**：
1. 新增 `context/AuthContext.tsx`：
   ```ts
   interface AuthContext {
     user: User | null;
     login(): Promise<void>;
     logout(): void;
   }
   ```
2. 新增 `services/auth.ts`（登录 / 登出 / 获取用户信息）。
3. SessionContext 保持不变，**用户数据走 AuthContext**。
4. LocalStorage history → 后端 API（保留 LocalStorage 作为离线缓存）。

**架构原则**：
- AuthContext 与 SessionContext **正交**（互不依赖）。
- 引入登录后，**不破坏**现有匿名用户流程（兼容降级）。

### 8.4 扩展维度四：后端数据库

**当前**：无后端。

**扩展点**：
1. 新增 `services/api/` 目录（替代直接 LocalStorage）。
2. 抽象 `services/history.ts`：
   ```ts
   interface HistoryService {
     list(): Promise<HistoryRecord[]>;
     get(id: string): Promise<HistoryRecord | null>;
     save(record: HistoryRecord): Promise<void>;
     remove(id: string): Promise<void>;
   }
   ```
3. 提供两个实现：
   - `LocalHistoryService`（当前方案，LocalStorage 存储）。
   - `RemoteHistoryService`（未来 HTTP API）。
4. 通过依赖注入切换。

**架构原则**：
- **业务代码不感知存储方式**——只调用 `historyService.list()`。
- 切换后端时**只改 DI 注入点**，不污染业务。

### 8.5 扩展性总览

| 未来需求 | 修改文件 | 业务代码改动 |
| --- | --- | --- |
| 78 张牌 | `data/` + `public/cards/` | ❌ 0 行 |
| 多牌阵 | `data/spreads.ts` | ❌ 0 行 |
| 浅色 / 深色主题 | `styles/variables.css` | ❌ 0 行 |
| 多语言 | `i18n/` + `useTranslation` | ⚠️ 少量文案替换 |
| 登录 | `context/AuthContext.tsx` + `services/auth.ts` | ⚠️ 新增分支 |
| 后端存储 | `services/history.ts` 抽象 | ❌ 0 行（依赖注入切换） |
| PWA | `vite-plugin-pwa` + manifest | ❌ 0 行 |
| 分享海报 | 新增 `components/Poster/` | ⚠️ 仅新增组件 |

### 8.6 不预留的扩展

> **有意识地不做的事情**（避免过度设计）：

- ❌ 不做插件系统（无意义，1~2 周项目）。
- ❌ 不做微前端（杀鸡用牛刀）。
- ❌ 不做 Server Side Rendering（GitHub Pages 静态托管）。
- ❌ 不做 A/B 测试框架（用户量不足以分桶）。
- ❌ 不做微服务 / BFF（无后端）。

---

## 附录 A：依赖清单

### 生产依赖

| 包 | 用途 |
| --- | --- |
| `react` | 核心 |
| `react-dom` | DOM 渲染 |
| `react-router-dom` | 路由 |
| `axios` | HTTP |
| `framer-motion` | 复杂动画（可选） |

### 开发依赖

| 包 | 用途 |
| --- | --- |
| `vite` | 构建 |
| `@vitejs/plugin-react` | React 插件 |
| `typescript` | 类型 |
| `@types/react` | React 类型 |
| `@types/react-dom` | ReactDOM 类型 |
| `gh-pages` | 部署 |

## 附录 B：关键配置文件

### `vite.config.ts`（核心配置）

- 路径别名 `@` → `src`
- 静态资源 base（GitHub Pages 子路径）
- 构建产物目录 `dist/`

### `tsconfig.json`（核心配置）

- `strict: true`
- `jsx: "react-jsx"`
- `paths` 配置 `@/*`

### `.env.example`

- `VITE_AI_API_KEY`
- `VITE_AI_BASE_URL`
- `VITE_AI_MODEL`

## 附录 C：风险与对策（架构视角）

| 风险 | 影响 | 对策 |
| --- | --- | --- |
| AI API 限流 / 超时 | 解读失败 | `useReading` 内置重试 + 兜底 |
| LocalStorage 被清 | 历史丢失 | 抽象 `historyService`，未来可平滑迁移到后端 |
| Context 更新引发 re-render | 性能问题 | `useMemo` + 拆分 Context + 局部 state 优先 |
| GitHub Pages 刷新 404 | 体验差 | `404.html` 兜底 + `HashRouter` 备选 |
| 第三方动画库体积大 | 首屏慢 | CSS 优先，Framer Motion 按需引入 |

---

> **文档结束**
> 本 Technical Spec 严格遵循"简洁 / 易维护 / 易扩展 / 不过度设计"四原则。
> 任何与 PRD 冲突的地方，**以 PRD 为准**，本文档应在 PRD 更新后同步迭代。
