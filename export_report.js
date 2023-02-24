
import { parse } from "csv-parse/sync";
import * as fs from "fs";

async function main() {
  // 读取csv 数据
  const input = fs.readFileSync("./report.server.default.csv")
  let records = parse(input, {
    columns: true,
    skip_empty_lines: true
  })

  console.log("records.all", records.length)
  records = records.filter(m => {
    return Number(m.size) > 0
  })
  console.log("records.filter", records.length)
  // console.log(JSON.stringify(records));
}

main();