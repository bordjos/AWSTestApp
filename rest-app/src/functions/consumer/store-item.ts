import { SQSEvent, SQSRecord } from "aws-lambda";
import { createItem } from "../../repositories/create-item";
import { Film, createFilm } from "../../validation/film";
import { validateOrReject } from "class-validator";

export const handler = async (event: SQSEvent) => {
  const batchItemFailures: { ItemIdentifier: string }[] = [];

  for (const record of event.Records) {
    try {
      const message = record.body;
      const parsedMessage = JSON.parse(message);
      const film: Film = parsedMessage.message;

      //   await validateOrReject(film);

      console.log("message: ", message);
      console.log("film: ", film);

      await processMessageAsync(record);

      await createItem(film);
    } catch (error) {
      console.log(error);
      batchItemFailures.push({ ItemIdentifier: record.messageId });
    }
  }

  return { batchItemFailures };
};

async function processMessageAsync(record: SQSRecord): Promise<void> {
  if (!record.body) {
    throw new Error("There is an error in the SQS message.");
  }

  throw new Error("INTENTIONAL ERROR BY BODJA!!!");

  console.log(`Processed message: ${record.body}`);
}
