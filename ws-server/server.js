import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import { setupWSConnection, setPersistence } from "@y/websocket-server/utils";
import { PrismaClient } from "@prisma/client";
import * as Y from "yjs";

const PORT = Number(process.env.PORT) || 1234;
const HOST = process.env.HOST || "0.0.0.0";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });
const prisma = new PrismaClient();

// Keep track of active write timeouts to debounce database saves per room
const writeDebounces = new Map();

setPersistence({
  bindState: async (docName, ydoc) => {
    try {
      const dbDoc = await prisma.document.findUnique({
        where: { roomId: docName },
      });

      if (dbDoc && dbDoc.ydocState) {
        Y.applyUpdate(ydoc, dbDoc.ydocState);
        console.log(`[db-load]      room="${docName}" loaded state from database.`);
      } else {
        console.log(`[db-load]      room="${docName}" no existing state in database.`);
      }
    } catch (error) {
      console.error(`[db-load-error] room="${docName}":`, error);
    }

    // Listens to updates and schedules debounced saves back to Postgres
    ydoc.on("update", (update) => {
      if (writeDebounces.has(docName)) {
        clearTimeout(writeDebounces.get(docName));
      }

      const timeout = setTimeout(async () => {
        writeDebounces.delete(docName);
        try {
          const state = Y.encodeStateAsUpdate(ydoc);
          await prisma.document.upsert({
            where: { roomId: docName },
            update: { ydocState: Buffer.from(state) },
            create: { roomId: docName, ydocState: Buffer.from(state) },
          });
          console.log(`[db-save-periodic] room="${docName}" saved successfully.`);
        } catch (error) {
          console.error(`[db-save-periodic-error] room="${docName}":`, error);
        }
      }, 5000);

      writeDebounces.set(docName, timeout);
    });
  },

  writeState: async (docName, ydoc) => {
    // Clear any pending debounced writes when a room is destroyed
    if (writeDebounces.has(docName)) {
      clearTimeout(writeDebounces.get(docName));
      writeDebounces.delete(docName);
    }

    try {
      const state = Y.encodeStateAsUpdate(ydoc);
      await prisma.document.upsert({
        where: { roomId: docName },
        update: { ydocState: Buffer.from(state) },
        create: { roomId: docName, ydocState: Buffer.from(state) },
      });
      console.log(`[db-save-final] room="${docName}" final state saved on room close.`);
    } catch (error) {
      console.error(`[db-save-final-error] room="${docName}":`, error);
    }
  },
});

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
