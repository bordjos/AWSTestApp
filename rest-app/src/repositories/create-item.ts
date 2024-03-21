import { DynamoDB, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import { IPost } from "../../types";
import { RepositoryValidationError } from "../errors/repository-validation-error";
import { Film } from "../validation/film";

// This line initializes a new instance of the DynamoDB client, it will be used to interact with DynamoDB tables
const dynamodb = new DynamoDB({});

// da li ovo da koristim?
// const dynamoClient = new DynamoDBClient({});
// const docClient = DynamoDBDocumentClient.from(dynamoClient);

export async function createItem(body: Film) {
  // generate a random uuid
  const uuid = randomUUID();

  console.log("film inside of createItem():", body);

  // Parse the body - JSON.parse converts a JSON string into a JavaScript object

  // Create the post
  await dynamodb.send(
    new PutCommand({
      TableName: process.env.TABLE_NAME,
      Item: {
        pk: `${uuid}`,
        ...body,
      },
    })
  );
}
