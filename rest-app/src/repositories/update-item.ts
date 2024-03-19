import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { IPost } from "../../types";
import * as AWS from "aws-sdk";
import { RepositoryValidationError } from "../errors/repository-validation-error";

// This line initializes a new instance of the DynamoDB client, it will be used to interact with DynamoDB tables
const dynamodb = new DynamoDB({});

// ???
const docClient = new AWS.DynamoDB.DocumentClient();

export async function updateItem({ id }: { id: string }, body: string | null) {
  // If no body, return an error
  if (!body) {
    throw new RepositoryValidationError("Missing body!");
  }

  // Parse the body - JSON.parse converts a JSON string into a JavaScript object
  const bodyParsed = JSON.parse(body) as IPost;

  // Update the post
  await dynamodb.send(
    new PutCommand({
      TableName: process.env.TABLE_NAME,
      Item: {
        pk: `${id}`,
        ...bodyParsed,
      },
    })
  );
}
