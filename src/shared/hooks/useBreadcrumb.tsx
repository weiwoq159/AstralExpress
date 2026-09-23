import { Link, useMatches } from "react-router";

import { Breadcrumb, type BreadcrumbProps } from "antd";

import type { AppRouteObject } from "@/router/types";

type UseBreadcrumbOptions = Omit<BreadcrumbProps, "items">;

export const useBreadcrumb = (options: UseBreadcrumbOptions) => {
  const matches = useMatches();

  const items = matches.flatMap((match, index) => {
    if (match.pathname === matches[index - 1]?.pathname) {
      return [];
    }

    const handle = match.handle as AppRouteObject["handle"];
    return handle?.breadcrumb ?? [];
  });

  return (
    <Breadcrumb
      {...options}
      style={{ userSelect: "none", marginLeft: 24, marginTop: 24 }}
      items={items.map((item, index) => ({
        title: item.to && index !== items.length - 1 ? <Link to={item.to}>{item.title}</Link> : item.title,
      }))}
    />
  );
};
