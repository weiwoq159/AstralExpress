import { invoke as tauriInvoke, type InvokeArgs } from "@tauri-apps/api/core";

import type { ApiResponse } from "@/shared/domain/response";

const TIMEOUT_MS = 30_000;

/**
 * Tauri Command 的唯一调用入口，只负责超时、响应解包和错误转换。
 *
 * **不负责用户提示**——是否弹 toast、弹什么，由调用方按场景决定：
 * 用户主动点「刷新」时该弹，页面后台加载失败时可能只该渲染 Alert。
 *
 * 失败时一律抛出 `Error`（而非裸字符串），调用方可以稳定地用
 * `error instanceof Error ? error.message : fallback` 取文案。
 */
export const invokeApiCommand = async <T>(command: string, payload?: InvokeArgs): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${command} 请求超时`)), TIMEOUT_MS);
  });

  let response: ApiResponse<T>;
  try {
    response = await Promise.race([tauriInvoke<ApiResponse<T>>(command, payload), timeout]);
  } catch (error) {
    // Tauri 在 Command 返回 Err 时会以裸字符串 reject，统一收敛为 Error。
    throw error instanceof Error ? error : new Error(String(error));
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok || response.code !== 0) {
    throw new Error(response.error ?? `${command} 请求失败`);
  }

  return response.data as T;
};
