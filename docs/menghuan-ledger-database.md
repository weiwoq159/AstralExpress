# 梦幻账本：数据库表需求分析

依据：`docs/menghuan-ledger-prototype.html`（交互原型）与当前的 `src-tauri/src/database/schema.sql`。
范围：只看原型里出现的功能，不包含原型之外的设想。标注"推测"的地方是我从原型行为推出来的，没有原型里的直接证据。

## 结论

**一共需要 4 张表：1 张已有，3 张新增。** 如果以后要按账号做统计，再加第 5 张。

| # | 表 | 状态 | 作用 |
|---|---|---|---|
| 1 | `mhxy_items` | 已有 | 物品目录（含个人自定义物品） |
| 2 | `ledger_days` | 新增 | 每个日期一行：区服、金价、账号数、计时状态 |
| 3 | `ledger_day_items` | 新增 | 某一天记入的物品、数量、当时的单价 |
| 4 | `ledger_sessions` | 新增 | 某一天的每一段结算记录 |
| （可选） | `ledger_session_accounts` | 暂不建 | 每段结算里每个账号各自的金额 |

另外 `mhxy_items` 还需要**加一列**：`is_favorite`（见下文）。

**不需要建表的东西：**
- 区服：原型里是 4 项写死的列表，当日只引用区服标识。做成代码常量，和分类 `ItemCategory` 的处理一致。
- 账号：原型里账号只是一个数量（1–20），没有账号名称、没有账号实体。
- 合计收益、游戏币实收、物品估值、人民币参考值、每小时收益、物品种数、待计价项数：全部是现算的派生值，不入库。
- 分类：已经是 Rust 枚举 `ItemCategory`，不建表。
- 价格历史：原型没有这个功能。`schema.sql` 里"历史价格另建表记录"的那句注释，是以后的事，现在不做。

## 数据关系

```
mhxy_items  1 ──── n  ledger_day_items  n ──── 1  ledger_days  1 ──── n  ledger_sessions
```

主键日期用 `TEXT 'YYYY-MM-DD'`，一天一行，原型里 `store.days[date]` 就是这个结构。数据库已经开了 `PRAGMA foreign_keys = ON`（`database/state.rs:13`），外键可以直接用。

## 各表字段

### 1. `mhxy_items`（已有，加一列）

加 `is_favorite INTEGER NOT NULL DEFAULT 0`。
证据：原型 `baseCatalog` 里每个物品有 `favorite` 标记，"快速记入"的第一个标签就是"常用"。目前表里没有地方存这个信息，也没法从其他字段推出来。

注意：`schema.sql` 用的是 `CREATE TABLE IF NOT EXISTS`，每次启动执行，**不会给已存在的表加列**。本机数据库已有这张表，加列需要单独写一条 `ALTER TABLE`（或者重建表），这个项目目前没有迁移机制。

原型里的 `art`、`tone`（物品插画和色调）对应现在的 `icon` 字段，不需要额外的列。原型里的"个人"分类对应 `category = 'custom'`。

### 2. `ledger_days`

| 字段 | 类型 | 说明 |
|---|---|---|
| `date` | TEXT 主键 | `YYYY-MM-DD` |
| `server` | TEXT NOT NULL | 区服标识，如 `zijin`，取值由代码常量定义 |
| `gold_price` | REAL NOT NULL | 当日金价，元 / 3000 万两，大于 0、不超过 1,000,000 |
| `accounts` | INTEGER NOT NULL DEFAULT 1 | 当日账号数，1–20 |
| `segment_elapsed_seconds` | INTEGER NOT NULL DEFAULT 0 | 尚未结算的当前一段已计的秒数 |
| `duration_adjustment_seconds` | INTEGER NOT NULL DEFAULT 0 | "修正总时长"的偏移，可为负，绝对值不超过 3,600,000 |
| `created_at` / `updated_at` | INTEGER | Unix 秒，与 `mhxy_items` 一致 |

当日总时长 = 各段 `seconds` 之和 + `segment_elapsed_seconds` + `duration_adjustment_seconds`，现算。

**计时的"正在运行"状态不入库。**原型在页面隐藏或关闭时会暂停计时（`pauseTimer`），离线时间不计入，所以只需要保存已累计的秒数。（推测：桌面版如果要在应用关闭后继续计时，才需要加 `segment_started_at`；原型里没有这个需求。）

### 3. `ledger_day_items`

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | INTEGER 主键 | 保持清单的记入顺序 |
| `date` | TEXT NOT NULL | 外键 → `ledger_days(date)`，`ON DELETE CASCADE` |
| `item_id` | INTEGER NOT NULL | 外键 → `mhxy_items(id)`，`ON DELETE RESTRICT` |
| `quantity` | INTEGER NOT NULL | 1–99,999 |
| `unit_price` | REAL | 记入时的单价快照，`NULL` 表示未计价（不计入收益）；可以在清单里直接改 |

唯一约束：`UNIQUE (date, item_id)`。原型校验了同一天同一物品不能出现两行，原型里每天最多 500 行。

**为什么单价要存快照，而不是每次现取参考价：**账本是历史记录，以后参考价变了，过去某天的收益不应该跟着变。原型的 `row.price` 也是这样处理的。

### 价格：不区分"手改"与"非手改"

原型里有一套"手填价"机制：行上的"手填价"标签、`row.manual`、`day.prices`（当日物价单）、`gold_manual`，目的是让"手改过的价格"在切换区服、重算价格时被保留。按你的要求，这套区分整体不做：

- 不建 `ledger_day_prices`，`ledger_day_items` 也没有 `price_manual`，`ledger_days` 也没有 `gold_manual`。
- 记入物品时，`unit_price` 取当时 `mhxy_items.reference_price` 的值作为快照；之后在清单里直接改这一行的 `unit_price` 即可。
- 因为单价是快照，改目录里的参考价**不会**影响已经记过的日期，历史收益保持稳定。
- 原型里的"修改物价单"弹窗（批量改当日所有物品的价格）失去了存放位置。需要你定：要么这个入口改成直接修改 `mhxy_items.reference_price`（全局生效，只影响之后新记入的物品），要么不做这个入口。

### 4. `ledger_sessions`

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | INTEGER 主键 | |
| `date` | TEXT NOT NULL | 外键 → `ledger_days(date)`，`ON DELETE CASCADE` |
| `name` | TEXT NOT NULL | 本段备注，最多 40 个字符 |
| `seconds` | INTEGER NOT NULL | 本段时长，大于等于 0 |
| `accounts` | INTEGER NOT NULL | 本段账号数，1–20（原型里记在每一段上，后续改账号数不影响已结算的段） |
| `amount` | REAL | 本段游戏币实收，万两；`NULL` 表示"稍后补填金额" |
| `account_amounts` | TEXT | 逐号录入时的金额数组（JSON），总金额模式为 `NULL` |
| `ended_at` | INTEGER NOT NULL | 结算时间，Unix 秒 |

`ended_at`：原型只存了 `HH:MM` 字符串。这里存完整的时间戳更好，显示时再格式化。

一致性规则：当 `account_amounts` 不为空时，数组长度必须等于 `accounts`，`amount` 等于数组之和。这类跨列规则 SQLite 的 `CHECK` 写起来很勉强，放在 service 层校验，数据库只用 `json_valid` 做兜底。

## 为什么逐号金额不单独建表

证据：原型对 `accountAmounts` 的使用只有两处：编辑那一段时回填到输入框，以及求和得出 `amount`。没有任何地方按账号汇总、排序或查询。放在 `ledger_sessions` 的一列里足够。

如果以后要做"按账号统计收益"，需要新增第 5 张表 `ledger_session_accounts (session_id, account_no, amount)`，把 JSON 列拆出来。这个迁移是机械的，可以推迟到真正需要时。

## 需要你决定的问题

1. **金额存 REAL 还是整数。**现在 `mhxy_items.reference_price` 用 `REAL`，加上两位小数的 `CHECK`。账本会做大量"单价 × 数量"再求和，浮点误差会累积。更稳妥的做法是用整数存"百分之一万两"（即 `amount_cents`）。如果选整数，`mhxy_items.reference_price` 也应该一起改，否则两张表口径不一致。我倾向整数，但这会改动已有表，所以需要你确认。
2. **金价的来源。**原型里每个区服有一个"示例金价"，并且没有真实数据源。既然不区分手改和非手改，`ledger_days.gold_price` 就是当天的一个普通数值，由用户填写；切换区服不会自动改它。需要你确认：新的一天的默认金价取"上一天的金价"，还是每次都要手填。
3. **删除物品的策略。**`ledger_day_items` 对 `mhxy_items` 用 `RESTRICT`，意味着已经被账本引用的物品不能删除。后端的删除命令（`service::delete`）已经写好但还没暴露给前端。如果要允许删除，可以改成给 `mhxy_items` 加"已停用"标记（软删除），而不是真删。
4. **单位口径不一致。**`schema.sql` 里 `reference_price` 的注释写的是"单位：游戏币"，而原型里所有金额的单位是"万两"。需要统一写法，建议所有金额都按万两。
5. **日期的时区。**`ledger_days.date` 是用户本地日期，不是 UTC 日期。凌晨跨天时按本地日期归属，由前端传入，后端不自己取当前日期。

## 落地顺序（建议）

1. 先定第 1 条（金额类型），因为它会同时改已有表。
2. `mhxy_items` 加 `is_favorite`，并为已有数据库写好 `ALTER TABLE` 的处理方式。
3. 建 `ledger_days`、`ledger_day_items`、`ledger_sessions`，写进 `schema.sql`，沿用 `IF NOT EXISTS`。
4. 各表按现有 `items` 的分层（repo → service → commands）实现，类型继续由 ts-rs 生成给前端。
