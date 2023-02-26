import * as child_process from "child_process";
import { setTimeout } from "timers/promises";
import { parse } from "csv-parse/sync";
import * as fs from "fs";

const EXEC_TIME = 30;

async function createServer(type) {
  let job_file = "";
  if (type === "plain_ws") job_file = './server-plain-ws.js';
  if (type === "ws") job_file = './server-default.js';
  if (type === "eiows") job_file = './server-eiows.js';
  if (type === "uws") job_file = './server-uws.js';
  process.env.report_type = type;

  let fk = child_process.spawn('node', ['--expose-gc', job_file]);
  fk.stdout.on('data', (data) => {
    console.log(`${type}. stdout: ${data}`);
  });

  fk.stderr.on('data', (data) => {
    console.error(`${type}. stderr: ${data}`);
  });

  fk.on('close', (code, signal) => {
    console.log(`${type}. 子进程退出，退出码 ${code},${signal}`);
  });

  return fk
}

async function createClient(num, type) {
  process.env.MAX_CLIENTS = num;
  let fk;
  if (type === "plain_ws") {
    fk = child_process.fork('./client-plain-ws.io.js', {
      silent: false,//
    });
  } else {
    fk = child_process.fork('./client_io.js', {
      silent: false,//
    });
  }

  fk.on('close', (code, signal) => {
    console.log(
      `${type}. 客户端关闭（${num}） signal ${signal}`);
  });
  await setTimeout(1000 * EXEC_TIME)
  fk.kill();
}

let MAX_CLIENTS = getMaxClients();

function getMaxClients() {
  let nums = [0];
  let step = 200;
  let MAX = 10000
  // let MAX = 1000
  for (let i = 1; (i * step) <= MAX; i++) {
    nums.push(i * step)
  }
  return nums
}

console.log(MAX_CLIENTS)

var format = function (bytes) {
  return Number((bytes / 1024 / 1024).toFixed(2));
};

/** 获取报表数据 */
function getReportData() {
  let fileName = "report.json"
  let exportJSON = {
    category: [],
    ws: [],
    eiows: [],
    uws: [],
    plain_ws: [],
  };
  if (fs.existsSync(fileName)) {
    let value = fs.readFileSync(fileName)
    if (value) {
      exportJSON = JSON.parse(value);
    }
  }
  return exportJSON;
}
async function saveReportData(body) {
  let fileName = "report.json"
  fs.writeFileSync(fileName, JSON.stringify(body, null, 2))
}
let exportJSON = getReportData();
exportJSON.category = MAX_CLIENTS.map(m => String(m));

async function dealReport(type = "ws") {
  // 读取csv 数据
  const input = fs.readFileSync(`./report.${type}.csv`)
  let records = parse(input, {
    columns: true,
    skip_empty_lines: true
  })
  console.log("records.length", records.length)
  records = records.filter(m => {
    return Number(m.size) > 0 ? true : false;
  })
  console.log("records.length", records.length)
  let obj = {};

  // rss 常驻集大小，是进程在主内存设备中占用的空间量(这是分配的总内存的子集)，包括所有c++和JavaScript对象和代码。
  // heapUsed 已使用堆栈 heapTotal和heapUsed指的是V8的内存使用量。
  // heapTotal 总使用堆栈
  for (const m of records) {
    m.size = (m.size / 10).toFixed(0) * 10
    if (!obj[m.size]) obj[m.size] = { count: 0, sum: 0 };
    obj[m.size].count++;
    obj[m.size].sum += Number(m.rss);
    // console.log(m.size, format(m.rss), format(m.heapUsed), format(m.heapTotal))
  }
  exportJSON[type] = [0]
  // exportJSON[type + "_map"] = [{ key: 0, total: 0 }]
  exportJSON[type + "_map"] = [""]
  for (const key in obj) {
    if (MAX_CLIENTS.includes(Number(key))) {
      let m = obj[key]
      exportJSON[type].push(format((m.sum / m.count)))
      // exportJSON[type + "_map"].push({ key, total: format((m.sum / m.count)) })
      exportJSON[type + "_map"].push(key + "个连接，占用内存：" + format((m.sum / m.count)) + "MB")
    }
  }

  await saveReportData(exportJSON)
  console.log(JSON.stringify(exportJSON, null, 2))
}


/**
 * 执行测试计划
 */
async function main() {
  let types = [
    "ws",
    "eiows",
    "uws",
    "plain_ws"
  ];
  for (const type of types) {
    // 开启服务
    let fk = await createServer(type)
    // 启动客户端测试
    for (const m of MAX_CLIENTS) {
      if (m > 0) {
        await createClient(m, type)
      }
    }
    fk.kill();
    await setTimeout(100)
    // 抽取数据
    await dealReport(type)
  }


  let body = getReportData();
  fs.writeFileSync("report.data.js", `const report = ${JSON.stringify(body, null, 2)}`)
}

main();

