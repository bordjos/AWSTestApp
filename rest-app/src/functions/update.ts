import { APIGatewayProxyEvent } from "aws-lambda";
import { updateItem } from "../repositories/update-item";
import { Film } from "../validation/film";
import { validateOrReject } from "class-validator";

export const handler = async (event: APIGatewayProxyEvent) => {
  const id = event.pathParameters?.id;

  if (!id) {
    return {
      statusCode: 400,
      // converts a JS object to a JSON string
      body: JSON.stringify({ message: "Missing path parameter: id" }),
    };
  }

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

    await updateItem({ id }, event.body);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Film updated" }),
    };
  } catch (error) {
    const typedError = error as Error;

    return {
      statusCode: 400,
      body: JSON.stringify({ message: typedError.message }),
    };
  }
};
