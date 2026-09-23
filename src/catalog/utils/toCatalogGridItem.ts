import type { CatalogGridItem } from "../components/CatalogGrid/CatalogGrid";
import type { Manifest } from "@/shared/domain/manifest";

/** Manifest 到 CatalogGridItem 的标准映射，任何模块渲染自己的 manifest 列表时都能直接用。 */
export const toCatalogGridItem = (manifest: Manifest): CatalogGridItem => ({
  key: manifest.key,
  name: manifest.name,
  description: manifest.description,
  icon: manifest.icon,
  status: manifest.status,
  tags: manifest.tags,
});
