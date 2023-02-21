
import { parse } from "csv-parse/sync";
import * as fs from "fs";
// import * as dayjs from "dayjs";


async function main() {
  // 读取csv 数据
  const input = fs.readFileSync("./report.server.default.csv")
  const records = parse(input, {
    columns: true,
    skip_empty_lines: true
  })

  console.log(JSON.stringify(records, null, 2));
}

main();