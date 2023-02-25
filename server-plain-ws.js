import { WebSocketServer } from "ws";
import { memoryUsage } from "process";
import * as path from "path";
import dayjs from "dayjs";
import * as fs from "fs";
let file_name = `report.plain_ws.csv`
const PORT = process.env.PORT || 3000;
fs.writeFileSync(file_name, ["created", "size", "rss", "heapUsed", "heapTotal"].join(",") + "\n")
const wss = new WebSocketServer({
  port: PORT
});

wss.on("connection", (ws) => {
  ws.on("message", () => {
    ws.send("pong");
  });

  ws.on("close", () => {
    const lastToDisconnect = wss.clients.size === 0;
    if (lastToDisconnect) {
      gc();
    }
  });
});

const printStats = () => {
  const { rss, heapUsed, heapTotal } = memoryUsage();

  const values = [
    // new Date().toISOString(),
    dayjs().format("YYYY-MM-DD HH:mm:ss"),
    wss.clients.size,
    rss, // in bytes
    heapUsed, // in bytes
    heapTotal, // in bytes
  ];

  console.log(values.join(";"));
  fs.appendFileSync(file_name, values.join(",") + "\n")
};

setInterval(() => {
  printStats();
}, 2000);
