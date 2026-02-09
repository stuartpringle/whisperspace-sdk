import { readFile } from "node:fs/promises";
import { validateCharacterRecordV1 } from "../src/validate";

async function readJson(path: string) {
  const raw = await readFile(path, "utf-8");
  return JSON.parse(raw);
}

async function main() {
  const valid = await readJson(new URL("../fixtures/character-record.valid.json", import.meta.url).pathname);
  const invalid = await readJson(new URL("../fixtures/character-record.invalid.json", import.meta.url).pathname);

  const validResult = validateCharacterRecordV1(valid);
  if (!validResult.ok) {
    console.error("Expected valid fixture to pass, but got errors:");
    console.error(validResult.errors);
    process.exit(1);
  }

  const invalidResult = validateCharacterRecordV1(invalid);
  if (invalidResult.ok) {
    console.error("Expected invalid fixture to fail, but it passed.");
    process.exit(1);
  }

  console.log("Schema fixture validation passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
