import { config } from "./config";
import { logger } from "./logger";

const puppeteer = require("puppeteer");

let currentToken: string | null = null;

export const getCurrentToken = async (): Promise<string> =>
  currentToken ?? (await generateBearerToken());

export const generateBearerToken = async (): Promise<string> => {
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
        currentToken = headers.authorization;
        resolve(headers.authorization);
        logger.info("Back to checking free exams...");
        return browser.close();
      }
      request.continue();
    });

    await page.goto("https://info-car.pl/oauth2/login"); // wait until page load
    await page.type(".login-input", config.LOGIN);
    await page.type(".password-input", config.PASSWORD);
    await page.click("#register-button");

    // Wait for the ghost button to be visible before proceeding
    await page.waitForSelector(".ghost-btn", { visible: true });

    await page.goto("https://info-car.pl/new/prawo-jazdy/sprawdz-wolny-termin");
  });
};
