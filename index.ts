import { generateBearerToken } from "./auth";
import { execAsync } from "./exec";
import { logger } from "./logger";
import { config } from "./myConfig";
import { search } from "./search";
import { sleep } from "./sleep";
import { getIsSearchingForNewExams, loadStatusFromJson } from "./status";
import { ensureVPNStatus } from "./vpn";

async function main() {
  logger.info("Prawo jazdy - śledzenie terminów na egzamin praktyczny");

  await loadStatusFromJson();

  if (!getIsSearchingForNewExams()) {
    logger.info(
      "isSearchingForNewExams is false. Exiting the program in 30 seconds..."
    );
    await sleep(30000);
    return;
  }

  if (config.runChromiumFix) {
    await execAsync(
      "echo 0 | sudo tee /proc/sys/kernel/apparmor_restrict_unprivileged_userns"
    );
    logger.info("Chromium fix has been applied");
  }

  // Ensure that the VPN is connected
  await ensureVPNStatus(true);

  const token = await generateBearerToken("fakeCreds");
  console.log(token);

  search();
}

main();
