import { useRef, type FocusEvent } from "react";

import { open } from "@tauri-apps/plugin-dialog";
import { App, Button, Flex, Form, Input, Layout } from "antd";

import { AstralExpressHeader, GlassPanel, Hero, SectionHeader } from "@/shared/components";
import { useSettingsStore, type SettingsValues } from "@/shared/stores/settingsStore";
import { isTauri } from "@/shared/utils/isTauri";

import styles from "./Settings.module.scss";

const { Content } = Layout;

export const Settings = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm<SettingsValues>();
  const libraryPath = useSettingsStore((state) => state.libraryPath);
  const save = useSettingsStore((state) => state.save);
  // 对话框关闭后焦点可能回到输入框，用它避免再次弹出。
  const picking = useRef(false);

  const pickLibraryPath = async (event: FocusEvent<HTMLInputElement>) => {
    event.target.blur();
    if (picking.current) return;
    if (!isTauri()) {
      message.warning("请在桌面应用中选择文件夹");
      return;
    }
    picking.current = true;
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "选择资源库文件夹",
        defaultPath: form.getFieldValue("libraryPath") || undefined,
      });
      if (typeof selected === "string") {
        form.setFieldValue("libraryPath", selected);
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : "打开文件夹选择窗口失败");
    } finally {
      picking.current = false;
    }
  };

  const handleFinish = (values: SettingsValues) => {
    save(values);
    message.success("设置已保存");
  };

  return (
    <Layout className={styles.layout}>
      <AstralExpressHeader path="/settings" title="星穹列车" subtitle="ASTRAL EXPRESS" slogan="你的个人工作空间" />
      <Content className={styles.content}>
        <Flex vertical gap={16}>
          <Hero eyebrow="SETTINGS" title="设置" description="管理应用的运行环境与偏好。" />
          <SectionHeader sectionTitle="通用" />
          <GlassPanel>
            <Form<SettingsValues>
              form={form}
              layout="vertical"
              initialValues={{ libraryPath }}
              onFinish={handleFinish}
              className={styles.form}
            >
              <Form.Item
                name="libraryPath"
                label="资源库地址"
                rules={[{ required: true, message: "请选择资源库文件夹" }]}
              >
                <Input readOnly placeholder="点击选择文件夹" onFocus={pickLibraryPath} />
              </Form.Item>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
            </Form>
          </GlassPanel>
        </Flex>
      </Content>
    </Layout>
  );
};
