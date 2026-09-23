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

type WithHandle<T> = Omit<T, "handle" | "children"> & {
  handle?: AppRouteHandle;
};

export type AppRouteObject =
  | WithHandle<IndexRouteObject>
  | (WithHandle<NonIndexRouteObject> & { children?: AppRouteObject[] });
