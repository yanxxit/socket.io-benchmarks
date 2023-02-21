import { memoryUsage } from "process";
import * as path from "path";
import * as fs from "fs";
fs.writeFileSync(`report.server.default.csv`, ["created", "size", "rss", "heapUsed", "heapTotal"].join(",") + "\n")
const printStats = (io, type = "default") => {
  const { rss, heapUsed, heapTotal } = memoryUsage();
  let file_name = `report.server.default.csv`
  const values = [
    Date.now(),// 日期
    io.sockets.sockets.size,// 当前连接数
    rss, // in bytes
    heapUsed, // in bytes
    heapTotal, // in bytes
  ];

  console.log(values.join(","));
  fs.appendFileSync(file_name, values.join(",") + "\n")
};

export function initReporting(io) {
  setInterval(() => {
    printStats(io);
  }, 2000);
}
