import { APIGatewayProxyEvent } from "aws-lambda";
import { getAll } from "../repositories/get-all-items";

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const items = await getAll();

    return {
      statusCode: 200,
      body: JSON.stringify(items),
    };
  } catch (error) {
    const typedError = error as Error;

    return {
      statusCode: 500,
      body: JSON.stringify({ message: typedError.message }),
    };
  }
};
