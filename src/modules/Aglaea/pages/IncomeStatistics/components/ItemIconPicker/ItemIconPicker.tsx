import { useState } from "react";

import { Button, Flex, Popover, Typography } from "antd";

import { AppIcon } from "@/shared/components";

import { ITEM_ICONS } from "../../../../constants/itemIcons";

import styles from "./ItemIconPicker.module.scss";

const { Text } = Typography;

// 按文件名排序，顺序稳定；glob 的返回顺序不保证。
const ICON_NAMES = Object.keys(ITEM_ICONS).sort();

export interface ItemIconPickerProps {
  /** 图标文件名（如 "1007.gif"），与数据库 icon 字段一致；空表示不使用图标。 */
  value?: string | null;
  onChange?: (value: string | null) => void;
}

/** 表单控件：点击预览框，在弹出的网格里选一个图标。 */
export const ItemIconPicker = ({ value, onChange }: ItemIconPickerProps) => {
  const [open, setOpen] = useState(false);
  const selectedUrl = value ? ITEM_ICONS[value] : undefined;

  const handleSelect = (name: string) => {
    onChange?.(name);
    setOpen(false);
  };

  const grid = (
    <div className={styles.panel} role="listbox" aria-label="选择物品图标">
      {ICON_NAMES.map((name) => (
        <button
          key={name}
          type="button"
          role="option"
          aria-selected={name === value}
          aria-label={`图标 ${name}`}
          className={[styles.option, name === value && styles.selected].filter(Boolean).join(" ")}
          onClick={() => handleSelect(name)}
        >
          <img src={ITEM_ICONS[name]} alt="" loading="lazy" width={28} height={28} />
        </button>
      ))}
    </div>
  );

  return (
    <Flex align="center" gap={10}>
      <Popover open={open} onOpenChange={setOpen} trigger="click" placement="bottomLeft" content={grid}>
        <button type="button" className={styles.trigger} aria-label="选择物品图标" aria-haspopup="listbox">
          {selectedUrl ? (
            <img src={selectedUrl} alt="" width={28} height={28} />
          ) : (
            <AppIcon icon="PlusOutlined" className={styles.placeholder} />
          )}
        </button>
      </Popover>
      {value ? (
        <Button type="link" size="small" onClick={() => onChange?.(null)}>
          清除
        </Button>
      ) : (
        <Text type="secondary" className={styles.hint}>
          不选则用名称首字代替
        </Text>
      )}
    </Flex>
  );
};
