-- 梦幻西游道具表。本文件在每次启动时整体执行，所有语句必须幂等（IF NOT EXISTS）。
CREATE TABLE IF NOT EXISTS mhxy_items (
    id              INTEGER PRIMARY KEY,
    -- 道具的稳定标识（如 "jin_chuang_yao"），供识别、配置、脚本引用；一旦发布不应修改，改名只改 name。
    key             TEXT    NOT NULL UNIQUE CHECK (key <> ''),
    name            TEXT    NOT NULL CHECK (name <> ''),
    -- 图标文件相对于应用数据目录的路径；文件本身不入库。
    icon            TEXT,
    category        TEXT    NOT NULL DEFAULT '',
    description     TEXT    NOT NULL DEFAULT '',
    -- 参考价，单位：游戏币，最多两位小数。摆摊价随时间波动，历史价格另建表记录，不放在这里。
    reference_price REAL CHECK (reference_price IS NULL OR (reference_price >= 0 AND reference_price = round(reference_price, 2))),
    created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
) STRICT;

CREATE INDEX IF NOT EXISTS idx_mhxy_items_name ON mhxy_items (name);
CREATE INDEX IF NOT EXISTS idx_mhxy_items_category ON mhxy_items (category);
