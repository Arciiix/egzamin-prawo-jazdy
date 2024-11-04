import { config } from "./myConfig";
import { getPolishWeekDay } from "./date";
import { sleep } from "./sleep";
import { logger } from "./logger";

const sendDiscordNotification = async (
  body: Record<string, any>,
  webhookUrl: string
): Promise<void> => {
  logger.debug("Will send an embed");
  const request = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  logger.info(`Discord notification sent, response: ${request.status}`);
};

export const sendDiscordNotificationTryingToReserve = async (
  practiceExam: any,
  name: string
) => {
  const webhookUrl = config.webhookURL;

  // Send @everyone notification before since it's very important
  const messagePayload = {
    content: `@everyone Próba rezerwacji egzaminu ${name}`,
  };
  await sendDiscordNotification(messagePayload, webhookUrl);

  if (config.importantWebhookURL) {
    await sendDiscordNotification(messagePayload, config.importantWebhookURL);
  }

  const howManyDays = Math.floor(
    (new Date(practiceExam.date).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const prettyDate = new Date(practiceExam.date).toLocaleString("pl-PL", {
    timeZone: "Europe/Warsaw",
  });

  const message = {
    embeds: [
      {
        title: `Próba rezerwacji egzaminu ${prettyDate} ${name}`,
        description: `Data: **${prettyDate}** (za dni: **${howManyDays}**, tj. ${getPolishWeekDay(
          new Date(practiceExam.date)
        )})\nID: **${practiceExam.id}**\nMiejsca: **${
          practiceExam.places
        }**\nDodatkowe info: **${practiceExam.additionalInfo}**`,
        color: 0xffff00, // Yellow color
        timestamp: new Date().toISOString(),
      },
    ],
  };

  await sendDiscordNotification(message, webhookUrl);

  if (config.importantWebhookURL)
    await sendDiscordNotification(message, config.importantWebhookURL);
};

export const sendDiscordNotificationAboutNewExam = async (
  practiceExam: any
) => {
  const webhookUrl = config.webhookURL;

  const howManyDays = Math.floor(
    (new Date(practiceExam.date).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  // Format date in dd.mm.yyyy hh:mm

  const prettyDate = new Date(practiceExam.date).toLocaleString("pl-PL", {
    timeZone: "Europe/Warsaw",
  });

  const message = {
    embeds: [
      {
        title: `Znaleziono nowy egzamin ${prettyDate}`,
        description: `Data: **${prettyDate}** (za dni: **${howManyDays}**, tj. ${getPolishWeekDay(
          new Date(practiceExam.date)
        )})\nID: **${practiceExam.id}**\nMiejsca: **${
          practiceExam.places
        }**\nDodatkowe info: **${practiceExam.additionalInfo}**`,
        color: 0x00ff00, // Green color
        timestamp: new Date().toISOString(),
      },
    ],
  };

  await sendDiscordNotification(message, webhookUrl);
};

export const sendDiscordNotificationAboutDeletedExam = async (id: any) => {
  const webhookUrl = config.webhookURL;

  // const howManyDays = Math.floor(
  //   (new Date(practiceExam.date).getTime() - new Date().getTime()) /
  //     (1000 * 60 * 60 * 24)
  // );

  // const prettyDate = new Date(practiceExam.date).toLocaleString("pl-PL", {
  //   timeZone: "Europe/Warsaw",
  // });

  const message = {
    embeds: [
      {
        title: `Usunięto egzamin ${id}`,
        color: 0xff0000, // Red color
        timestamp: new Date().toISOString(),
      },
    ],
  };

  await sendDiscordNotification(message, webhookUrl);
};

export const sendRepeatingReservationDiscordNotification = async (
  exam,
  name: string
) => {
  let counter = 0;
  while (true) {
    const howManyDays = Math.floor(
      (new Date(exam.date).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const prettyDate = new Date(exam.date).toLocaleString("pl-PL", {
      timeZone: "Europe/Warsaw",
    });

    const message = {
      content: `@everyone EGZAMIN ZAREZERWOWANY ${
        exam.id
      } ${prettyDate} (${name}), (za dni: **${howManyDays}**, tj. ${getPolishWeekDay(
        new Date(exam.date)
      )})`,
    };

    await sendDiscordNotification(message, config.webhookURL);
    if (config.importantWebhookURL)
      await sendDiscordNotification(message, config.importantWebhookURL);

    await sleep(1000 * 30); // Sleep for 30 seconds

    counter++;

    // If for more than 30 mins
    // (60 seconds / 30 seconds) * 30 minutes
    if (counter > (60 / 30) * 30) {
      logger.info("Exciting since the notification has been going on for long");
      process.exit(0);
    }
  }
};

export const sendDiscordNotificationAboutVPN = async (isConnected: boolean) => {
  const message = {
    embeds: [
      {
        title: `VPN ${isConnected ? "połączony" : "rozłączony"}`,
        color: 0xea00ff, // pink color
        timestamp: new Date().toISOString(),
      },
    ],
  };

  await sendDiscordNotification(message, config.webhookURL);
};
