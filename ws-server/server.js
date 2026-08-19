import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import { setupWSConnection } from "@y/websocket-server/utils";

const PORT = Number(process.env.PORT) || 1234;
const HOST = process.env.HOST || "0.0.0.0";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

/** Extract the document/room ID from the WebSocket URL path (e.g. "/my-doc" → "my-doc"). */
function getRoomId(url) {
  const room = (url || "/").slice(1).split("?")[0];
  return room || "default";
}

app.get("/", (_req, res) => {
  res.type("text/plain").send("Yjs WebSocket server is running");
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", port: PORT });
});

server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});

wss.on("connection", (ws, req) => {
  const roomId = getRoomId(req.url);

  console.log(`[connect]    room="${roomId}"  url=${req.url}`);

  setupWSConnection(ws, req, { docName: roomId });

  ws.on("close", () => {
    console.log(`[disconnect] room="${roomId}"`);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Yjs WebSocket server listening on ws://${HOST}:${PORT}/<document-id>`);
  console.log(`HTTP health check: http://${HOST}:${PORT}/health`);
});
