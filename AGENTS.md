# 项目开发指南

> **本文档描述的是目标状态。** `docs/` 目录下有一份正在执行的重构工单（`01` ~ `11` 共 11 步），
> 在它执行完成之前，本文档的部分描述会先于代码。
>
> 发现文档与代码不一致时：**以 `docs/` 中对应步骤为准，按步骤执行，不要据此自行改代码。**
> 工单全部完成后，`docs/11-agents-md-sync.md` 负责核对两者是否已经对齐。

## 项目与技术栈

AstralExpress 是一个 **Tauri + React + TypeScript + Python** 桌面应用平台。

- 前端：React 19、TypeScript 6、React Router 8、Ant Design 6、SCSS Modules、Zustand 5。
- 构建与质量：Vite 8 + Rolldown、React Compiler、oxlint、oxfmt。
- Rust / Tauri：桌面能力、应用组装、前后端通信、平台适配、Manifest 扫描、任务与数据库能力。
- Python：位于 `tools/` 和 `crawler/`，仅负责各自业务逻辑。

技术栈版本以 `package.json` 和 `Cargo.toml` 为准。**不要凭记忆使用 API**——
尤其是 Ant Design，用 `antd info <组件>` / `antd doc <组件>` 查实际版本的 API，再写代码。

---

## 目录职责

### 前端：`src/`

```text
src/
├── main.tsx
├── app/
│   ├── App.tsx
│   └── theme.ts
├── Atrium/
│   ├── Atrium.tsx
│   ├── Atrium.module.scss
│   └── components/
├── modules/
│   ├── registry.ts
│   └── <Module>/
│       ├── registry.ts
│       ├── layout/
│       ├── pages/
│       ├── router/
│       ├── api/            # 数据源选择：isTauri() ? 真实 IPC : 开发态 mock
│       ├── stores/         # 模块级 Zustand store（由 shared/hooks 的工厂实例化）
│       ├── components/     # 仅模块内多页面复用时才创建
│       ├── hooks/          # 仅模块内复用时才创建
│       └── domain/         # 仅模块内的业务类型 / ViewModel / 视图映射
├── router/
├── shared/
│   ├── components/
│   ├── config/
│   ├── domain/
│   ├── hooks/
│   ├── layout/
│   ├── router/
│   ├── styles/
│   ├── tauri/
│   └── utils/
└── assets/
    ├── fonts/
    └── images/
```

#### 入口与应用组装

- `main.tsx`：唯一职责是导入全局样式、创建 React Root 并挂载 `<App />`；不得加入路由、数据请求、Tauri 调用或业务初始化。
- `app/App.tsx`：前端组装入口，放 `ConfigProvider`、`RouterProvider`、顶层错误边界等全局组件；不得放具体页面、业务状态或模块逻辑。
- `app/theme.ts`：Ant Design Theme Token、主题算法及全局主题配置；不得放组件专属样式或业务常量。
- `app/AppProviders.tsx`：仅当顶层 Provider 明显增多时创建，用来组合 Provider；不作为通用业务组件目录。

#### 门户与业务模块

- `Atrium/`：当前主门户的专属实现。`Atrium.tsx` 是门户根组件，`Atrium.module.scss` 只描述门户布局与样式，`Atrium/components/` 放只被门户使用的组件。门户组件不应被其他模块直接引用；有真正跨模块需求时下沉到 `shared/`。
- `modules/registry.ts`：统一保存模块定义、显示名称、入口等元数据；不放路由渲染、页面 JSX 或模块业务逻辑。
- `modules/<Module>/registry.ts`：该模块自身的元数据；由全局注册表集中使用。用 `satisfies ModuleDefinition` 而不是类型标注，保留字面量类型。
- `modules/<Module>/layout/`：该模块内多个页面共用的壳、导航、侧栏或页头；不放单页特有区域。
- `modules/<Module>/pages/`：路由页面及只被单个页面使用的组件、样式和表单状态。页面负责组合下层能力，不反向被底层逻辑依赖。
- `modules/<Module>/router/`：模块的 `AppRouteObject[]`、导航项、路径常量、路由 loader/action（如使用）；不放跨模块路由表和页面业务实现。路径字符串集中在 `navigation.ts`，同时驱动路由表与菜单，不得在别处重复硬编码。
- `modules/<Module>/api/`：该模块的**数据源选择层**，只决定走真实 IPC 还是开发态 mock。真正的 Tauri 调用仍然只能经由 `shared/tauri/`。
- `modules/<Module>/stores/`：该模块的 Zustand store。store 工厂放在 `shared/hooks/`，每个模块在这里各自实例化一份。
- `modules/<Module>/components/`：仅供同一模块多个页面复用的业务组件。确认被其他模块复用后，才移动到 `shared/components/`。
- `modules/<Module>/hooks/`：仅该模块使用的组合逻辑或状态 Hook；跨模块复用后才移动到 `shared/hooks/`。
- `modules/<Module>/domain/`：只存前端模块内部的 FormValues、ViewModel、筛选条件、组件 Props，以及「领域对象 → 视图对象」的映射函数（如 `Manifest` → `CatalogItem`）；跨 Rust/TypeScript 的契约不放这里。

#### 全局路由、共享能力与资源

- `router/`：汇总 `Atrium` 与各模块路由，保存全局路由配置。仅放 `AppRouteObject`、面包屑等路由专属类型；普通业务类型不放这里。必须提供顶层 `errorElement` 和 `path: "*"` 兜底，不允许任何未匹配地址露出 React Router 的原始错误页。
- `shared/components/`：与具体业务模块无关的可复用 UI，例如通用 Header、Hero、SectionHeader。组件不得 import 任何模块页面或模块私有类型。
- `shared/config/`：前端全局、稳定的配置和常量，例如应用级配置、状态文案与展示映射；不放临时页面配置或业务状态。
- `shared/domain/`：多个前端模块复用的领域类型、由 `ts-rs` 生成的跨端类型，以及与 React 无关的纯领域函数（筛选、分页、汇总等）。生成文件禁止手改；只属于一个模块的 UI 类型留在模块内。
- `shared/hooks/`：与特定业务模块无关、可复用的 Hook，以及 **store 工厂**（`create*Store`）；不得 import 模块页面。
- `shared/layout/`：跨模块可复用的布局框架及其基础部件；模块专属布局留在 `modules/<Module>/layout/`。
- `shared/router/`：共享的路由辅助类型和纯函数；全局路由表仍归 `src/router/`。
- `shared/styles/`：`global.scss`、字体声明、reset、CSS Variables、Sass mixins。业务组件样式一律与组件同目录，命名为 `ComponentName.module.scss`。
- `shared/tauri/`：唯一的 Tauri 调用基础层。`invoke.ts` 负责超时、响应解包和错误转换；领域调用按 `task.ts`、`catalog.ts` 等拆分。页面不得散落调用 `invoke("...")`。
- `shared/utils/`：与框架、业务都无关的小型纯函数，例如运行时环境探测 `isTauri()`。只放有明确名字和明确职责的函数；**不是杂物箱**，无法命名清楚的东西不要放进来。
- `assets/fonts/`：本地字体文件；`assets/images/`：按用途进一步分类的图片。这里不放业务逻辑、可执行脚本或组件样式。

#### `shared/` 的准入标准

`shared/` 不是杂物目录。放进来的代码必须**同时**满足：

1. 已被两个及以上模块**实际**复用（不是"以后可能"）
2. 不依赖任一业务模块
3. 语义和生命周期一致
4. 未来变化方向大致一致
5. 下沉后不会引入反向依赖

仅因为"看起来通用"就提升到 `shared/` 是错误的。反过来，已经被两个模块真实复用却还在各自模块里复制的能力，应当下沉。

### Rust / Tauri：`src-tauri/src/`

```text
src-tauri/src/
├── main.rs
├── lib.rs
├── commands/
│   ├── mod.rs
│   ├── tools.rs
│   ├── crawler.rs
│   └── task.rs
├── domain/
│   ├── mod.rs
│   ├── manifest.rs        # Manifest、ManifestCategory、ManifestStatus、Source
│   ├── response.rs        # ApiResponse、错误码常量、ApiError trait
│   ├── task.rs            # Task、NewTask、TaskStatus、CreateTaskResult
│   └── error.rs           # ManifestError、DbError、TaskError
├── catalog/
│   ├── mod.rs
│   ├── manifest_scanner.rs
│   └── registry.rs        # 仅在出现高频 id → manifest 查询时创建
├── platform/
│   ├── mod.rs
│   ├── paths.rs
│   └── python.rs          # 需要执行 Python 时创建
├── task/
│   ├── mod.rs
│   ├── repo.rs
│   ├── service.rs
│   ├── mapping.rs         # 领域枚举 ↔ SQLite 值
│   ├── scheduler.rs       # 按需创建
│   └── executor.rs        # 按需创建
├── tools/runner.rs        # 按需创建
├── crawler/runner.rs      # 按需创建
└── database/
    ├── mod.rs
    ├── connection.rs
    ├── schema.rs
    ├── migrations.rs
    └── state.rs
```

- `main.rs`：仅桌面进程入口，原则上只调用 `app_lib::run()`；不注册 Command、不初始化数据库、不扫描 Manifest、不启动 Python。
- `lib.rs`：声明顶层 `mod`、配置 Tauri Builder、插件和应用状态、注册 Command；不写业务流程、SQL 或 Python 调用细节。日志插件必须**始终注册**（发布版收紧到 `Warn`），否则扫描与迁移的诊断信息在发布版会全部丢失。
- `commands/`：React `invoke` 的边界。只接收/校验轻量参数、调用 Service 或 Query、转换数据并包装 `ApiResponse`；不写 SQL、目录扫描、进程启动或复杂状态机。
- `domain/mod.rs`：只重新导出领域子模块；不写业务实现。
- `domain/manifest.rs`：跨模块/跨端的 Manifest、分类、状态和 `Source` 等纯类型。可放 `struct`、`enum`、`Serialize`、`Deserialize`、`TS` 与无业务副作用的转换；禁止文件扫描、I/O 或校验流程。
- `domain/response.rs`：统一 `ApiResponse<T>`、全部业务错误码常量、`ApiError` trait。字段和序列化命名必须与前端 `shared/domain/response.ts`、`shared/tauri/invoke.ts` 一致。
- `domain/task.rs`：`Task`、`NewTask`、`TaskStatus`、`CreateTaskResult` 等公共任务类型。带数据库字段或仅执行期使用的类型留在 `task/models.rs`，不要为少一个 struct 强行合并。
- `domain/error.rs`：`ManifestError`、`DbError`、`TaskError` 等领域错误及其 `ApiError` 实现。业务层一律返回这些类型而不是 `String`；只有 Command 边界通过 `ApiResponse::from_result` 转成面向用户的文案 + 业务码。
- `catalog/mod.rs`：组织 Catalog 对外 API；只回答"系统中有什么"。
- `catalog/manifest_scanner.rs`：遍历 Tool/Crawler 根目录、读取和反序列化 `manifest.json`、**收集校验与扫描错误**、排序。不得启动 Python、创建 Task 或写入任务表。
- `catalog/registry.rs`：仅在存在高频 `id → manifest` 查询时维护索引/缓存。扫描量小或查询少时直接查询，不提前增加同步复杂度。
- `platform/mod.rs`：组织平台适配层。
- `platform/paths.rs`：集中解析 app data、resource、workspace、tools、crawler、Python 可执行文件等路径，并明确开发/生产环境差异。业务层不得四处直接拼接 `PathBuf`。这一层返回 `Result<_, String>` 是既定边界：路径失败只有一句人类可读的原因，没有需要调用方分支处理的类别，由调用方包装成带语义的领域错误。
- `platform/python.rs`：封装 Python `spawn`、stdin/stdout/stderr、`wait`、`kill` 等进程基础操作。只管理进程技术细节，不感知 Task ID、TaskStatus 或调度队列。
- `task/repo.rs`：只执行 INSERT、SELECT、UPDATE、DELETE、条件更新及 Row → Record 转换；不决定"能否取消"等业务规则。条件更新必须保证并发原子性。
- `task/service.rs`：Task 状态转换与业务规则，如创建、暂停、恢复、取消和目标校验；可调用 Repository，但不直接写 SQL 或启动 Python。
- `task/mapping.rs`：领域枚举与 SQLite 值的双向映射（`ToSql` / `FromSql`）。未知值必须返回明确错误，不得 panic 或静默取默认值。
- `task/scheduler.rs`：队列、并发限制和启动时机；不实现 Tool/Crawler 的具体运行方式。简单串行任务不提前创建复杂优先级队列。
- `task/executor.rs`：任务已确定执行后，按来源分发给 `tools::runner` 或 `crawler::runner`，并协调结果及状态持久化。
- `tools/runner.rs` 与 `crawler/runner.rs`：根据 ID 取得 Manifest、解析运行参数、调用 `platform::python`、返回执行结果。二者不得依赖 `task`，也不感知任务队列或任务表。
- `database/`：SQLite 连接、PRAGMA、迁移、schema 版本与事务基础设施。`find_task`、`insert_task` 等业务查询属于 `task/repo.rs`。

未实现的目录和文件仅在相应职责出现时创建；**不要为满足本说明预建空壳**。

### Python：`tools/` 与 `crawler/`

```text
tools/
└── <tool-id>/
    ├── manifest.json      # 名称、入口、参数/能力等平台契约
    ├── main.py            # 该工具的业务入口
    └── ...                # 仅该工具所需的 Python 模块、资源、测试

crawler/
└── <crawler-id>/
    ├── manifest.json      # 爬虫的平台契约
    ├── main.py            # 爬虫业务入口
    └── ...                # 仅该爬虫所需的模块、资源、测试
```

- `manifest.json`：描述平台如何发现、显示和执行该工具/爬虫；字段变动必须同步检查 Rust Manifest 类型、Catalog 扫描及前端消费点，并跑一次 `pnpm check:manifests`。
- `main.py`：解析平台输入、执行自身业务、输出进度/结果/错误。复杂 Python 业务可继续在本目录拆为专属模块，**不能跨工具直接 import**。
- Python 不得直接修改任务数据库、管理 Rust 队列或 Task 状态、调用 Tauri API；它只报告业务进度、结果、错误和 checkpoint。
- **stdout 只输出机器可解析的协议数据，stderr 用于日志**，避免日志污染 stdout。占位实现也要遵守。
- 目录里不要留调试输入、临时输出等产物；需要的话放到 `.gitignore` 覆盖的位置。
- `entry` 指向的文件必须存在且非空。空文件会在执行期静默成功退出，是最难诊断的一种失败。

---

## 依赖方向

前端：

```text
app → router → Atrium / modules → shared
```

允许 `app → router / modules / shared`、`router → modules / shared`、`modules → shared`。
禁止 `shared → modules/router/app`、`modules → router/app`；
不同业务模块不直接依赖，通用能力下沉至 `shared`。

**唯一例外**：`Atrium` 作为门户，允许依赖 `@/modules/registry` 与各模块的 `registry.ts` 元数据——
展示"系统里有哪些模块"是门户的本职，而 registry 只导出元数据、不含业务实现。
但 `Atrium` 不得引用任何模块的 `pages/`、`layout/`、`router/`、`stores/`、`api/`、`hooks/`、`components/`。

以上边界由 `.oxlintrc.json` 中 `src/shared/**` 与 `src/Atrium/**` 的 `no-restricted-imports` 规则执行。
**新增模块或新增别名时必须同步更新这两条规则**，否则护栏会出现缺口。

模块内部：

```text
pages → components / layout → hooks / stores / api / domain
```

Rust：

```text
commands → task → tools / crawler → catalog → platform
task/repo → database
所有层 → domain
```

禁止反向依赖：`domain` 不依赖业务层；`platform` 不依赖业务模块；
`catalog` 不依赖 Tool/Crawler/Task；Tool/Crawler Runner 不依赖 `task`。
若需要反向依赖，先重新拆分职责。

---

## 编码规则

### TypeScript

- 严格模式（`tsconfig.app.json` 显式声明 `"strict": true`，不依赖编译器默认值）。
- 优先 `type`，仅需声明合并时使用 `interface`；导出类型使用 `export type`。
- 使用 `@/` 指向 `src/`，`@tribios` 指向 `src/modules/Tribios/`，`@cifera` 指向 `src/modules/Cifera/`。
  新增模块时同步更新 `vite.config.ts`、`tsconfig.app.json`、`.oxfmtrc.json`、`.oxlintrc.json` 四处。
- **`as` 断言是最后手段**。写 `as` 之前先问：类型系统在阻止我，是不是因为这个字段真的不存在？
  跨端类型上的断言尤其可疑——`Manifest & { extraField?: unknown }` 这类写法通常意味着
  Rust 侧缺了字段，正确的修法是补 Rust 类型并重新生成，而不是在前端绕过去。
- 不要用 `any`。确实未知用 `unknown`，然后收窄。

### React

- 函数组件与 Hooks；组件文件使用 PascalCase，并使用命名导出（根 `App` 除外）。
- Hook 以 `use` 开头。**返回 JSX 的东西是组件，不是 Hook**，应当放 `components/` 并用 PascalCase 命名。
- 不含 JSX 的文件用 `.ts`，含 JSX 的用 `.tsx`。
- 页面负责组合，不承担数据访问细节。「领域对象 → 视图对象」的映射超过几行就下沉到 `modules/<Module>/domain/`。
- 可点击的非语义元素（如带 `onClick` 的 `Card`）**必须**同时提供 `role="button"`、`tabIndex={0}`
  和 Enter/Space 键盘处理；不可点击时这些属性也要一并去掉，不能留下一个按不动的"按钮"。
- 提交前删除 `console.log`。确需保留的诊断日志用 `console.warn` 并加 `import.meta.env.DEV` 守卫。
- 不留注释掉的代码。

### Zustand

- **store 中不放可以由现有状态计算出来的派生状态**，派生值放 selector 或 `useMemo`。
- 订阅一律走 selector：`useStore((state) => state.field)`。
  **禁止 `useStore()` 全量订阅**——任一字段变化都会导致整个消费组件重渲染。
- 复用的 store 逻辑以**工厂**形式放在 `shared/hooks/`（`createXxxStore`），
  每个模块在自己的 `stores/` 里调用一次得到独立实例。
  **绝不能把工厂的调用结果当作跨模块共享的单例**——那会让两个模块的状态互相串台。
- 异步加载必须有并发守卫（`if (get().loading) return`），并维护 `loading` / `hasLoaded` / `error` 三元组：
  `loading && !hasLoaded` 是首屏，`loading && hasLoaded` 是刷新，消费方据此区分骨架屏与局部 loading。
- store 边界按领域划分，一个 store 不管多个不相关领域。

### Ant Design

- 已有 Ant Design 能满足时优先使用其组件、Props 与 Token；复杂样式使用 SCSS Module。
- **写之前先查 API**（`antd info <组件>` / `antd doc <组件>`），不要凭记忆。改完跑 `antd lint`。
- **禁止在非组件模块里 import 静态的 `message` / `notification` / `Modal`**——
  静态 API 消费不到 `ConfigProvider` context，主题不生效。一律用 `App.useApp()`。
- 用户提示是展示层的决策。基础设施层（`shared/tauri/`、store）只负责抛出/保存错误，
  由页面或交互 Hook 决定是否弹、怎么弹。同一个错误不要被提示多次。

### HTML 语义与可访问性

- 保留 HTML 语义标签；`Typography` 用于文本呈现，不取代 `main`、`section`、`nav`、`aside`、`time` 等结构语义。
- 区块用 `aria-label` 或 `aria-labelledby` 命名；加载态用 `aria-busy`；纯装饰元素用 `aria-hidden`。

### SCSS Modules

- 业务组件样式与组件同目录，命名 `ComponentName.module.scss`。
- 颜色、圆角、阴影等重复出现的视觉值，优先用 `shared/styles/` 的 CSS Variables 与 `_mixins.scss`；
  **已有 mixin 能表达的效果不要再手写一遍**（如 `glass-card` 已参数化，不要另写毛玻璃）。
- `:global` **只能**用于覆盖 Ant Design 的内部类名，且必须包裹在本模块的局部类之内
  （`.table :global(.ant-table-thead > tr > th)`），不得裸用而污染全局作用域。
- 不留未被引用的 class。
- 组件里的内联 `style` 只用于一次性的布局微调（margin、gap 等）；颜色和字体走样式文件或主题 token。

### Barrel（`index.ts`）

- barrel **只供外部消费**。`shared/` 内部互相引用一律走直接路径，
  否则会出现「barrel 导出 A，A 又从 barrel 导入 B」这种真实的循环引用。
- 为了拿一个组件就 import 整个 barrel 也要避免，直接写具体路径。

### Rust

- 业务错误保留语义（`ManifestError`、`DbError`、`TaskError`），在 Command 边界统一转换；
  **避免到处使用 `Result<T, String>` 或 `map_err(|e| e.to_string())`**。
  不同性质的失败必须可区分——锁中毒（进程级故障，只能重启）和一次 SQL 失败（可重试）
  被压成同一个 `String` 时，调用方就失去了分支处理的能力。
- 所有 Tauri Command 统一返回 `ApiResponse<T>`，不要一部分返回 `Result<ApiResponse<T>, String>`——
  两种形状会在前端走两条不同的失败路径。
- **扫描、遍历类操作不得静默吞错**。`Err(_) => continue` 是禁止写法：
  单条失败不该中断整体，但一定要收集并写进日志，否则出问题时没有任何线索。
- `SELECT *` 是禁止写法，一律显式列名——`SELECT *` 与行映射函数之间的耦合是隐式的，加列时行为不可预期。
- 同一个语义值不要在一个函数签名里出现两次（例如既传 `source` 参数又传带 `source` 字段的结构体），
  那会产生可以互相矛盾且不报错的歧义契约。
- 泛型和闭包参数要有真实的变化点。只有一个调用形态时，泛型只是阅读成本。
- 暂时没有调用点但将来必用的函数，加 `#[allow(dead_code)]` 并写明它为什么留着，**不要删**。
  提交前 `cargo check` 应当是 0 warning。
- 格式由 `cargo fmt` 统一，配置在 `src-tauri/rustfmt.toml`。提交前跑 `cargo fmt`，
  CI/检查阶段用 `cargo fmt --check`。**不要手工把多行代码压成单行**：
  Rust 不在 oxfmt 的管辖范围内，没有格式门禁时压缩过的代码不会被自动纠正。
- **注释是代码的一部分，不是可选装饰。** 解释"为什么这样写"的注释（尤其是记录了
  约束来源、失效模式、跨层契约的那些）在重构、搬移、格式化时必须一起带走。
  本文档中多条规则的理由就写在对应代码的注释里，删掉注释等于让下一个人重新踩坑。

### 命名

- 方法 camelCase / snake_case（各随语言），类型 PascalCase，只将真正的全局常量写为 UPPER_SNAKE_CASE。
- **同一个概念在全项目只能有一个名字**，跨语言也是。不要出现 Rust 叫 `Task`、前端叫 `TaskItem` 这种情况。
- **不同概念不要共用一个名字**。`shared` 这个词已经用于全局共享层，不要再用作模块内子目录名。
- 避免 `utils`、`common`、`helper`、`manager`、`base` 这类过泛的目录与文件名；
  `shared/utils/` 是唯一的例外，且只收纳有明确名字的小型纯函数。
- 文件名要说明它做什么，而不是它在哪一层。`manifest_scanner.rs` 这样的名字优于泛化的 `loader.rs`。

---

## 跨端契约

**Rust 是跨端领域类型的唯一真实来源。**

- 由 `ts-rs` 生成的 TypeScript 文件禁止手改；修改 Rust 类型后重新生成（`cargo test`）并修复使用处。
- 生成目录由 `src-tauri/.cargo/config.toml` 的 `TS_RS_EXPORT_DIR` 指定。
- **多个类型共享同一个 `export_to` 目标时，重新生成前要先删除旧文件**——
  ts-rs 是增量写入的，不删除可能残留已经移走的类型。
- 生成的文件必须同时出现在 `.oxfmtrc.json` 的 `ignorePatterns` 中。
  新增一个 `export_to` 目标文件时要同步加进去，否则 `pnpm format` 会改写生成物，
  「禁止手改」就在工具层面被绕过了。
- `export_to` 要按语义分文件：task 相关的类型不要生成进 `manifest.ts`。

**字段级契约**：

- manifest.json 里出现、但 Rust `Manifest` 里没有的字段，会被 serde **静默丢弃**，
  而开发态 mock（直接读 JSON）却能看到它——同一份代码两种行为，是最难排查的一类 bug。
  所以 manifest 加字段必须同时改 Rust 类型。
- `Source`（tool / crawler 二元来源）的字面量在三处必须保持一致，改任一处都要检查另外两处：
  `domain/manifest.rs` 的 serde 表示、`database/schema.rs` 中 `tasks.source` 的 CHECK 约束、
  `platform/paths.rs::manifest_dir` 的目录映射。
- manifest 契约由 `pnpm check:manifests` 校验（字段集合、枚举取值、icon 白名单、entry 文件是否存在且非空）。
  规则从 Rust 源码和 `AppIcon/registry.ts` 提取，不另外维护清单。**改动 manifest 字段后必须跑一次。**

**开发态 mock**：

- 各模块 `api/commands.mock.ts` 一律用 `import.meta.glob` 直读真实的 `manifest.json`，
  **不要手抄数据字面量**——手抄的副本靠人工同步，忘记同步不会有任何报错。
- 移动 mock 文件时注意 glob 的相对路径深度，`tsc` 查不出这个错误，写错只会让列表静默变空。

---

## 数据库层（`src-tauri/src/database/`）约定

- `mod.rs` 只允许 `pub mod` 声明，不写任何逻辑。
- `connection.rs`：只负责打开连接。包含数据库路径、`open_connection`（PRAGMA、busy_timeout）
  和启动入口 `initialize`。**不得包含建表、迁移或业务 SQL。**
- `schema.rs`：只放 SQL 常量，不放业务逻辑。常量以版本前缀命名（`V1_`、`V2_`），
  **已发布的版本不得修改**，结构变更只能新增下一版本的常量，并同步提升 `LATEST_VERSION`。
- `migrations.rs`：只负责用 `PRAGMA user_version` 把数据库升级到最新版本。
  每次迁移在**同一个事务**内完成；新增迁移时同步提升 `LATEST_VERSION`，
  并补充迁移测试（新库、重复执行、存量库）。
- V1 使用了 `CREATE TABLE IF NOT EXISTS`，那是为了兼容「表已建好但 `user_version` 仍为 0」的存量开发库。
  **V2 及以后不要照抄这个写法**，应直接写 `ALTER TABLE` 等真实变更语句。
- 每个连接（含后台线程）必须通过 `open_connection` 创建；迁移只在启动时通过 `initialize` 执行一次。
- 表的增删改查不放在 `database/`，放到各业务模块的 `repo.rs`（如 `task/repo.rs`）；
  业务规则放 `service.rs`。依赖方向：service → repo → Connection。
- 时间统一存 UTC ISO 8601 字符串；状态变更必须按语义封装（如 `mark_finished`），
  同时维护 `finished_at` 与 `updated_at`，以满足表上的 CHECK 约束。
- 连接管理：应用启动时调用一次 `initialize`，得到的连接长期持有（`Mutex<Connection>` 放入全局状态），
  不要每次 CRUD 重新打开。**持锁期间不做耗时操作**——文件扫描、进程启动、网络请求都要挪到取锁之前。
  需要独立连接的后台线程使用 `open_connection` 自建，不重复执行建表。
- `repo.rs` 只做数据访问：SQL、参数绑定、行到 domain 类型的转换，接收 `&Connection`，
  返回 `rusqlite::Result`。不加锁、不含业务规则、不依赖 Tauri。
  表约束要求的字段联动（如终态同时写 `finished_at`）放在 repo，状态流转规则放 service。
- 依赖默认 PRAGMA 值的行为要显式写出来。例如 `tasks` 上的 `trg_tasks_updated_at`
  在 `AFTER UPDATE` 中再次 `UPDATE` 同表，它不递归只是因为 SQLite 默认关闭递归触发器——
  这类隐式依赖必须在 `open_connection` 里显式声明。

---

## 架构判断与检查

- **代码放在真正拥有职责的位置，而不是当前调用最方便的位置。**
- 判断标准不是"放在这里也能跑"，而是"结合现有结构、业务边界、依赖关系和未来变化方向，
  这是不是它最合理的位置"。
- 不提前创建 trait、manager、provider、factory、通用 utils/service/runner；
  只有重复明确、语义和生命周期一致时才抽取。
- 两段代码只是"形状相似"不构成合并理由。合并前确认：同一业务概念、输入输出语义一致、
  生命周期一致、未来变化方向一致、合并后不需要大量布尔参数或泛型技巧。
- 反过来，同一条**领域规则**散落在多处（同一个状态转换、同一条分页钳制、同一套错误映射）
  就是抽象不足，应当收敛到一处。
- 不要为了减少代码行数而抽象；也不要因为"以后可能复用"而提前下沉。
- 未经明确需求，不引入新的 UI 库、Router、ORM、全局状态方案、包管理器，也不顺手重构无关目录。
- 隐式依赖要显式化：用到的 npm 包必须写进 `package.json`，不能靠别的包的传递依赖解析。
- 修改前阅读当前文件、直接依赖及所有引用；检查是否已存在等价能力与跨端类型影响。
- 修改后按影响范围运行下面的检查；跨端类型变更后重新生成类型。
- 清理性改动（删 `console.log`、改扩展名、补 lint 规则）不要和功能性改动混在同一次提交里。

优先级：**正确性 → 职责位置 → 依赖方向 → 类型安全 → 可维护性 → 减少重复 → 代码长度**。

---

## 检查命令

```bash
# 前端
npx tsc -p tsconfig.app.json --noEmit    # 类型检查，必须 exit 0
npx oxlint                                # 架构护栏 + lint，必须无 error
npx antd lint ./src                       # Ant Design 用法，必须 0 issue
npx oxfmt --check src                     # 格式

# Rust
cd src-tauri && cargo check               # 必须 exit 0 且 0 warning
cd src-tauri && cargo test                # 含迁移测试与 ts-rs 绑定生成
cd src-tauri && cargo fmt --check         # 格式，必须无 diff

# 跨端契约
pnpm check:manifests                      # manifest 字段 / 枚举 / icon / entry
```

只有 `tsc` 和 `cargo check` 通过不等于改对了。下面这些问题它们查不出来，必须跑应用确认：

- `import.meta.glob` 的相对路径写错 → 列表静默变空
- zustand 工厂被当成单例 → 两个模块状态串台
- 路由 `link` 指向未注册的路径 → 点击进入错误页
- Rust 丢弃了 manifest 的某个字段 → 开发态正常、Tauri 态失效

---

## 待决事项

以下事项已在架构审计中识别，但需要产品或人工决策。详细背景见 `docs/00-architecture-audit.md`。
**不要擅自替这些问题做决定。**

### 需要决策

| 事项 | 背景 |
|---|---|
| `crawler_configs` 表是否保留 | 全项目零读写。当前保留在 V1 schema 中。若确定不用，应在有真实用户数据之前通过 V2 迁移删除 |
| Python 虚拟环境建在哪 | `platform/paths.rs::python_executable` 找的是 `runtime/core-venv/Scripts/python.exe`，该目录尚不存在 |
| 是否支持 Windows 以外的平台 | `tauri.conf.json` 声明 `bundle.targets: "all"`，但 `app_data_dir` 用的是 Windows 的 `APPDATA`、Python 路径用的是 `Scripts/python.exe`。「声明全平台 + 实现单平台」是最差的组合，需要二选一 |
| `AppRouteHandle.menu` 是接线还是移除 | 两个模块的路由都设了 `menu: true`，但全项目无读取方；菜单实际由 `navigationItems` prop 驱动 |
| `services/` 空目录的用途 | 不在任何目录规划中 |
| manifest 是否扩展运行契约字段 | 当前 manifest 只有 `entry`，不描述工具接受哪些方法、哪些参数。不补齐的话，前端只能为每个工具硬编码参数表单——那正好破坏"新增工具不改 Rust/前端业务代码"的目标 |
| 19 个 manifest `link` 指向的详情页是否在规划中 | 当前这些路由不存在，消费点已移除 link（卡片不可点击） |

### 已知待办（不需要决策，但尚未做）

| 事项 | 为什么没做 |
|---|---|
| Python stdin/stdout 协议规范化 | 只有 `tools/batch-rename` 实现了一套 `{method, payload}` 协议，无 Rust 对端，其余 18 个占位实现向 stdout 打中文文本（违反本文档的 stdout 规则）。改法取决于协议怎么定，是独立的设计议题 |
| 约 110 处硬编码颜色集中为 token | 需要先定调色板；改动有视觉回归风险且无法自动验证 |
| 4 处手写毛玻璃效果改用 `glass-card` mixin | 同上 |
| `useBreadcrumb` 从"返回 JSX 的伪 Hook"改造成组件 | 会动到 `ModuleLayout` 的渲染结构 |
| `get_tools` / `get_crawlers` 与 `list_tasks` 的命名前缀统一 | command 名是 IPC 契约，改名要同步前端，收益不抵风险 |
| `tauri.conf.json` 补 `bundle.resources` | `workspace_dir()` 在 release 下返回 exe 目录，但 `bundle` 没有声明把 `tools/`、`crawler/` 打进去。需要实际跑一次 `tauri build` 验证后再改 |
| 前端测试框架 | 尚未引入 |
