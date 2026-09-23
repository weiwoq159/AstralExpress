import type { ThemeConfig } from "antd";

export const AmphoreusTheme: ThemeConfig = {
  token: {
    fontFamily: '"RPG", "Microsoft YaHei", sans-serif',
  },
  components: {
    Card: {
      bodyPadding: 24,
      bodyPaddingSM: 16,
    },
    Layout: {
      bodyBg: "transparent",
      headerBg: "transparent",
      footerBg: "transparent",
      siderBg: "transparent",
    },
  },
};
