# 梦幻商会店铺物价：数据库表设计

依据：`docs/mhxy-guild-shop-prices.html`（交互原型）、当前的 `src-tauri/src/database/schema.sql`，以及已确定的需求。

## 已确定的需求

- 只有一个商会，不建商会表。
- 店铺有游戏内的数字编号和名字，并记录所在的大区和服务器编号。
- 每个店铺 10 个货架；每个货架 1～2 种道具，同一货架上的道具共用一个价格。
- 同一家店的不同货架可以卖同一种道具。
- 价格单位是"两"，整数。
- 每个店铺有一个折扣，全店货架共用；货架上记录的是折前价，**比较和排序用的是折后价**。
- 不记录价格历史，只保留当前价格。
- 主要用法：选定一种道具，按折后价给店铺排序。

## 结论：3 张新表，不改已有表

| # | 表 | 作用 |
|---|---|---|
| 1 | `guild_shops` | 店铺：大区、服务器编号、店铺编号、名字、折扣 |
| 2 | `guild_shelves` | 货架：归属店铺、第几号、统一售价 |
| 3 | `guild_shelf_items` | 货架上摆放的道具（1～2 种），引用已有的 `mhxy_items` |

```
guild_shops 1 ── n guild_shelves 1 ── n guild_shelf_items n ── 1 mhxy_items（已有）
```

`mhxy_items` 不需要改动。新表全部用 `CREATE TABLE IF NOT EXISTS`，没有 `ALTER TABLE`，和启动时整体执行 `schema.sql` 的方式兼容。外键已经开启（`database/state.rs:13`）。

## 表结构

```sql
-- 商会店铺。商会只有一个，不单独建表。
CREATE TABLE IF NOT EXISTS guild_shops (
    id               INTEGER PRIMARY KEY,
    -- 店铺所在的大区与服务器标识（游戏内的整数 id）。店铺编号只在一个服务器内有意义，
    -- 不同服务器的价格也不可直接比较，所以查询时必须带上这两列。
    area_id          INTEGER NOT NULL CHECK (area_id > 0),
    server_id        INTEGER NOT NULL CHECK (server_id > 0),
    -- 游戏内的店铺编号，用户据此在游戏里找到这家店，在同一服务器内唯一。
    number           INTEGER NOT NULL CHECK (number > 0),
    -- 名字不设唯一：是否会重名没有验证过，编号才是店铺的唯一标识。
    name             TEXT    NOT NULL CHECK (name <> ''),
    -- 店铺折扣，存优惠的百分比：10 表示优惠 10%，0 表示不优惠。全店货架共用。
    -- 比较价格时一律用折后价 = 货架价 × (100 - discount_percent) / 100，所以折扣必须和店铺存在一起。
    discount_percent INTEGER NOT NULL DEFAULT 0 CHECK (discount_percent BETWEEN 0 AND 99),
    created_at       INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at       INTEGER NOT NULL DEFAULT (unixepoch()),
    -- 同时覆盖"按服务器筛选店铺"的查询，不需要另建索引。
    UNIQUE (area_id, server_id, number)
) STRICT;

-- 货架。只有摆了道具的货架才有一行，空货架不存；"每店 10 个货架"是代码常量。
CREATE TABLE IF NOT EXISTS guild_shelves (
    id         INTEGER PRIMARY KEY,
    shop_id    INTEGER NOT NULL REFERENCES guild_shops (id) ON DELETE CASCADE,
    position   INTEGER NOT NULL CHECK (position BETWEEN 1 AND 10),
    -- 货架上所有道具共用的售价，单位：两。
    price      INTEGER NOT NULL CHECK (price >= 0),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE (shop_id, position)
) STRICT;

-- 货架上的道具。slot 限定为 1、2，使"最多两种"由数据库保证。
CREATE TABLE IF NOT EXISTS guild_shelf_items (
    shelf_id INTEGER NOT NULL REFERENCES guild_shelves (id) ON DELETE CASCADE,
    slot     INTEGER NOT NULL CHECK (slot IN (1, 2)),
    item_id  INTEGER NOT NULL REFERENCES mhxy_items (id) ON DELETE RESTRICT,
    PRIMARY KEY (shelf_id, slot),
    -- 同一货架上不能放两个相同的道具；不同货架之间不限制。
    UNIQUE (shelf_id, item_id)
) STRICT;

CREATE INDEX IF NOT EXISTS idx_guild_shelf_items_item ON guild_shelf_items (item_id);
```

## 设计理由

- **货架单独成表。**"同一货架的道具共用一个价格"是核心约束。价格放在货架行上，这个约束由结构保证；如果放在道具行上，同一货架的两行各存一份，迟早改出不一致。
- **道具用外键引用 `mhxy_items`，不存名字文本。**名字写错一个字会变成另一种道具，比价时漏数据；物品名的唯一来源应该是物品库；按 `item_id` 查询可以走索引。
- **大区和服务器编号直接放在店铺行上,不另建表。**这两个值只用来定位和筛选,没有别的属性要挂在它们上面;单独建表只会多一次联表。店铺编号因此不再全局唯一,唯一约束改为 `(area_id, server_id, number)`。
- **空货架不存行。**不需要建店时预建 10 行，也不会出现"有货架行但没有道具"的中间状态。
- **"同店不同货架可以卖同一种道具"不需要任何额外约束。**表上没有 `UNIQUE (shop_id, item_id)`，这是有意的。
- **`item_id` 用 `ON DELETE RESTRICT`。**已经被货架引用的物品不能被删除，和账本文档里 `ledger_day_items` 的处理一致。删除物品的策略（硬删还是停用）是账本文档里待定的问题，这里沿用它的结论。

## 不入库的值

下列值都从上面三张表现算：

- 折后价（货架价 × (100 - 折扣) / 100）
- 每家店某道具的最低折后价
- 全商会某道具的最低折后价、最高折后价
- 在售某道具的店铺数
- 店内已摆货架数

## 核心查询：按某道具给店铺排序

同一家店有多个货架卖同一道具时，取该店的最低价，每家店只出现一次。排序用折后价：

```sql
SELECT s.id, s.number, s.name, s.discount_percent,
       MIN(sh.price) AS list_price,                          -- 折前价
       MIN(sh.price) * (100 - s.discount_percent) AS discounted_x100 -- 折后价 × 100，整数，排序用
FROM guild_shelf_items i
JOIN guild_shelves sh ON sh.id = i.shelf_id
JOIN guild_shops   s  ON s.id  = sh.shop_id
WHERE i.item_id = ?1 AND s.area_id = ?2 AND s.server_id = ?3
GROUP BY s.id
ORDER BY discounted_x100 ASC, s.number ASC;   -- 降序时把 ASC 换成 DESC，该方向由后端白名单决定，不拼接用户输入
```

**为什么用"折后价 × 100"排序。**同一家店内折扣相同，`MIN(price)` 乘以 `(100 - 折扣)` 就是该店的最低折后价；乘积是精确的整数，排序时不涉及小数和舍入，所以不会因为舍入规则让两家店并列或颠倒。展示用的折后价 = `discounted_x100 / 100`，怎么取整见"仍然悬而未决"。

店铺详情就是按 `shop_id` 取出它的货架和每个货架上的道具，按 `position` 排序。

## 数据库管不了的规则（放在 service 层校验）

这些是跨行、跨表的规则，SQLite 的 `CHECK` 表达不了，写在 service 层，并在一个事务内保存一家店的全部货架：

1. 每个货架至少有一个道具；道具全部清空时，同时删除这个货架行。
2. `slot` 从 1 开始连续：不允许只有 `slot = 2` 而没有 `slot = 1`。
3. 保存店铺时，对 `guild_shelves` 和 `guild_shelf_items` 采取"整店替换"（先删后插），比逐行比对简单，也不会遗留脏数据。
4. 大区、服务器编号、店铺编号、名字、价格、`position`、`item_id` 都来自前端，使用前校验，SQL 一律参数化。
5. 数量上限（`position` 范围、每货架道具数）用同一组常量，Rust 和前端共用，避免两边数字不一致。

## 仍然悬而未决的三点

**折扣的精度与折后价的取整。**折扣目前按"优惠的整数百分比"存（10 = 优惠 10%，范围 0～99），能表示优惠 10%、15%，但表示不了优惠 12.5%。0～99 的上限是我定的：100 会让折后价变成 0，我认为不会出现；这点没有验证过。游戏里的折扣是否有更细的档位、折后价是向下取整、四舍五入还是保留小数，我也没有验证过。排序用的是精确的"折前价 × (100 - 折扣)"，不受取整影响；影响的只是界面上展示的折后价数字。需要你确认这两点。

**大区的取值与显示名。**`area_id` 和 `server_id` 都是游戏内的整数标识,目前只校验大于 0。界面上要显示大区名字和服务器名字时,需要一份"标识 → 名字"的对照表。如果大区是有限的固定列表,应该像账本文档里的区服一样,做成 Rust 常量并在 service 层按白名单校验,前端用同一份列表做下拉,避免录入不存在的标识。大区的完整列表我没有验证过,需要你确认是否固定,以及要不要显示名字。

**金额口径与已有表不一致。**这三张表的价格是 `INTEGER`、单位"两"；但已有的 `mhxy_items.reference_price` 是 `REAL`，最多两位小数，注释写的单位是"游戏币"。账本文档里"金额存 REAL 还是整数""单位是万两还是游戏币"这两个问题也还没定。

这不影响本设计的落地，因为商会这三张表不和 `reference_price` 做运算。但如果以后要拿商会最低价和参考价比较，或者把它们放在一起展示，两边口径必须先统一。

## 落地顺序（建议）

1. 把三张表加到 `schema.sql`，沿用 `IF NOT EXISTS`。
2. 按现有 `items` 的分层实现：`repo`（SQL）→ `service`（上面的校验与事务）→ `commands`（IPC），类型继续由 ts-rs 生成给前端。
3. 前端把 `docs/mhxy-guild-shop-prices.html` 的原型接到真实命令上，道具名输入改成从物品库选择。
