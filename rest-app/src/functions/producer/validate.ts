import "reflect-metadata";
import { APIGatewayProxyEvent } from "aws-lambda";
import { createItem } from "../../repositories/create-item";
import { ValidationError, validate, validateOrReject } from "class-validator";
import { Film } from "../../validation/film";
import sqs = require("@aws-sdk/client-sqs");

const client = new sqs.SQSClient();

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

  console.log("film: ", film);

  try {
    // validates the input and if the validation fails it throws an error
    await validateOrReject(film);

    // Get the queue URL from the execution environment
    const queueUrl = process.env.SQS_URL;

    // Create a SendMessageCommand containing the message
    // and the queue URL
    const command = new sqs.SendMessageCommand({
      MessageBody: JSON.stringify({ message: film }),
      QueueUrl: queueUrl,
    });

    // Send the message and return the result
    const result = await client.send(command);
    // return result;

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Film validated successfully",
        result: result,
      }),
    };
    
    // Proceed with creating the item if validation succeeds
    // await createItem(film);

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
