import { generateBearerToken } from "./auth";
import { logger } from "./logger";
import { search } from "./search";

async function main() {
  logger.info("Prawo jazdy - śledzenie terminów na egzamin praktyczny");

  const token = await generateBearerToken();
  console.log(token);

  search();
}

main();
