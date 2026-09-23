import { useState } from "react";
import { useNavigate } from "react-router";

import { FolderOpenOutlined } from "@ant-design/icons";
import { open } from "@tauri-apps/plugin-dialog";
import { App, Button, Card, Col, Divider, Flex, Form, Input, InputNumber, Radio, Row, Space, Typography } from "antd";

import type { Manifest } from "@/shared/domain/manifest";

import { createTask } from "../../../api";
import { toolsNavigation } from "../../../navigation";
import { useTaskStore } from "../../../stores/useTaskStore";

import styles from "./BatchRenameRunner.module.scss";

const { Title, Paragraph } = Typography;

// 跟 plugins/tools/batch-rename/manifest.json 里 "execute" method 的 params 一一对应。
const RENAME_MODE_OPTIONS = [
  { label: "添加前缀", value: "prefix" },
  { label: "添加后缀", value: "suffix" },
  { label: "查找替换", value: "replace" },
  { label: "顺序编号", value: "sequence" },
];

type RenameMode = "prefix" | "suffix" | "replace" | "sequence";

type BatchRenameFormValues = {
  renameMode: RenameMode;
  prefix: string;
  suffix: string;
  search: string;
  replaceWith: string;
  sequenceStart: number;
  sequencePadding: number;
};

const INITIAL_VALUES: BatchRenameFormValues = {
  renameMode: "sequence",
  prefix: "",
  suffix: "",
  search: "",
  replaceWith: "",
  sequenceStart: 1,
  sequencePadding: 3,
};

type BatchRenameRunnerProps = { tool: Manifest };

export const BatchRenameRunner = ({ tool }: BatchRenameRunnerProps) => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const loadTasks = useTaskStore((state) => state.load);

  const [form] = Form.useForm<BatchRenameFormValues>();
  const renameMode = Form.useWatch("renameMode", form);
  const [targetDirectory, setTargetDirectory] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSelectDirectory = async () => {
    const selected = await open({ directory: true, multiple: false, title: "选择需要重命名的文件夹" });
    if (typeof selected === "string") {
      setTargetDirectory(selected);
    }
  };

  const handleSubmit = async () => {
    if (!targetDirectory) {
      message.warning("请先选择需要重命名的文件夹");
      return;
    }
    const rules = await form.validateFields();

    setSubmitting(true);
    try {
      await createTask({
        moduleId: "tools",
        manifestKey: tool.key,
        params: { targetDirectory, ...rules },
      });
      await loadTasks();
      message.success("已加入任务队列");
      navigate(toolsNavigation.tasks.path);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "创建任务失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className={styles.card} classNames={{ body: styles.cardBody }}>
      <Title level={5} className={styles.title}>
        重命名规则
      </Title>
      <Paragraph type="secondary">选择本地文件夹并配置文件名生成方式，确认后加入任务队列。</Paragraph>

      <Form form={form} layout="vertical" initialValues={INITIAL_VALUES}>
        <Divider plain titlePlacement="left">
          目标文件夹
        </Divider>
        <Space.Compact block>
          <Input
            onClick={handleSelectDirectory}
            value={targetDirectory}
            readOnly
            placeholder="请选择需要重命名的文件夹"
          />
          <Button onClick={handleSelectDirectory} icon={<FolderOpenOutlined />}>
            选择文件夹
          </Button>
        </Space.Compact>

        <Divider plain titlePlacement="left">
          命名方式
        </Divider>
        <Form.Item name="renameMode">
          <Radio.Group block optionType="button" buttonStyle="solid" options={RENAME_MODE_OPTIONS} />
        </Form.Item>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item label="前缀" name="prefix" rules={[{ required: renameMode === "prefix", message: "请输入前缀" }]}>
              <Input disabled={renameMode !== "prefix" && renameMode !== "sequence"} placeholder="例如 draft_" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="后缀" name="suffix" rules={[{ required: renameMode === "suffix", message: "请输入后缀" }]}>
              <Input disabled={renameMode !== "suffix" && renameMode !== "sequence"} placeholder="例如 _final" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              label="起始序号"
              name="sequenceStart"
              rules={[{ required: renameMode === "sequence", type: "number", min: 1, message: "请输入起始序号" }]}
            >
              <InputNumber disabled={renameMode !== "sequence"} min={1} precision={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="补零位数"
              name="sequencePadding"
              rules={[{ required: renameMode === "sequence", type: "number", min: 1, max: 10, message: "请输入补零位数" }]}
            >
              <InputNumber disabled={renameMode !== "sequence"} min={1} max={10} precision={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              label="查找内容"
              name="search"
              rules={[{ required: renameMode === "replace", message: "请填写查找内容" }]}
            >
              <Input disabled={renameMode !== "replace"} placeholder="例如 old" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="替换为"
              name="replaceWith"
              rules={[{ required: renameMode === "replace", message: "请填写替换内容" }]}
            >
              <Input disabled={renameMode !== "replace"} placeholder="例如 new" />
            </Form.Item>
          </Col>
        </Row>

        <Flex justify="end" style={{ marginTop: 8 }}>
          <Button type="primary" loading={submitting} onClick={handleSubmit}>
            加入任务队列
          </Button>
        </Flex>
      </Form>
    </Card>
  );
};
