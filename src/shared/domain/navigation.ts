export interface NavigationItem {
  path: string;
  title: string;
}

export type Navigation = Record<string, NavigationItem>;
