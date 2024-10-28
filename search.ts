import { generateBearerToken, getCurrentToken } from "./auth";
import { config } from "./config";
import {
  sendDiscordNotification,
  sendDiscordNotificationAboutDeletedExam,
} from "./discord";
import { logger } from "./logger";
import { sleep } from "./sleep";
import util from "node:util";

let previousExams: any[] = [];

export const search = async () => {
  let retryCount = 0;
  while (true) {
    logger.debug("Checking with retry count: " + retryCount);
    if (retryCount >= 3) {
      logger.error("Failed to update the exam schedule");

      // Exit the program with error code
      process.exit(1);
    }

    try {
      const response = await fetch(
        `https://info-car.pl/api/word/word-centers/exam-schedule`,
        {
          method: "PUT",
          body: JSON.stringify({
            category: config.CATEGORY,
            wordId: config.WORD_ID,
          }),
          headers: {
            "Content-Type": "application/json",
            Authorization: await getCurrentToken(),
          },
        }
      );

      if (response.status !== 200) {
        retryCount++;
        logger.error(
          `Failed to update the exam schedule. Status: ${response.status}`
        );

        // Try to refetch the token
        await generateBearerToken();
      } else {
        const data = await response.json();
        retryCount = 0;

        const dataWithinDays = data.schedule.scheduledDays.filter((date) => {
          return (
            new Date(date.day) >= new Date(config.DATE_FROM) &&
            new Date(date.day) <= new Date(config.DATE_TO)
          );
        });

        const onlyPracticalExams = dataWithinDays.filter((scheduledDate) => {
          return scheduledDate.scheduledHours.some(
            (scheduledHour) => scheduledHour.practiceExams.length !== 0
          );
        });

        if (onlyPracticalExams.length === 0) logger.info("No exams found");

        // console.log(
        //   util.inspect(onlyPracticalExams, {
        //     showHidden: false,
        //     depth: null,
        //     colors: true,
        //   })
        // );
        // console.log(
        //   util.inspect(previousExams, {
        //     showHidden: false,
        //     depth: null,
        //     colors: true,
        //   })
        // );

        const newExams = findChangedPracticalExams(
          onlyPracticalExams,
          previousExams
        );

        // Find if there are any deleted exams
        const allPracticalExamsIds = onlyPracticalExams.flatMap((day) => {
          return day.scheduledHours.flatMap((hour) => {
            return hour.practiceExams.map((exam) => exam.id);
          });
        });

        const previousExamsIds = previousExams.flatMap((day) => {
          return day.scheduledHours.flatMap((hour) => {
            return hour.practiceExams.map((exam) => exam.id);
          });
        });

        const deletedExams = previousExamsIds.filter(
          (id) => !allPracticalExamsIds.includes(id)
        );
        if (deletedExams.length > 0) {
          logger.info("Deleted exams found!");
          logger.debug(deletedExams);
          logger.debug(previousExamsIds);
          logger.debug(allPracticalExamsIds);

          for await (const id of deletedExams) {
            logger.info(`Deleted exam found! id: ${id}`);
            sendDiscordNotificationAboutDeletedExam(id);
          }
        }

        if (newExams.length > 0) {
          logger.info("New exams found!");
          logger.debug(
            util.inspect(newExams, {
              showHidden: false,
              depth: null,
              colors: true,
            })
          );

          // Send notifications
          for await (const exam of newExams) {
            console.log(exam);
            for await (const time of exam.scheduledHours) {
              for await (const practiceExam of time.practiceExams) {
                logger.info(
                  `New exam found! Date: ${practiceExam.date}, id: ${practiceExam.id}, places: ${practiceExam.places}, add. info: ${practiceExam.additionalInfo}`
                );
                // Send notification
                await sendDiscordNotification(practiceExam);
              }
            }
          }

          logger.debug(previousExams);
        } else {
          logger.info("No new exams found");
        }
        previousExams = onlyPracticalExams;

        // console.log(
        //   util.inspect(data, {
        //     showHidden: false,
        //     depth: null,
        //     colors: true,
        //   })
        // );
      }
    } catch (err) {
      logger.error(err);
      retryCount++;
    }

    await sleep(config.SLEEP_TIME_MS);
  }
};
function findChangedPracticalExams(onlyPracticalExams, previousExams) {
  const changedExams = [];

  // Helper function to compare two arrays of practice exams
  function arePracticeExamsDifferent(exams1, exams2) {
    if (exams1.length !== exams2.length) return true;

    for (let i = 0; i < exams1.length; i++) {
      const exam1 = exams1[i];
      const exam2 = exams2[i];

      // Check if any key value is different
      if (
        exam1.id !== exam2.id ||
        (exam1.places !== exam2.places && exam1.places < exam2.places) ||
        exam1.date !== exam2.date ||
        exam1.amount !== exam2.amount ||
        exam1.additionalInfo !== exam2.additionalInfo
      ) {
        return true;
      }
    }

    return false;
  }

  // Loop over each day in the onlyPracticalExams array
  onlyPracticalExams.forEach((onlyPracticalDay) => {
    const matchingPreviousDay = previousExams.find(
      (previousDay) => previousDay.day === onlyPracticalDay.day
    );

    if (!matchingPreviousDay) {
      changedExams.push(onlyPracticalDay);
      return;
    }

    const dayWithChanges = {
      day: onlyPracticalDay.day,
      scheduledHours: [],
    };

    // Loop over each scheduled hour
    onlyPracticalDay.scheduledHours.forEach((onlyPracticalHour) => {
      const matchingPreviousHour = matchingPreviousDay.scheduledHours.find(
        (previousHour) => previousHour.time === onlyPracticalHour.time
      );

      if (!matchingPreviousHour) {
        dayWithChanges.scheduledHours.push(onlyPracticalHour);
        return;
      }

      if (matchingPreviousHour) {
        // Compare the practice exams
        if (
          arePracticeExamsDifferent(
            onlyPracticalHour.practiceExams,
            matchingPreviousHour.practiceExams
          )
        ) {
          dayWithChanges.scheduledHours.push(onlyPracticalHour);
        }
      }
    });

    // If there are changes in this day, add it to the changedExams array
    if (dayWithChanges.scheduledHours.length > 0) {
      changedExams.push(dayWithChanges);
    }
  });

  return changedExams;
}
