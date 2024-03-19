import "reflect-metadata";
import { APIGatewayProxyEvent } from "aws-lambda";
import { createItem } from "../repositories/create-item";
import { ValidationError, validate, validateOrReject } from "class-validator";
import { Film } from "../validation/film";

export const handler = async (event: APIGatewayProxyEvent) => {
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing body" }),
    };
  }

  const filmParsed = JSON.parse(event.body) as Film;

  const film = new Film();

  Object.assign(film, filmParsed);

  try {
    await validateOrReject(film);
    // Proceed with creating the item if validation succeeds
    await createItem(film);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Film created" }),
    };
  } catch (errors) {
    // Handle validation errors
    const typedError = errors as ValidationError;
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Validation failed",
        // message: typedError.map((e) => e.constraints).join(", "),
      }),
    };
  }
};
