import { APIGatewayProxyEvent } from "aws-lambda";
import { getOne } from "../repositories/get-one-item";
import { apiResponse } from "../utils/api-response";

export const handler = async (event: APIGatewayProxyEvent) => {
  const id = event.pathParameters?.id;

  if (!id) {
    return apiResponse(400, "Missing parameter id");
  }

  try {
    // Handle different HTTP methods

    const item = await getOne({ id }); // zasto se pass-uje kao objekat?

    return {
      statusCode: 200,
      body: JSON.stringify(item),
    };
  } catch (error) {
    const typedError = error as Error;

    return {
      statusCode: 404,
      body: JSON.stringify({ message: typedError.message }),
    };

  }
};
