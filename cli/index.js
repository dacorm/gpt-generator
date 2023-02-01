import path from "path";
import { readFileSync } from "fs";
import { generate } from "../generator/index.js";

const sourcePath = path.resolve(process.cwd(), "cli/example.txt");
const source = readFileSync(sourcePath);

const result = generate({
  wordsCount: 150,
  sampleSize: 10,
  source,
});

console.log(result);
