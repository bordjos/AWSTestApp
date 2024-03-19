import { APIGatewayProxyEvent } from "aws-lambda";
import { deleteItem } from "../repositories/delete-item";

export const handler = async (event: APIGatewayProxyEvent) => {
  const id = event.pathParameters?.id;

  if (!id) {
    return {
      statusCode: 400,
      // converts a JS object to a JSON string
      body: JSON.stringify({ message: "Missing path parameter: id" }),
    };
  }

  try {
    await deleteItem({ id });
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Film deleted" }),
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    const typedError = error as Error;

    return {
      statusCode: 500,
      body: JSON.stringify({ message: typedError.message }),
    };
  }
};
