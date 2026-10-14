import { useState } from "react";

import { App } from "antd";

import { open } from "@tauri-apps/plugin-dialog";

import { isTauri } from "@/shared/utils/isTauri";

/** 调起系统文件夹选择器；浏览器环境下仅提示，仍可手动输入路径。 */
export const useChooseFolder = (current: string, onPick: (path: string) => void) => {
  const { message } = App.useApp();
  const [selecting, setSelecting] = useState(false);

  const choose = async () => {
    if (!isTauri()) {
      message.info("请在桌面应用中选择文件夹，也可以直接输入路径");
      return;
    }
    setSelecting(true);
    try {
      const path = await open({
        directory: true,
        multiple: false,
        title: "选择处理文件夹",
        defaultPath: current || undefined,
      });
      if (typeof path === "string") onPick(path);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "选择文件夹失败");
    } finally {
      setSelecting(false);
    }
  };

  return { selecting, choose };
};
