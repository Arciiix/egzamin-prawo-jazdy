import { generateBearerToken, getCurrentToken } from "./auth";
import { ReservationDate } from "./config";
import {
  sendDiscordNotificationTryingToReserve,
  sendRepeatingReservationDiscordNotification,
} from "./discord";
import { logger } from "./logger";
import { config } from "./myConfig";
import { setIsSearchingForNewExams } from "./status";
import { ensureVPNStatus } from "./vpn";

export async function reserveExam(
  exam: any & { id: string; date: Date },
  reservation: ReservationDate
) {
  logger.info(
    `[RESERVE] Reserving exam with id: ${exam.id} and date: ${exam.date} (${reservation.name})`
  );
  await setIsSearchingForNewExams(false);
  await sendDiscordNotificationTryingToReserve(exam, reservation.name);

  if (!config.dontGoToNormalIpOnReserve) {
    await ensureVPNStatus(false);
  }

  logger.info("[RESERVE] Starting the reservation process");

  // Do the actual reservation here
  const token = await generateBearerToken("realCreds");
  logger.info(`[RESERVE] Bearer token: ${token}`);

  const data = {
    candidate: {
      category: config.category,
      email: config.realCreds.login,
      firstname: config.personalInfo.firstName,
      lastname: config.personalInfo.lastName,
      pesel: config.personalInfo.pesel,
      phoneNumber: config.personalInfo.phoneNumber,
      pkk: config.personalInfo.pkk,
      pkz: null,
    },
    exam: {
      organizationUnitId: `${config.wordId}`,
      practiceId: `${exam.id}`,
      theoryId: null,
    },
    languageAndOsk: {
      language: "POLISH",
      signLanguage: "NONE",
      oskVehicleReservation: null,
    },
  };

  console.log(data);

  const response = await fetch(`https://info-car.pl/api/word/reservations`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      Authorization: await getCurrentToken("realCreds"),
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246",
    },
  });

  if (response.status !== 200 && response.status !== 201) {
    logger.error(
      `[RESERVE] Failed to reserve the exam. Status: ${response.status}`
    );
    const body = await response.text();
    logger.error(`[RESERVE] Response body: ${body}`);
    process.exit(1);
  }

  const responseBody = await response.json();
  logger.info(`[RESERVE] Response body: ${JSON.stringify(responseBody)}`);
  console.log(responseBody);

  logger.info(`[RESERVE] Successfully reserved the exam with id: ${exam.id}`);

  await sendRepeatingReservationDiscordNotification(exam, reservation.name);
}
