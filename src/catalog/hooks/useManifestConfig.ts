import { useCallback, useEffect, useState } from "react";

import type { ManifestConfig } from "@/shared/domain/manifestConfig";

type UseManifestConfigOptions = {
  manifestKey: string;
  getManifestConfig: (manifestKey: string) => Promise<ManifestConfig | null>;
  setManifestConfig: (manifestKey: string, config: Record<string, unknown>) => Promise<ManifestConfig>;
};

/**
 * 读取某个 manifest 的持久配置（后端 manifest_configs 表），进 Runner 页时用它给表单
 * 填初始值；提交（推入队列）时调用 save 把最新表单值写回去，下次进来就是最新的默认值。
 *
 * 不认领 manifest_key 是否真的有对应的持久配置——后端启动时已经把 crawler 目录下每个
 * manifest 跟配置表同步成一一对应了（见 src-tauri 的 manifest_config::service::sync），
 * 这里查到 None 只代表还没人存过东西，不代表 manifest 不存在。
 */
export const useManifestConfig = ({ manifestKey, getManifestConfig, setManifestConfig }: UseManifestConfigOptions) => {
  const [config, setConfig] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getManifestConfig(manifestKey)
      .then((result) => {
        if (!cancelled) setConfig(result?.config ?? {});
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [manifestKey, getManifestConfig]);

  const save = useCallback(
    async (next: Record<string, unknown>) => {
      const saved = await setManifestConfig(manifestKey, next);
      setConfig(saved.config);
      return saved;
    },
    [manifestKey, setManifestConfig],
  );

  return { config, loading, save };
};
