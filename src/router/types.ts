import type { IndexRouteObject, NonIndexRouteObject } from "react-router";

export interface BreadcrumbItem {
  title: string;
  to?: string;
}

export interface AppRouteHandle {
  breadcrumb?: BreadcrumbItem[];
  /** 是否在侧边栏菜单中展示该路由 */
  menu?: boolean;
}

/** 把 react-router 原生的 handle（any）替换成我们自己的类型 */
type WithAppHandle<T> = Omit<T, "handle" | "children"> & {
  handle?: AppRouteHandle;
};

/** index 路由：不能有 children */
type AppIndexRoute = WithAppHandle<IndexRouteObject>;

/** 普通路由：可以嵌套子路由 */
type AppNonIndexRoute = WithAppHandle<NonIndexRouteObject> & {
  children?: AppRouteObject[];
};

export type AppRouteObject = AppIndexRoute | AppNonIndexRoute;
