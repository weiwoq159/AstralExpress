import { useState } from "react";

import { ConfigProvider, Form, Input, InputNumber, Modal, Select, Typography, type ThemeConfig } from "antd";

import type { ItemCategory } from "@/modules/Aglaea/domain/items/ItemCategory";

import { ITEM_CATEGORY_LABELS } from "../../../../constants/itemCategoryLabels";
import { ItemIconPicker } from "../ItemIconPicker/ItemIconPicker";

import styles from "./CustomItemModal.module.scss";

const { Paragraph, Text } = Typography;

const NAME_MAX_LENGTH = 30;

const CATEGORY_OPTIONS = (Object.keys(ITEM_CATEGORY_LABELS) as ItemCategory[]).map((value) => ({
  value,
  label: ITEM_CATEGORY_LABELS[value],
}));

// 色值与尺寸照抄 docs/menghuan-ledger-prototype.html 的 dialog 样式。
// 全局主题（app/theme.ts）还没有品牌色，所以先只在这个弹窗里局部生效。
const INK = "#12234f";
const INK_SOFT = "#3f5380";
const MUTED = "#5d7199";
const BRAND = "#3f6fdc";
const BRAND_600 = "#2c57bf";
const BRAND_200 = "#c3d5f9";
const LINE = "rgba(44, 87, 191, 0.12)";

const modalTheme: ThemeConfig = {
  token: {
    colorPrimary: BRAND,
    colorText: INK,
    colorTextHeading: INK,
    colorTextPlaceholder: "#7d8fb0",
    colorBorder: LINE,
    colorError: "#8d4d57",
    colorIcon: MUTED,
    colorIconHover: BRAND_600,
    colorBgTextHover: "#ffffff",
    borderRadius: 7,
    fontSize: 12,
    controlHeight: 39,
    colorBgContainer: "rgba(255, 255, 255, 0.75)",
    borderRadiusLG: 18,
    boxShadow: "0 25px 100px rgba(18, 35, 79, 0.2)",
    fontWeightStrong: 700,
  },
  components: {
    Modal: {
      contentBg: "transparent",
      headerBg: "transparent",
      titleFontSize: 21,
      titleLineHeight: 1.3,
      titleColor: INK,
      footerBg: "rgba(255, 255, 255, 0.25)",
    },
    Form: {
      itemMarginBottom: 0,
      labelFontSize: 11,
      labelColor: INK_SOFT,
      verticalLabelPadding: "0 0 8px",
    },
    Input: {
      controlHeight: 39,
      paddingBlock: 9,
      paddingInline: 11,
      inputFontSize: 12,
      colorBgContainer: "rgba(255, 255, 255, 0.75)",
    },
    InputNumber: {
      controlHeight: 39,
      paddingBlock: 9,
      paddingInline: 11,
      inputFontSize: 12,
      colorBgContainer: "rgba(255, 255, 255, 0.75)",
    },
    Button: {
      controlHeight: 36,
      paddingInline: 12,
      contentFontSize: 11,
      defaultBg: "rgba(255, 255, 255, 0.52)",
      defaultColor: INK_SOFT,
      defaultBorderColor: LINE,
      defaultHoverBg: "#ffffff",
      defaultHoverColor: INK_SOFT,
      defaultHoverBorderColor: BRAND_200,
      defaultShadow: "none",
      primaryShadow: "0 4px 10px rgba(63, 111, 220, 0.1)",
      colorPrimaryHover: BRAND_600,
    },
  },
};

export interface CustomItemFormValues {
  name: string;
  category: ItemCategory;
  /** mhxy-items 目录内的图标文件名；未选为空。 */
  icon?: string | null;
  /** 未填表示暂不计价。 */
  referencePrice?: number | null;
}

export interface CustomItemModalProps {
  open: boolean;
  onCancel: () => void;
  /** 返回的 Promise 结束前弹窗保持“提交中”；失败提示由调用方负责，弹窗不关闭由调用方控制 open。 */
  onSubmit: (values: CustomItemFormValues) => Promise<void>;
}

export const CustomItemModal = ({ open, onCancel, onSubmit }: CustomItemModalProps) => {
  const [form] = Form.useForm<CustomItemFormValues>();
  const [submitting, setSubmitting] = useState(false);

  const handleFinish = async (values: CustomItemFormValues) => {
    setSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ConfigProvider theme={modalTheme}>
      <Modal
        open={open}
        centered
        destroyOnHidden
        width={520}
        title={
          <div>
            <Text className={styles.eyebrow}>NEW ITEM / 新的收获</Text>
            <div className={styles.title}>新增个人物品</div>
          </div>
        }
        okText="新增并记入"
        cancelText="取消"
        confirmLoading={submitting}
        cancelButtonProps={{ disabled: submitting }}
        mask={{ closable: !submitting }}
        onOk={() => form.submit()}
        onCancel={onCancel}
        styles={{
          // 遮罩：原型是 #12234f38 加 5px 模糊。
          mask: { background: "rgba(18, 35, 79, 0.22)", backdropFilter: "blur(5px)" },
          container: {
            padding: 0,
            overflow: "hidden",
            border: "1px solid #ffffff",
            background: "linear-gradient(145deg, #f9fbff, #ecf2ff)",
          },
          header: { margin: 0, padding: "25px 25px 0" },
          body: { padding: "18px 25px 24px" },
          footer: { margin: 0, padding: "17px 25px", borderTop: `1px solid ${LINE}` },
          close: { top: 20, insetInlineEnd: 19, width: 29, height: 29 },
        }}
      >
        <Paragraph className={styles.intro}>物品会加入个人目录，并记入当前日，初始数量为 1。</Paragraph>
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          clearOnDestroy
          initialValues={{ category: "custom" }}
          onFinish={handleFinish}
        >
          <Form.Item
            className={styles.field}
            name="name"
            label="物品名称"
            rules={[
              { required: true, whitespace: true, message: "请输入物品名称" },
              { max: NAME_MAX_LENGTH, message: `名称不能超过 ${NAME_MAX_LENGTH} 个字符` },
            ]}
          >
            <Input maxLength={NAME_MAX_LENGTH} placeholder="例如：活动纪念道具" autoComplete="off" />
          </Form.Item>
          <Form.Item
            className={styles.field}
            name="icon"
            label={
              <>
                物品图标 <span className={styles.optional}>（可选）</span>
              </>
            }
          >
            <ItemIconPicker />
          </Form.Item>
          <Form.Item
            className={styles.field}
            name="category"
            label="物品类别"
            rules={[{ required: true, message: "请选择物品类别" }]}
          >
            <Select options={CATEGORY_OPTIONS} placeholder="请选择类别" />
          </Form.Item>
          <Form.Item
            className={styles.field}
            name="referencePrice"
            label={
              <>
                参考单价 <span className={styles.optional}>（可选）</span>
              </>
            }
            extra="未计价物品会显示提示，暂不计入合计收益。"
          >
            <InputNumber<number>
              className={styles.price}
              min={0}
              max={100_000_000}
              step={0.01}
              precision={2}
              suffix="万两"
              placeholder="暂不计价可留空"
            />
          </Form.Item>
        </Form>
      </Modal>
    </ConfigProvider>
  );
};
