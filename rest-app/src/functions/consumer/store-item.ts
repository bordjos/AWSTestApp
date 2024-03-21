import { SQSEvent } from "aws-lambda";
import { createItem } from "../../repositories/create-item";
import { Film, createFilm } from "../../validation/film";

export const handler = async (event: SQSEvent) => {
  try {
    // const message = event.Records[0].body;

    // const parsedMessage = JSON.parse(message);
    // const film = parsedMessage.message;

    for (const record of event.Records) {
      const message = record.body;
      const parsedMessage = JSON.parse(message);
      const film = parsedMessage.message;

      console.log("message: ", message);
      console.log("film: ", film);

      await createItem(film);
    }
  } catch (error) {
    console.log(error);
  }
};
