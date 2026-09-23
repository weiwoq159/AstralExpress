/** Returns whether the current runtime was started by Tauri. */
export const isTauri = (): boolean => {
  return "__TAURI_INTERNALS__" in globalThis;
};
