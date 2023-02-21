import { memoryUsage } from "process";
import * as path from "path";
import * as fs from "fs";

const printStats = (io, type = "default") => {
  const { rss, heapUsed, heapTotal } = memoryUsage();

  const values = [
    new Date().toISOString(),// 日期
    io.sockets.sockets.size,// 当前连接数
    rss, // in bytes
    heapUsed, // in bytes
    heapTotal, // in bytes
  ];

  console.log(values.join(";"));
  fs.appendFileSync(`report.server.${type}.csv`, values.join(",") + "\n")
};

export function initReporting(io) {
  setInterval(() => {
    printStats(io);
  }, 2000);
}
