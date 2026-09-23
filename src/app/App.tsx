import { createHashRouter, RouterProvider } from "react-router";

import { App as AntdApp, ConfigProvider } from "antd";

import { routes } from "@/router";

import { AmphoreusTheme } from "./theme";

const router = createHashRouter(routes);

function App() {
  return (
    <ConfigProvider theme={AmphoreusTheme}>
      <AntdApp>
        <RouterProvider router={router} />
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
