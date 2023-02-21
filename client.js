import { io } from "socket.io-client";
import { hrtime } from "process";

const URL = process.env.URL || "http://localhost:3000";
const MAX_CLIENTS = 1000;// 当前最大客户端数量
const PING_INTERVAL = 1000;// 多少毫秒执行一次，当前是一秒
const POLLING_PERCENTAGE = 0.05;// 控制是否为polling
const CLIENT_CREATION_INTERVAL_IN_MS = 5;// 间隔多久创建一个实例

let clientCount = 0;

const latency = {
  sum: 0,
  count: 0,
};

const createClient = () => {
  // for demonstration purposes, some clients stay stuck in HTTP long-polling
  const transports =
    Math.random() < POLLING_PERCENTAGE ? ["polling"] : ["polling", "websocket"];

  const socket = io(URL, {
    transports,
  });

  setInterval(() => {
    const start = hrtime.bigint();
    socket.emit("ping", () => {
      const duration = (hrtime.bigint() - start) / 2n; // in nanoseconds 纳秒
      latency.sum += Number(duration) / 1000;
      latency.count++;
    });
  }, PING_INTERVAL);

  socket.on("disconnect", (reason) => {
    console.log(`disconnect due to ${reason}`);
  });

  if (++clientCount < MAX_CLIENTS) {
    setTimeout(createClient, CLIENT_CREATION_INTERVAL_IN_MS);
  }
};

createClient();

const printReport = () => {
  const meanLatency = Math.floor(latency.sum / latency.count);
  latency.sum = latency.count = 0;

  const values = [new Date().toISOString(), clientCount, meanLatency];

  console.log(values.join(";"));
};

setInterval(printReport, 2000);
