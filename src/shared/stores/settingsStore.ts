import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SettingsValues = {
  /** 资源库所在的文件夹路径。 */
  libraryPath: string;
};

type SettingsState = SettingsValues & {
  save: (values: SettingsValues) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      libraryPath: "",
      save: (values) => set(values),
    }),
    {
      name: "astral-settings",
      // 只持久化表单数据，不存 action。
      partialize: ({ libraryPath }) => ({ libraryPath }),
    },
  ),
);
