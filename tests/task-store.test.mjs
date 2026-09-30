import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";

import { clearMocks, mockIPC } from "@tauri-apps/api/mocks";
import { createServer } from "vite";

let server;
let createTaskStore;
const task = { taskUid: "task-1", moduleId: "tools", status: "pending" };
const ok = (data) => ({ ok: true, code: 200, data });
const deferred = () => {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
};

before(async () => {
  globalThis.window = globalThis;
  const storage = new Map();
  globalThis.sessionStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  };
  server = await createServer({
    configFile: false,
    resolve: { alias: { "@": fileURLToPath(new URL("../src", import.meta.url)) } },
    server: { middlewareMode: true },
    appType: "custom",
  });
  ({ createTaskStore } = await server.ssrLoadModule("/src/shared/stores/createTaskStore.ts"));
});

after(async () => {
  clearMocks();
  await server?.close();
  delete globalThis.window;
  delete globalThis.sessionStorage;
});

test("double clicks invoke once and a stale list cannot overwrite an action", async () => {
  const list = deferred();
  const action = deferred();
  let actionCalls = 0;
  mockIPC((command, payload) => {
    if (command === "list_tasks") return list.promise;
    assert.equal(command, "apply_task_action");
    assert.deepEqual(payload, { moduleId: "tools", taskUid: task.taskUid, action: "pause" });
    actionCalls++;
    return action.promise;
  });
  const store = createTaskStore("tools");
  store.setState({ items: [task] });
  const fetching = store.getState().fetchItems();
  assert.equal(store.getState().fetchItems(), fetching);
  const applying = store.getState().applyAction(task, "pause");
  await store.getState().applyAction(task, "pause");
  assert.equal(actionCalls, 1);
  assert.equal(store.getState().updatingTaskUids.has(task.taskUid), true);
  action.resolve(ok({ ...task, status: "paused" }));
  await applying;
  list.resolve(ok([task]));
  await fetching;
  assert.equal(store.getState().items[0].status, "paused");
  assert.equal(store.getState().updatingTaskUids.size, 0);
});

test("a rejected action displays its error, refreshes state and releases the row", async () => {
  mockIPC((command) => command === "apply_task_action"
    ? { ok: false, code: 500, error: "状态已变化" }
    : ok([{ ...task, status: "canceled" }]));
  const store = createTaskStore("tools");
  store.setState({ items: [task] });
  await store.getState().applyAction(task, "pause");
  assert.equal(store.getState().actionError, "状态已变化");
  assert.equal(store.getState().items[0].status, "canceled");
  assert.equal(store.getState().updatingTaskUids.size, 0);
});

test("module stores reject foreign tasks without invoking the backend", async () => {
  let calls = 0;
  mockIPC(() => { calls++; return ok([]); });
  const tools = createTaskStore("tools");
  const crawler = createTaskStore("crawler");
  await crawler.getState().applyAction(task, "cancel");
  assert.equal(calls, 0);
  assert.equal(crawler.getState().actionError, "任务不属于当前模块");
  assert.equal(tools.getState().actionError, null);
});
