import fs from "node:fs/promises";
import path from "node:path";
import { logger } from "./logger";
import { existsSync } from "node:fs";

let isSearchingForNewExams = true; // Is false when an exam has been already reserved
const statusFilePath = path.resolve(__dirname, "statusState.json");

export async function setIsSearchingForNewExams(value: boolean) {
  isSearchingForNewExams = value;

  // Also save to a JSON file status.json to persist the value
  await fs.writeFile(
    statusFilePath,
    JSON.stringify({ isSearchingForNewExams: value })
  );
  logger.info(`isSearchingForNewExams set to ${value}`);
}

export function getIsSearchingForNewExams() {
  return isSearchingForNewExams;
}

export async function loadStatusFromJson() {
  logger.debug(`Loading isSearchingForNewExams from file: ${statusFilePath}`);

  if (!existsSync(statusFilePath)) {
    logger.info(
      "status JSON file does not exist. isSearchingForNewExams is true"
    );
    return;
  }

  const fileContent = await fs.readFile(statusFilePath, { encoding: "utf-8" });
  const { isSearchingForNewExams } = JSON.parse(fileContent);
  setIsSearchingForNewExams(isSearchingForNewExams);
  logger.info(
    `isSearchingForNewExams loaded from file: ${isSearchingForNewExams}`
  );
}
