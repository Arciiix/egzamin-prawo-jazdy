import { config } from "./config";
import { getPolishWeekDay } from "./date";

export const sendDiscordNotification = async (practiceExam: any) => {
  const webhookUrl = config.WEBHOOK_URL;

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

  await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
};

export const sendDiscordNotificationAboutDeletedExam = async (id: any) => {
  const webhookUrl = config.WEBHOOK_URL;

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

  await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
};
