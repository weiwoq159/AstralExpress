import { Flex, Table, Typography } from "antd";

import type { ColumnsType } from "antd/es/table";

import { GlassPanel } from "@/shared/components";

import { runnerStyles } from "../../shared";
import styles from "./BatchRename.module.scss";

interface ChangeRow {
  key: string;
}

const columns: ColumnsType<ChangeRow> = [
  { title: "序号", key: "index" },
  { title: "原文件名", key: "from" },
  { title: <span aria-label="变化方向" />, key: "arrow" },
  { title: "新文件名", key: "to" },
  { title: "状态", key: "status" },
];

export const BatchRenameChanges = () => (
  <GlassPanel hoverable={false} className={styles.changes}>
    <Flex align="center" justify="space-between" gap={15} className={styles.changesHead}>
      <div>
        <div className={runnerStyles.sectionLabel}>04 / FILE CHANGES</div>
        <Typography.Title level={2}>名称变化明细</Typography.Title>
      </div>
      <Typography.Text>生成预览后显示文件变化</Typography.Text>
    </Flex>
    <Table<ChangeRow>
      className={styles.changesTable}
      columns={columns}
      dataSource={[]}
      pagination={false}
      scroll={{ x: "max-content" }}
      locale={{
        emptyText: <div className={styles.empty}>尚未生成预览。预览服务接入后，可在此核对真实的名称变化。</div>,
      }}
    />
    <Typography.Text className={styles.changesFoot}>预览不会修改文件；入队前需要核对名称变化。</Typography.Text>
  </GlassPanel>
);
