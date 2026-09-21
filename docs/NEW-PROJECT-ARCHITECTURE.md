# 新项目目标架构

> 本文档与 `docs/00` ~ `docs/12`（AstralExpress 的重构工单）是两回事：
> 那一套是"怎么把现有项目改对"，这一份是**从零设计一个新项目**该长什么样。
> 依据是同一批审计里学到的真实教训，但不受现有目录结构约束——文中多处结构
> 和现有项目不一样，是刻意的，原因写在对应小节里。
>
> 技术栈不变：React 19、TypeScript、Ant Design 6、Zustand、React Router、
> Tauri 2、Rust、SQLite、Python。这份文档只重新设计"东西放哪、契约怎么定"，
> 不重新选型。

---

## 这个项目本质上是什么

从现有代码库的真实功能反推，而不是从目录名反推：

> 这是一个 Tauri 桌面应用，用来**发现、展示、运行一组由 Python 脚本实现的
> 小工具**，按主题把它们分组成"模块"（一个模块 = 侧边栏的一个分区），
> 每个模块有一个可搜索/可筛选/可分页的清单页，和一个显示执行状态的任务队列。

真正的核心资产不是某一个具体工具，而是**"清单驱动的插件宿主"这套机制本身**。
这决定了整份文档最重要的一条设计目标：

> **新增一个模块，应该只需要新增一个目录 + 一份 manifest，不需要改前端或
> Rust 的业务代码。**

现有项目目前做不到这一点——第 09 步的审计发现 manifest 契约太薄（只有
`entry`，不描述怎么运行），第 07 步发现两个模块的目录页面被迫手写了两份
几乎相同的代码，Tribios 那份审查还发现分类白名单手写漏了真实存在的一个
分类导致 4 个工具在目录页里直接消失。这份新架构文档的很多决定，都是
直接针对这三个真实问题给出的解法，不是凭空加的"最佳实践"。

---

## 设计原则

这几条不是抽象口号，每一条后面都对应一个本次审计里真实发生过的问题。

| 原则 | 对应的真实教训 |
|---|---|
| 契约必须能描述"怎么运行"，不能只描述"怎么展示" | manifest 只有 `entry`，前端永远没法自动生成参数表单，新增工具必须手改前端业务代码 |
| 容易漏改的地方，设计上让它"漏改也不出错" | Tribios 手写分类白名单漏了 `utility`，4 个工具静默消失且无任何报错 |
| 重复的页面应该是"一份代码 + 配置"，不是"复制一份改几个字" | 两个 `Library.tsx` 129 行几乎相同，改起来要同步改两份，改漏一份没人发现 |
| 同一个词在不同层级不能指代不同的东西 | `shared/` 既是全局共享层又是模块内子目录名，读代码时要靠上下文猜 |
| 会随时间线性增长的东西（模块数量），不能用需要手动同步的封闭清单表达 | tool/crawler 写死成 2 值枚举，第 3 个模块进来就要改 Rust 枚举、改 CHECK 约束、重新生成绑定 |
| 路径/路由这类"两边都要对得上"的字符串，只允许有一个来源 | manifest 的 `link` 字段手写了 19 个路径，没有一个匹配真实注册的路由 |
| 没有验证的契约迟早会漂移 | 全项目曾经没有任何机制校验 manifest 字段、枚举值、图标白名单、entry 文件是否存在 |

---

## 顶层目录

```text
<repo root>/
├── src/                # 前端
├── src-tauri/           # Rust / Tauri
├── plugins/             # Python：manifest 驱动的可执行插件
├── public/
├── docs/
├── scripts/             # 仓库工具脚本（契约校验等）
├── AGENTS.md
├── package.json / pnpm-workspace.yaml
├── vite.config.ts / tsconfig*.json
└── .oxlintrc.json / .oxfmtrc.json
```

**命名上的一条硬规则**：Python 侧的根目录叫 `plugins/`，前端侧叫
`src/modules/`——**故意用两个不同的词**。两者概念上是一一对应的（一个
`plugins/<module-id>/` 对应一个 `src/modules/<module-id>/`），如果都叫
"modules"，讨论时"modules 目录"会指代不清，这正是旧项目里 `shared/`
命名冲突踩过的坑，不要在新项目里用不同的外壳重蹈一遍。

---

## 前端：`src/`

```text
src/
├── main.tsx                       # 仅挂载，不放路由/请求/业务初始化
├── app/
│   ├── App.tsx                    # ConfigProvider + RouterProvider + 错误边界
│   └── theme.ts                   # antd 主题 token
├── router/
│   ├── index.tsx                  # 门户 + 模块路由 + 404 兜底 + 全局 errorElement
│   └── types.ts                   # AppRouteObject、面包屑 handle 类型
├── portal/                        # 门户/启动页（旧项目叫 Atrium）
│   ├── Portal.tsx
│   ├── Portal.module.scss
│   └── components/
├── modules/
│   ├── registry.ts                # 汇总全部模块注册
│   └── <module-id>/
│       ├── module.ts              # 模块元数据 + 目录页配置（见下方"目录功能"）
│       ├── router.tsx             # 本模块路由
│       ├── navigation.ts          # 路径/标题（同时驱动路由与侧边栏菜单）
│       ├── pages/
│       │   ├── Dashboard.tsx      # 薄封装：<CatalogDashboardSection config=.../>
│       │   └── Library.tsx        # 薄封装：<CatalogLibraryPage config=.../>
│       ├── api.ts                 # 数据源切换：isTauri() ? 真实 invoke : 开发态 mock
│       ├── stores.ts              # 本模块的 store 实例（用 catalog/、tasks/ 的工厂）
│       └── domain.ts              # 可选：仅当"领域对象→视图对象"映射复杂到值得抽出时才建
├── catalog/                        # 目录浏览功能（新增的顶层功能目录，见下方说明）
│   ├── CatalogLibraryPage.tsx     # 一份实现：Hero+概览+筛选+工具条+网格+分页
│   ├── CatalogDashboardSection.tsx
│   ├── useCatalogStore.ts         # store 工厂：分类/关键词/状态/页码 + 可选扩展筛选槽位
│   ├── useCatalogData.ts          # 拉取+筛选+分页+汇总，唯一实现
│   ├── filterEngine.ts            # 纯函数：筛选/分页/汇总/默认搜索文本
│   ├── types.ts                   # CatalogModuleConfig、ExtraFilterConfig
│   └── components/
│       ├── CatalogFilter/
│       ├── CatalogGrid/
│       ├── CatalogPanel/
│       ├── CatalogToolbar/
│       └── OverviewCards/
├── tasks/                          # 任务队列功能
│   ├── TaskQueue.tsx
│   ├── useTaskQueueColumns.tsx
│   ├── useTaskStore.ts            # store 工厂，按 moduleId 各自实例化
│   ├── taskPresentation.ts        # 状态文案/色调/可执行操作
│   └── runTool.ts                 # 提交参数 → create_task 的入口函数
├── run/                            # 参数表单 + 执行入口（旧项目完全没有这一层）
│   ├── RunDialog.tsx              # 根据 manifest.methods[].params 渲染表单
│   ├── ParamField.tsx             # 每种参数类型一个控件（string/number/bool/enum/path）
│   └── paramSchema.ts             # 与 Rust ParamDescriptor 对应的 TS 类型
├── shared/                         # 跨模块、与具体业务/框架都无关的东西
│   ├── components/                # LayoutHeader、Hero、SectionHeader、AppIcon、RouteFallback
│   ├── layout/                    # ModuleShell（旧项目叫 ModuleLayout）
│   ├── domain/                    # ts-rs 生成物 + ModuleDefinition
│   ├── tauri/                     # invoke.ts 唯一入口 + 按领域拆分的调用文件
│   ├── hooks/                     # 真正通用的 hook（useBreadcrumb、createAsyncListStore）
│   ├── config/
│   ├── styles/
│   └── utils/
└── assets/
```

### 为什么新增 `catalog/` 和 `tasks/` 两个顶层目录

旧项目里，"目录浏览"这套四件套（`CatalogFilter`/`CatalogGrid`/`CatalogPanel`/
`CatalogToolbar`）和 `TaskQueue` 都被塞在 `shared/components/` 底下，跟
`Hero`/`SectionHeader`这类真正的通用 UI 原子混在一起。审计过程中发现，
这套"目录浏览"逻辑其实是这个应用**第二大的核心功能**（仅次于任务执行），
它不只是几个 UI 组件，还牵涉筛选状态、分页算法、汇总统计——把它降级成
"components 目录里的几个文件"低估了它的地位，也是它为什么会被两个模块
各写一份、其中一份共享实现还被建好了却没人接上（`catalog-filter.ts` 零
调用点）的根本原因之一。

新设计把它提升成和 `modules/`、`shared/`、`run/` 平级的顶层功能目录，
`tasks/` 同理。这样"这个应用有哪几块东西"从目录树上一眼就能看出来。

### 目录功能是"一份实现 + 配置"，不是"每个模块一份页面"

`modules/<id>/pages/Library.tsx` 应该只有几行：

```tsx
import { CatalogLibraryPage } from "@/catalog/CatalogLibraryPage";
import { libraryConfig } from "../module";

export const Library = () => <CatalogLibraryPage config={libraryConfig} />;
```

`module.ts` 里声明这个模块的目录页需要什么：

```ts
import type { CatalogModuleConfig } from "@/catalog/types";

export const libraryConfig: CatalogModuleConfig = {
  moduleId: "crawlers",
  categoryLabels: { download: "图片下载", json: "JSON 数据采集" },
  // 未在此列出的分类不会被排除，只是显示原始值——见下方"分类不能是封闭白名单"
  extraFilters: [
    {
      key: "site",
      label: "目标站点",
      deriveOptions: (items) => uniqueSorted(items.map((i) => getUrlHostname(String(i.metadata?.targetWebsite ?? "")))),
      match: (item, value) => getUrlHostname(String(item.metadata?.targetWebsite ?? "")) === value,
    },
  ],
};
```

这样"给这个模块加一个额外筛选条件"变成写一段声明式配置，而不是像本次
审计里那样：新建 store、新建 hook、改 `Library.tsx` 的 JSX、改
`CatalogFilter` 组件本身去支持 children——那一整套手工活现在被这一层
配置吸收掉了。

**不强制所有模块都套进这个配置形状**：如果某个模块的目录页需求特殊到
配置描述不了，允许它有一份自己的 `Library.tsx` 完全绕开
`CatalogLibraryPage`。不要为了"必须复用"而把配置类型越做越复杂去迁就
一个特例——这条和 `AGENTS.md` 里"不要为了减少重复而制造错误的公共抽象"
是同一个判断标准。

---

## Rust：`src-tauri/src/`

```text
src-tauri/src/
├── main.rs
├── lib.rs
├── commands/
│   ├── mod.rs
│   ├── catalog.rs                 # get_manifests(module_id) —— 一个命令服务所有模块
│   └── task.rs                    # create_task / get_task_by_uid / list_tasks / cancel_task
├── domain/
│   ├── mod.rs
│   ├── manifest.rs                # Manifest、ManifestStatus、ParamDescriptor、MethodDescriptor
│   ├── task.rs
│   ├── response.rs
│   └── error.rs
├── catalog/
│   ├── mod.rs
│   └── manifest_scanner.rs        # 错误必须收集，不得 Err(_) => continue 静默跳过
├── platform/
│   ├── mod.rs
│   ├── paths.rs                   # 含 plugins/<module_id> 的目录解析
│   └── python.rs                  # spawn + JSON-lines 协议读写
├── run/                            # 执行引擎（旧项目完全缺失的一层）
│   ├── mod.rs
│   ├── protocol.rs                # 子进程事件类型：Progress / Result / Error
│   └── runner.rs                  # 取 manifest + method + params → 起进程 → 转发事件
│                                   # 不感知 task 表，只认识"一次方法调用"
├── task/
│   ├── mod.rs
│   ├── repo.rs                    # 增补：update_progress / mark_running / mark_success /
│   │                               # mark_failed，均为 WHERE task_uid=? AND status=? 的条件更新
│   ├── service.rs                 # 创建时校验 manifest 是否存在（见下）
│   ├── mapping.rs
│   ├── scheduler.rs                # 并发限制队列
│   └── executor.rs                # 出队 → 调用 run::runner → 通过 task::service 持久化结果
└── database/
    ├── mod.rs
    ├── connection.rs               # 只开连接，不建表
    ├── schema.rs                   # V1_/V2_ 版本化常量，已发布版本不得修改
    ├── migrations.rs               # PRAGMA user_version 驱动，每版本一个事务
    └── state.rs
```

### 为什么不再有 `tools/`、`crawler/` 这两个顶层模块

旧项目里这两个目录本该放"运行时逻辑"（按 `AGENTS.md` 的原始设计），实际
上长期只放了三行转发读取清单的代码，跟 `catalog/` 职责重叠，审计里判定
为应当合并删除。新设计里，`catalog/` 只做"这个模块有哪些清单"，`run/`
只做"执行某个清单条目的某个方法"——两者天然不需要按 tool/crawler 再拆
出子目录，因为 `run::runner` 的实现**跟条目属于哪个模块无关**，它只认
"manifest + 参数 → 起 Python 进程 → 转发协议事件"这一件事，`AGENTS.md`
原本对 `tools/runner.rs`/`crawler/runner.rs` 的"两者不得依赖 task"这条
约束原样保留，只是不用为每个模块各写一份了。

### 为什么 `Source`/模块 ID 不再是封闭枚举

旧项目里 `Source`（原来叫 `ManifestSource`/`TaskSource`，审计中发现是
两个逐字段相同的重复枚举）是 `Tool | Crawler` 两个变体的封闭 Rust
`enum`。这个设计在只有两个模块时没问题，但路线图上明确写着还有 5 个
模块要加——每加一个模块就要：改这个枚举、改数据库 CHECK 约束、重新生成
ts-rs 绑定、检查所有 `match` 是不是漏了新分支。这是纯粹的、会随时间线
性增长的维护负担，不该用编译期封闭类型表达。

新设计里，**模块 ID 就是一个普通字符串**，等于 `plugins/` 下的目录名，
Rust 侧不维护任何硬编码的模块清单：

- `commands::catalog::get_manifests(module_id: String)` 直接拿这个字符
  串去 `plugins/<module_id>/` 找 manifest，目录不存在就返回空列表（和
  现有 `manifest_scanner.rs` "目录不存在不算错误"的行为一致，天然兼容）。
- `database/schema.rs` 里 `tasks.source` 列**不再声明 CHECK 枚举**，只
  保留 `NOT NULL`。真正的防线是 `task::service::create` 里"目标
  manifest 必须真实存在才能建任务"的校验（这条本来就该有，旧项目审计
  里发现它缺失，是 P1 级问题）——这条校验同时天然拦住了"建一个指向不
  存在模块的任务"，不需要额外的枚举/CHECK 做双重把关。

**这是一个明确的权衡，不是免费的午餐**：丢掉了"写错模块 ID 编译期报错"
这一层类型安全，换来的是"加模块不用碰 Rust 代码"。团队如果更看重前者、
预期模块数量长期就是个位数，完全可以退回封闭枚举——但要清楚这是在为
"以后不会有很多模块"这个假设下注。

### `category` 为什么不再是跨模块共享的枚举，`status` 为什么仍然是

这是本次审计里 Tribios 分类白名单漏掉 `utility` 导致 4 个工具消失那个
真实 bug 的直接修复。两者处理方式不同是有意为之，原因不同：

| 字段 | 旧设计 | 新设计 | 为什么不一样 |
|---|---|---|---|
| `status` | 封闭枚举 `available/disabled/unavailable` | **保持封闭枚举** | 这是一个真正跨模块通用、语义稳定的三态概念，审计里从未发现它有漂移问题 |
| `category` | 封闭枚举，且发现与真实数据不符 | **改为自由字符串** `String`，Rust 不再关心具体取值 | 分类是"每个模块自己的业务概念"，本质上应该由每个模块自己定义，不该被提升成一个所有模块共享、需要手动同步的封闭表 |

`category` 变成自由字符串后，"这个模块有哪些分类"这件事有两种来源，
**新设计选择前者、只用后者做展示层面的补充**：

1. **权威来源**：直接扫描该模块实际 manifest 里出现过的所有 `category`
   取值（永远不会漏，因为它就是数据本身）
2. **展示层可选补充**：`module.ts` 里的 `categoryLabels` 只负责把某个
   已知取值翻译成好看的中文标签、控制显示顺序；**没在这张表里的取值不
   会被过滤掉，只是展示原始字符串**——这正是把"忘记维护白名单"这个
   失败模式，从"用户看到的工具静默消失、毫无提示"降级成"用户看到一个
   没有中文翻译的分类标签"，后者是可见的、无害的降级，前者是隐蔽的
   数据丢失。

---

## Python：`plugins/`

```text
plugins/
└── <module-id>/
    └── <item-id>/
        ├── manifest.json
        ├── main.py
        └── ...                   # 仅该条目自己需要的模块/资源/测试，禁止跨条目 import
```

### manifest.json 契约（含运行契约，这是本次最核心的一处补强）

旧项目的 manifest 只能回答"这个条目怎么被发现和展示"，回答不了"怎么
运行它"——这直接导致：一旦要接执行功能，前端必须为每个工具手写参数
表单，`AGENTS.md` 待办事项里明确写着这会让"新增工具不需要改前端业务
代码"这个目标彻底落空。新契约把运行方式也变成数据：

```json
{
  "key": "batch-rename",
  "order": 20,
  "name": "批量重命名",
  "category": "file",
  "description": "按照统一规则快速整理文件名称。",
  "tags": ["批量处理", "文件整理"],
  "icon": "EditOutlined",
  "status": "available",
  "entry": "main.py",
  "methods": [
    {
      "name": "preview",
      "label": "预览",
      "params": [
        { "name": "targetDirectory", "label": "目标文件夹", "kind": "path", "required": true },
        {
          "name": "renameMode",
          "label": "重命名方式",
          "kind": "enum",
          "options": [
            { "value": "prefix", "label": "添加前缀" },
            { "value": "sequence", "label": "顺序编号" }
          ],
          "required": true
        },
        { "name": "prefix", "label": "前缀", "kind": "string", "default": "" }
      ]
    },
    { "name": "execute", "label": "执行", "params": ["...与 preview 相同结构..."] }
  ],
  "metadata": {}
}
```

字段相比旧设计的三处删减，都有真实证据支撑（不是猜的）：

| 删掉的字段 | 证据 |
|---|---|
| `eyebrow` | 全项目 `grep ".eyebrow"` 零消费点，页面上的 eyebrow 文案实际都是页面自己硬编码的，这个字段从建立起就没被读过 |
| `link` | P1-01：19 个手写的 `link` 路径没有一个匹配真实注册的路由。详情页路由应该由 `moduleId + key` **确定性推导**（例如 `/m/<moduleId>/<key>`），不该在 manifest 里手写一份、必须跟路由表手动保持同步的路径字符串 |
| `queueable` | 现状只用来渲染一个"可加入队列/不支持队列"的静态标签，没有网关任何真实行为。新设计里"所有方法调用统一走任务队列"，不存在"不排队"的执行路径，这个字段失去存在意义 |

新增的 `metadata: Record<string, unknown>`（可选）替代了旧设计里
`targetWebsite` 这种"个别模块需要、但被提升成所有 Manifest 都带的字段"
的做法——爬虫模块的站点信息放在 `metadata.targetWebsite` 里，工具模块
的 manifest 干脆不写这个 key。**这是有意牺牲一点类型安全换取扩展性**：
Rust/ts-rs 不需要为每个新模块的专属字段重新生成 `Manifest` 类型，坏处
是消费方要自己做运行时窄化（`String(manifest.metadata?.targetWebsite ?? "")`
这类写法），`catalog/types.ts` 的 `ExtraFilterConfig.deriveOptions`/`match`
两个回调就是消费 `metadata` 的标准位置。

### stdin / stdout 协议（旧项目完全没有规范化的部分）

请求（stdin，一次性写入一个 JSON 对象，随后关闭 stdin）：

```json
{ "method": "execute", "params": { "targetDirectory": "C:\\...", "renameMode": "sequence" } }
```

响应（stdout，**按行分隔的 JSON**，每行一个事件对象）：

```
{"type":"progress","done":3,"total":10,"message":"正在处理 c.jpg"}
{"type":"progress","done":10,"total":10}
{"type":"result","data":{"renamed":10,"unchanged":0}}
```

失败时最后一行改为：

```
{"type":"error","message":"目标文件夹不存在"}
```

规则很简单，跟旧项目里唯一一处真正实现过协议的 `tools/batch-rename`
一致，只是把"一次性打印最终结果"扩展成"可以打印任意条 progress"：

- **stdout 只允许出现这三种事件，一行一个 JSON，不允许夹杂人类可读文本**
- **stderr 只用于日志**，Rust 不解析它，只在失败时收集进日志方便排查
- 进程退出码是兜底信号（0/非 0），Rust 判断成功/失败**以最后一行事件
  类型为准**，不是以退出码为准——退出码和 stdout 冲突时以 stdout 为准
- Rust 侧（`platform::python` 读取 + `run::runner` 转发）把 `progress`
  事件转成 `task::repo::update_progress` 调用，把 `result`/`error`
  转成 `task::service` 的终态更新（`mark_success`/`mark_failed`，均需
  按 `AGENTS.md` 既有约定做 `WHERE task_uid=? AND status=?` 的条件更新
  保证并发原子性）

占位实现（还没写业务逻辑的条目）也必须遵守这个协议，哪怕只是立刻输出
一行 `{"type":"error","message":"尚未实现"}` 并以非 0 退出——**不要用
`print("尚未实现")` 打印人类可读文本到 stdout**，那样等执行引擎真的
接上时，这些占位条目会成为第一批解析失败的坏数据。

### Python 解释器怎么找

旧项目里 `platform::paths::python_executable()` 硬编码了一个从未被
创建过的路径（`runtime/core-venv/Scripts/python.exe`），是一处一直
存在却从未被验证过的死代码。新项目从一开始就把这件事说清楚，不要留
"以后再说"的空路径：

- **开发环境**：约定一个仓库根目录下的 `.venv/`（gitignore），配一个
  简单的 setup 脚本创建它；`workspace_dir()` 已经能正确区分开发/发布
  两种场景，直接在其基础上拼 `.venv/Scripts/python.exe`（Windows）或
  `.venv/bin/python`（POSIX），**两个平台分支都要写，不要只写一个**
- **发布环境**：通过 Tauri 的 `bundle.resources` 把便携版 Python 打进
  安装包，用 Tauri 的路径 API（而不是手写 `current_exe()` 再拼相对
  路径）解析资源目录——旧项目的 `tauri.conf.json` 从未声明过
  `resources`，`tools/`、`crawler/` 目录发布后大概率打不进安装包，这
  个坑要在打包前用一次真实的 `tauri build` 验证，不要只靠开发环境验证

---

## 跨语言契约一览

| 契约 | 真实来源 | 同步方式 |
|---|---|---|
| `Manifest`、`Task`、`ApiResponse` 等类型 | Rust `domain/*.rs` | `ts-rs` 生成，生成前先删旧文件（同一 `export_to` 目标是增量写入，不删会残留） |
| manifest.json 的字段集合/类型 | Rust `Manifest` struct | 校验脚本从 struct 源码提取规则，反过来检查每份 manifest.json；改 Rust 字段后必须重跑 |
| 参数类型（`ParamDescriptor.kind`） | Rust `domain/manifest.rs` 的 `ParamKind` 枚举 | ts-rs 生成对应 TS 联合类型，`run/ParamField.tsx` 按这个类型做穷尽匹配（缺一个分支编译器应该报错，用 `never` 兜底检查） |
| Python 进程事件（progress/result/error） | 本文档"stdin/stdout 协议"一节 | 没有代码生成，靠文档 + 两端各自的手写类型（Rust `run::protocol::Event`，Python 端没有强类型，靠约定） |
| icon 白名单 | 前端 `AppIcon` 组件的注册表 | 校验脚本读取该文件反查每份 manifest 的 `icon` 是否在白名单里 |
| 模块清单/分类取值 | 对应 `plugins/<module-id>/*/manifest.json` 的真实数据 | **无需同步**——不再有一份需要手动维护、可能漂移的清单，这是本次设计刻意消除的一类契约 |

生成的 TypeScript 文件必须同时出现在格式化工具的忽略名单里（否则会被
格式化工具悄悄改写，`AGENTS.md` 里"生成文件禁止手改"这条规则会在工具
层面被绕过——这是旧项目真实踩过的坑）。

---

## 依赖方向

前端：

```text
app → router → portal / modules → catalog / tasks / run → shared
```

- `modules/<id>/` 可以依赖 `catalog/`、`tasks/`、`run/`、`shared/`
- `catalog/`、`tasks/`、`run/` 之间**不互相依赖**（`tasks/runTool.ts`
  依赖 `run/` 提起任务创建请求是唯一允许的例外，因为"提交参数创建任务"
  本质上是任务功能的入口，不是运行引擎本身的一部分）
- `shared/` 不依赖以上任何一层
- `portal/` 只允许依赖 `modules/registry.ts` 暴露的元数据，不允许引用
  任何模块内部的页面/状态

Rust：

```text
commands → task → run → catalog → platform
task/repo → database
所有层 → domain
```

这两条依赖图都应该在 `.oxlintrc.json`（前端）里用
`no-restricted-imports` 落成可执行规则，不要只停留在文档——旧项目这
条规则是全项目零违反的部分，恰恰是因为它被写成了 lint 规则而不是只写
在文档里。新增顶层目录（`catalog/`、`tasks/`、`run/`）后要同步把
override 规则补全。

---

## 建议的搭建顺序

不要一次性把整套架构建完。按这个顺序推进，每一步都应该是一个能独立
验证、能跑起来的状态：

1. **骨架**：`main.tsx`/`App`/`router`/`portal` + 一个空模块，Tauri 能
   启动，SQLite 迁移能跑通（`migrate` 到 `LATEST_VERSION`，含存量库
   迁移测试）
2. **只读目录浏览**：`commands::catalog::get_manifests` + 前端
   `CatalogLibraryPage` 能显示一个模块的清单，**先不接执行**，`run/`
   `platform::python` 都还不用写
3. **任务表 + 任务队列 UI**：`task/repo`/`service`/`commands` 到位，
   `TaskQueue` 组件能显示任务列表；可以先用一个临时命令手工插入几条
   假任务验证 UI，不依赖真实执行
4. **Python 执行引擎**：`platform::python` + `run::runner` +
   `task::executor` + 协议解析，`task/repo.rs` 补上
   `update_progress`/`mark_success`/`mark_failed`
5. **参数表单闭环**：`run/RunDialog.tsx` + manifest 的 `methods`/`params`
   落地，走通"选工具 → 填参数 → 提交 → 任务队列显示进度 → 完成"完整
   链路
6. **加第二个模块**，专门验证"新增模块只需要加目录和 manifest，不碰
   业务代码"这条目标是否真的成立——如果发现还是要改 `catalog/` 或
   `run/` 里的代码，说明前面某处的抽象没做对，回头修，不要将就
7. 视需要再加：`task/scheduler.rs` 并发限制、任务取消/暂停、
   `catalog/registry.rs` 高频查询索引——这几个在 `AGENTS.md` 的原则
   里本来就是"按需创建"，不要在还没有真实需求时预先建空壳

---

## 旧项目 → 新设计 对照表

给已经熟悉现有代码库的人一个快速映射，明确"这个概念去哪了"。

| 旧项目里的东西 | 新设计里对应的位置 | 变化说明 |
|---|---|---|
| `src/Atrium/` | `src/portal/` | 改名，语义更直接 |
| `src/modules/<M>/shared/{api,stores}` | `src/modules/<M>/{api.ts,stores.ts}` | 已在本轮重构中拍平，新设计延续 |
| `src/shared/components/catalog/*` | `src/catalog/components/*` | 从"共享组件里的一个子分类"提升为顶层功能目录 |
| `src/shared/components/display/TaskQueue` | `src/tasks/TaskQueue.tsx` | 同上 |
| `src/shared/domain/catalog-filter.ts`（曾经零调用点） | `src/catalog/filterEngine.ts`，由 `useCatalogData.ts` **唯一**调用 | 不再是"页面可能记得调用、也可能不调用"的可选共享函数，而是目录页实现本身的一部分 |
| 两份手写的 `Library.tsx` | `catalog/CatalogLibraryPage.tsx`（一份实现）+ 各模块 `module.ts`（配置） | 消除"改一处忘改另一处"的重复维护成本 |
| `ManifestSource` / `TaskSource`（封闭枚举） | 模块 ID，普通字符串 | 见"为什么 Source 不再是封闭枚举" |
| `ManifestCategory`（封闭枚举，曾经与真实数据不符） | `category: String`，跨模块不再共享取值集合 | 见"category 为什么不再是共享枚举" |
| `src-tauri/src/tools/`、`crawler/`（曾经只做转发） | 已删除，职责并入 `catalog/` 与新增的 `run/` | |
| `manifest.link` | 不再存在，路由由 `moduleId + key` 推导 | |
| `manifest.eyebrow` | 不再存在（零消费点的死字段） | |
| `manifest.queueable` | 不再存在（所有执行统一走任务队列） | |
| `tools/`、`crawler/`（Python 根目录，按域名各建一个） | `plugins/<module-id>/`（统一一个根目录） | 新增模块不再需要新建顶层目录 |
| `platform::paths::python_executable()`（指向从未创建的路径） | 明确的开发/发布两套解析规则，见"Python 解释器怎么找" | |
