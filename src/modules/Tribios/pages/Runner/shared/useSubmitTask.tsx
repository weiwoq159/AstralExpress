import { App, Descriptions } from "antd";

import type { Manifest } from "@/shared/domain/manifest";

export interface SubmitSummaryItem {
  label: string;
  value: string;
}

interface SubmitOptions {
  /** 确认弹窗标题。 */
  title: string;
  /** 确认弹窗里展示的参数摘要。 */
  summary: SubmitSummaryItem[];
  /** 提交给队列的参数，即该应用的表单内容。 */
  params: unknown;
}

/**
 * 各应用 Runner 页统一的「确认并加入队列」流程：确认弹窗 → 提交 → 提示。
 * 页面只提供参数与摘要；入队接口接入后，只需改这里。
 */
export const useSubmitTask = (manifest: Manifest) => {
  const { modal, message } = App.useApp();

  const submit = ({ title, summary, params }: SubmitOptions) => {
    modal.confirm({
      title,
      content: (
        <Descriptions
          column={1}
          size="small"
          items={summary.map((item) => ({ key: item.label, label: item.label, children: item.value }))}
        />
      ),
      onOk: async () => {
        // TODO: await submitTask({ manifestKey: manifest.key, params });
        void manifest;
        void params;
        message.info("任务提交接口尚未接入");
      },
    });
  };

  return { submit };
};
