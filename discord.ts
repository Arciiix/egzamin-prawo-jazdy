import { config } from "./myConfig";
import { getPolishWeekDay } from "./date";
import { sleep } from "./sleep";

export const sendDiscordNotificationTryingToReserve = async (
  practiceExam: any,
  name: string
) => {
  const webhookUrl = config.webhookURL;

  // Send @everyone notification before since it's very important
  await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: `@everyone Próba rezerwacji egzaminu ${name}`,
    }),
  });

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

  await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
};

export const sendDiscordNotification = async (practiceExam: any) => {
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

  await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
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

  await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
};

export const sendRepeatingReservationDiscordNotification = async (
  exam,
  name: string
) => {
  while (true) {
    const webhookUrl = config.webhookURL;

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

    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    await sleep(1000 * 30); // Sleep for 30 seconds
  }
};
