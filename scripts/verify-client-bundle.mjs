import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const clientRoot = join(process.cwd(), ".next", "static");
const privateFragments = [
  "five 8-hour blocks",
  "Scarce and plentiful have the same opposite relationship",
  "no Ral can be a Tov",
  "previous number doubled minus 1",
  "counterclockwise 180° becomes west",
  "involve deriving a judgment",
  "Liam > Noor > Priya",
  "Increasing $60 by 10% adds $6",
];

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
