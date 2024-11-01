import { execAsync } from "./exec";
import { logger } from "./logger";
import { config } from "./myConfig";
import { sleep } from "./sleep";

let vpnRetries = 0;
export async function ensureVPNStatus(
  shouldBeConnected: boolean
): Promise<void> {
  const isVPNConnected = await getVPNStatus();
  if (isVPNConnected === shouldBeConnected) {
    logger.info(`VPN is ${shouldBeConnected ? "connected" : "disconnected"}`);
    vpnRetries = 0;
    return;
  }
  vpnRetries++;

  if (vpnRetries > 3) {
    logger.error("VPN connection failed 3 times. Exiting the program.");
    process.exit(1);
  }

  shouldBeConnected ? await connectVPN() : await disconnectVPN();
  await sleep(5000);

  return await ensureVPNStatus(shouldBeConnected);
}

export async function getVPNStatus(): Promise<boolean> {
  const ipApiUrl = "https://api.ipify.org?format=json";

  try {
    const response = await fetch(ipApiUrl);
    const data = await response.json();

    logger.debug(`Current IP address: ${data.ip}`);
    return data.ip !== config.myIp;
  } catch (err) {
    // Error probably means that the VPN is connecting now
    logger.error(
      "Error while fetching the IP address. VPN is probably connecting now."
    );
    logger.error(err);
    return false;
  }
}

export async function connectVPN(): Promise<void> {
  // Execute the VPN connection command using Wireguard
  try {
    await execAsync(`sudo wg-quick up ${config.wireguardVPNProfileName}`);
    logger.info("Connected to the VPN (command has been run)");
  } catch (err) {
    logger.error("Error while connecting to the VPN");
    logger.error(err);
  }
}
export async function disconnectVPN(): Promise<void> {
  // Execute the VPN connection command using Wireguard
  try {
    await execAsync(`sudo wg-quick down ${config.wireguardVPNProfileName}`);
    logger.info("Disconnected from the VPN (command has been run)");
  } catch (err) {
    logger.error("Error while disconnecting from the VPN");
    logger.error(err);
  }
}
