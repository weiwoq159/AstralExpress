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

### `module_id` 是封闭枚举 `ModuleId`

早期草案设想过路线图上还有 5 个模块要加，因此把 `module_id` 留成开放
字符串——每加一个模块只用加个 `plugins/<name>/` 目录，不用碰 Rust 代码。
这个路线图后来确认已经过时：当前明确就只做 `tools`/`crawler` 两个模块，
不再有"随时加新模块"的扩展需求，开放字符串换来的"免改代码"能力也就没
了用武之地，反而让 `module_id` 能不能传非法值这件事在编译期查不出来。

所以 `domain::module::ModuleId`（`Tools`/`Crawler` 两个变体）现在是封闭
Rust `enum`——贯穿 Tauri IPC（`serde(rename_all = "lowercase")`）、SQLite
（`ToSql`/`FromSql`，仍是 `TEXT` 列，取值跟枚举的 `as_str()` 保持一致）、
`plugins/<as_str()>/` 目录名三层边界，写法上跟 `domain::task::TaskStatus`
保持一致。如果以后真的又要加新模块，代价就是显式改这个枚举、让编译器把
所有漏掉的 `match` 分支标红——这次是有意识地选择用编译期检查换开放性。

`commands::catalog::get_manifests(module_id: ModuleId)` 直接拿枚举转成
的目录名去 `plugins/<as_str()>/` 找 manifest，目录不存在就返回空列表
（和 `manifest_scanner.rs` "目录不存在不算错误"的行为一致，天然兼容，
只是现在传进来的值本身已经不可能是非法值了）。

`database/schema.sql` 里 `tasks.module_id`/`manifest_configs.module_id`
两列仍然是 `TEXT`，没有加 CHECK 约束——数据库层面的合法性不是防线，
`ModuleId::FromSql` 在读出非法字符串时会直接报错，加上
`task::service::create` 里"目标 manifest 必须真实存在才能建任务"的
校验（这条本来就该有，旧项目审计里发现它缺失，是 P1 级问题），两层
一起保证了运行时不会出现指向不存在模块的任务。

**这是一个明确的权衡，不是免费的午餐**：选封闭枚举意味着如果以后真要
加新模块，得显式改这个枚举、重新生成 ts-rs 绑定、检查所有 `match` 是
不是漏了新分支（虽然数据库列本身没有 CHECK 约束，但读出非法值会在
`FromSql` 处直接报错，相当于把"允许哪些取值"这件事从"数据库约束"搬到
了"枚举定义"）——这是当前"模块数量固定就两个"这个前提下换来的编译期
安全，前提变了就要重新评估。

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

### stdin / stdout 协议

> 以下是 `run::protocol::ExecutorMessage`（配合 `run::executor::execute_process`
> 读取、`run::python::entry_script_path` 定位入口脚本）实际实现并跑通测试的版本，
> **协议以代码为准**，这里只是把实现出来的规则写清楚。早期草案先后设想过
> `progress`/`result`/`error` 三事件（失败走 stdout），后来改成 `success`/
> `process`/`download`/`db` 四事件（失败只走 stderr+退出码），最终定型为下面
> 这套统一 `{"type", "payload"}` 信封、多补了一个 `failed` 事件的版本。

请求（stdin，一次性写入一个 JSON 对象，随后关闭 stdin）：

```json
{ "method": "execute", "payload": { "targetDirectory": "C:\\...", "renameMode": "sequence" } }
```

响应（stdout，**按行分隔的 JSON，一行一个事件**）统一信封：

```json
{ "type": "<事件名>", "payload": { ... } }
```

这正是 serde 的 adjacently tagged enum 表示法，Rust 端直接 derive
`#[serde(tag = "type", content = "payload")]` 解出来，不用手写字段抽取。
支持的 `type`：

| `type` | `payload` 字段 | 作用 |
|---|---|---|
| `process` | `currentIndex`、`total`（均可选，数字或数字字符串都收） | 汇报中间进度，映射到 `task::repo::update_progress`；缺的字段保留数据库里原值不动 |
| `success` | `message`（可选字符串）、`data`（可选任意 JSON） | 任务**成功**结束的终态；`data` 存进 `result_json`，缺省时退化成 `{"message": message}` |
| `failed` | `message`（必填字符串） | 任务**失败**结束的终态；`message` 就是失败原因，不再需要走 stderr |
| `download` | `downloadUrl`、`downloadPath`、`downloadName`（均必填） | 委托 Rust 发起下载，脚本自己不摸网络；下载失败只记日志警告，**不会**让任务失败 |
| `db_insert` | `tableName`、`value`（均必填） | 委托 Rust 写数据库，脚本自己不摸数据库连接；`tableName` 必须在白名单里（`run::db_writer`），写失败只记日志警告。目前只支持插入/替换，没有单独的 `action` 字段——以后要支持更新/删除，加 `db_update`/`db_delete` 新事件，不要在这个事件里塞字符串分支 |
| 没有 `type` 字段 | — | 按旧协议兼容处理：整行 JSON 原样当最终结果（`LegacyResult`，等同一条 `success`），用于还没迁移到这套消息协议、只会 `print(json.dumps(result))` 的脚本 |

**`type` 字段存在但值不认识、或 `payload` 缺必填字段的行，不会退化成
`LegacyResult`**——只有完全没有 `type` 字段的行才按旧协议兼容。这是刻意
的：把一条格式错误的新协议消息悄悄当成"成功结果"存下来，比直接丢弃更
危险，所以这种行只记一条警告日志跳过，不影响任务终态。

`success`/`failed`/没有 `type` 字段的行都是**终态**，以**最后一条终态
消息为准**——跟进程退出码无关；`process`/`download`/`db_insert` 不是
终态，不会结束 stdout 读取循环。也就是说退出码和 stderr **只在脚本
从头到尾没输出过任何终态消息时才当兜底**（比如中途未捕获异常崩溃）：
这种情况下非 0 退出码 + stderr 文本作为失败原因，退出码是 0 但没有
终态消息则统一判失败，错误信息固定为 `脚本未输出结果`。

Rust 侧对应关系：`run::executor::execute_process` spawn 子进程、
`run::executor::read_stdout` 按行调 `ExecutorMessage::parse` 分发，
`process`→`task::repo::update_progress`，`success`/`LegacyResult`/
`failed`→记为终态（`Outcome::Success`/`Outcome::Failed`，最后一条覆盖
前一条），进程退出后再按上一段的优先级决定最终传给 `task::repo::
mark_success`/`mark_failed` 的到底是哪一个。

### Python 端错误处理规范

- 能确定失败原因时，优先打一行 `{"type": "failed", "payload": {"message": "..."}}`
  到 stdout 并以非 0 退出码退出——这是首选方式，Rust 侧直接拿 `message`
  当失败原因，不用再从 stderr 里拼。
- 兜底方式（比如未捕获异常导致进程直接崩溃、来不及打印终态行）：把人类
  可读的错误信息打到 **stderr**，并保证进程以非 0 退出码结束；Rust 只在
  从头到尾没收到任何终态消息时才会用这条 stderr 文本当失败原因。
- **除了 `{"type": ..., "payload": ...}` 这套协议行，stdout 上不要出现
  任何东西**——哪怕是一句人类可读文本，那样的行既解析不出已知类型，也
  没有 `type` 字段（所以不会被当成 `LegacyResult`），只会被当噪音丢弃并
  记一条警告日志，白白丢失这条错误信息。
- 占位实现（还没写业务逻辑的插件）的最小写法：

  ```python
  import json

  def main() -> None:
      print(json.dumps({"type": "failed", "payload": {"message": "音频转码尚未实现。"}}, ensure_ascii=False))
      raise SystemExit(1)

  if __name__ == "__main__":
      main()
  ```

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
| Python 进程事件（process/success/failed/download/db_insert） | 本文档"stdin/stdout 协议"一节 | 没有代码生成，靠文档 + 两端各自的手写类型（Rust `run::protocol::ExecutorMessage`，Python 端没有强类型，靠约定） |
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
