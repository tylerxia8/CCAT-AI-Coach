import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const clientRoot = join(process.cwd(), ".next", "static");
const privateFragments = [
  "five 8-hour blocks",
  "Scarce and plentiful have the same opposite relationship",
  "no Ral can be a Tov",
  "previous number doubled minus 1",
  "triangle rotates one quarter-turn clockwise",
  "Promising creates the contrast with the rejection",
  "Liam > Noor > Priya",
  "Increasing $60 by 10% adds $6",
  "Each printer produces 10 pages per minute",
  "Something ephemeral has little duration",
  "Twenty-four pump-hours for 3 tanks",
  "Taciturn, reticent, reserved",
  "Output rose from 120 to 180",
  "Tuesday is 20 minutes and Thursday is 16",
  "East has the highest rate at 30%",
  "multiply the original by 1.2 times 0.8",
  "Nia above Milo above Jae above Kira",
  "diamond breaks that rule",
  "The Vens that are Lops",
  "The increases are 4, 6, 8, and 10",
  "three filled circles complete the matrix",
  "The Wiks that are Bors may or may not be Dels",
  "letter-position jumps increase by one",
  "vertical reflection reverses left and right",
  "reproduced without a substituted, transposed",
  "Operations exceeds Administration by 20 percentage points",
  "satisfying both rules",
  "Thirty-five hours multiplied by $18",
  "Each machine produces 10 parts per hour",
  "The overlap between Pexes and Jors",
  "previous term doubled plus 2",
  "Turning 90° counterclockwise from south",
  "Verbose means using more words",
  "Mara before Theo before Jin",
  "Dividing 30 by the original 120",
];

if (new Set(privateFragments).size !== privateFragments.length) {
  throw new Error("Bundle privacy fragments must be unique.");
}

const files = await walk(clientRoot);
const violations = [];
for (const file of files) {
  const contents = await readFile(file, "utf8");
  for (const fragment of privateFragments) {
    if (contents.includes(fragment)) violations.push({ file, fragment });
  }
}

if (violations.length) {
  console.error("Private answer content was found in the compiled client bundle:");
  for (const violation of violations) console.error(`- ${violation.file}: ${violation.fragment}`);
  process.exitCode = 1;
} else {
  console.log(`Client bundle privacy check passed across ${files.length} files.`);
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  }));
  return nested.flat();
}
