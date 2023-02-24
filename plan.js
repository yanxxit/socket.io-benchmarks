import * as child_process from "child_process";
import { setTimeout } from "timers/promises";

async function doTask(num) {
  process.env.MAX_CLIENTS = num;
  let fk = child_process.fork('./client_io.js', {
    silent: false,//
  });


  fk.on('close', (code, signal) => {
    console.log(
      `child process terminated due to receipt of signal ${signal}`);
  });
  await setTimeout(10000)
  fk.kill();
}

let MAX_CLIENTS = [];
let step = 200;
// let MAX = 10000
let MAX = 1000
for (let i = 1; (i * step) <= MAX; i++) {
  MAX_CLIENTS.push(i * step)
}

console.log(MAX_CLIENTS)

async function main() {
  for (const m of MAX_CLIENTS) {
    await doTask(m)
  }
}

main();

