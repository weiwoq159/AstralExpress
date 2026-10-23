-- 梦幻西游道具表。本文件在每次启动时整体执行，所有语句必须幂等（IF NOT EXISTS）。
CREATE TABLE IF NOT EXISTS mhxy_items (
    id              INTEGER PRIMARY KEY,
    -- 道具名，同时作为 id 的映射键（按名称查 id），因此必须唯一。
    name            TEXT    NOT NULL UNIQUE CHECK (name <> ''),
    -- 图标文件相对于应用数据目录的路径；文件本身不入库。
    icon            TEXT,
    -- 分类取值由 Rust 的 ItemCategory 定义并校验，这里不加 CHECK，新增分类时无需迁移表。
    category        TEXT    NOT NULL DEFAULT 'misc',
    description     TEXT    NOT NULL DEFAULT '',
    -- 参考价，单位：游戏币，最多两位小数。摆摊价随时间波动，历史价格另建表记录，不放在这里。
    reference_price REAL CHECK (reference_price IS NULL OR (reference_price >= 0 AND reference_price = round(reference_price, 2))),
    created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
) STRICT;

CREATE INDEX IF NOT EXISTS idx_mhxy_items_category ON mhxy_items (category);

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
    -- 货架上所有道具共用的售价，单位：两。价格只放在这里，不下放到道具行，
    -- 这样"同一货架价格相同"由表结构保证。
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

-- 藏宝阁大区与服务器列表，由 plugins/crawler/mhxy-cbg-services 爬取后写入。
-- 本机已有同名表，所以这里的定义保持和现有表一致；写入方不在本仓库，约束待确认后再加。
-- updated_at 是写入方给的 ISO 8601 UTC 文本（如 2026-09-30T15:27:09.297Z），不是 Unix 秒。
CREATE TABLE IF NOT EXISTS mhxy_cbg_areas (
    area_id    INTEGER,
    name       TEXT,
    updated_at TEXT
);

CREATE TABLE IF NOT EXISTS mhxy_cbg_servers (
    server_id  INTEGER,
    area_id    INTEGER,
    name       TEXT,
    updated_at TEXT
);
