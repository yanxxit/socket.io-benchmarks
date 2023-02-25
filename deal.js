import * as child_process from "child_process";
import * as util from "util";
import { setTimeout } from "timers/promises";
import { parse } from "csv-parse/sync";
import * as fs from "fs";

const exec = util.promisify(child_process.exec);


async function createServer(type) {
  let job_file = "";
  if (type === "plain_ws") job_file = './server-plain-ws.js';
  if (type === "ws") job_file = './server-default.js';
  if (type === "eiows") job_file = './server-eiows.js';
  if (type === "uws") job_file = './server-uws.js';

  let fk = child_process.spawn('node', ['--expose-gc', job_file]);
  fk.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  fk.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  fk.on('close', (code, signal) => {
    console.log(`子进程退出，退出码 ${code},${signal}`);
  });

  await setTimeout(1000 * 5)
  fk.kill();
}

async function main() {
  // await createServer("plain_ws")
  // await createServer("ws")
  // await createServer("eiows")
  await createServer("uws")
}

main();