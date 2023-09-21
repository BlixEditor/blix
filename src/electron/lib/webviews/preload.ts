// This is the preload script for the webviews.

import { CacheMetadata, CacheWriteResponse } from "@shared/types/cache";

// It exposes some IPC functions so the webview can communicate with its parent renderer.
const { ipcRenderer, contextBridge } = require("electron");

const ws = new WebSocket("ws://localhost:60606");
ws.binaryType = "blob";

function sendAndRecieveData(payload: string | Blob): Promise<any> {
  return new Promise((resolve, reject) => {
    ws.send(payload);
    const recv = (event: MessageEvent<any>) => {
      ws.removeEventListener("message", recv); // Remove this listener
      resolve(event.data);
    };
    ws.addEventListener("message", recv);
  });
}

contextBridge.exposeInMainWorld("api", {
  send: (channel: string, data: any) => {
    ipcRenderer.sendToHost(channel, data);
  },
  on: (channel: string, func: (..._: any) => any) => {
    ipcRenderer.on(channel, (_event, args) => func(args));
  },
});

contextBridge.exposeInMainWorld("cache", {
  write: async (content: Blob, metadata: CacheMetadata) => {
    const response: string = await sendAndRecieveData(new Blob([content]));
    const data = JSON.parse(response) as CacheWriteResponse;
    ws.send(JSON.stringify({ type: "cache-write-metadata", id: data.id, metadata }));
    return data;
  },
  get: async (id: string) => {
    const results = await sendAndRecieveData(JSON.stringify({ type: "cache-get", id }));
    return results;
  },
  delete: async (id: string) => {
    const results: string = await sendAndRecieveData(JSON.stringify({ type: "cache-delete", id }));
    return JSON.parse(results);
  },
});
