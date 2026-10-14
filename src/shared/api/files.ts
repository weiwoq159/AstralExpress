import { invokeApiCommand } from "@/shared/tauri/invoke";
import { isTauri } from "@/shared/utils/isTauri";

/** 列出文件夹第一层的文件名（不含子文件夹）。 */
export const listDirectoryFiles = async (path: string): Promise<string[]> => {
  if (!isTauri()) return [];
  return invokeApiCommand<string[]>("list_directory_files", { path });
};
