import { config } from "./myConfig";
import { logger } from "./logger";
import { Credentials, CredentialsTypes } from "./config";

const puppeteer = require("puppeteer");

let currentToken: Record<CredentialsTypes, string | null> = {
  fakeCreds: null,
  realCreds: null,
};

export const getCurrentToken = async (
  which: CredentialsTypes
): Promise<string> => currentToken[which] ?? (await generateBearerToken(which));

export const generateBearerToken = async (
  which: CredentialsTypes
): Promise<string> => {
  const { login, password } = config[which] as Credentials;

  return new Promise(async (resolve, reject) => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Intercepting requests to check for the bearer token
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      const headers = request.headers();
      if (
        headers.referer ===
          "https://info-car.pl/new/prawo-jazdy/sprawdz-wolny-termin" &&
        headers.authorization
      ) {
        logger.info("Successfully obtained bearer token!");
        currentToken[which] = headers.authorization;
        resolve(headers.authorization);
        logger.info("Back after auth...");
        return browser.close();
      }
      request.continue();
    });

    await page.goto("https://info-car.pl/oauth2/login"); // wait until page load
    await page.type(".login-input", login);
    await page.type(".password-input", password);
    await page.click("#register-button");

    // Wait for the ghost button to be visible before proceeding
    await page.waitForSelector(".ghost-btn", { visible: true });

    await page.goto("https://info-car.pl/new/prawo-jazdy/sprawdz-wolny-termin");
  });
};
