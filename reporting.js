import { memoryUsage } from "process";
import * as path from "path";
import dayjs from "dayjs";
import * as fs from "fs";

// let file_name = `report.ws.csv`
// let file_name = `report.eiows.csv`
let file_name = `report.${process.env.report_type}.csv`
console.log("----->>>", file_name)
// let file_name = `report.plain_ws.csv`
fs.writeFileSync(file_name, ["created", "size", "rss", "heapUsed", "heapTotal"].join(",") + "\n")
const printStats = (io, type = "default") => {
  const { rss, heapUsed, heapTotal } = memoryUsage();
  const values = [
    // Date.now(),// 日期
    dayjs().format("YYYY-MM-DD HH:mm:ss"),// 日期
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
