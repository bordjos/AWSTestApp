import { SQSEvent } from "aws-lambda";
import { createItem } from "../../repositories/create-item";
import { Film, createFilm } from "../../validation/film";

export const handler = async (event: SQSEvent) => {
  try {
    const message = event.Records[0].body;
    const parsedMessage = JSON.parse(message);
    const film = parsedMessage.message;

    console.log("message: ", message);
    console.log("film: ", film);

    await createItem(film);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Film created" }),
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "There was a problem with creating the film",
      }),
    };
  }
};
