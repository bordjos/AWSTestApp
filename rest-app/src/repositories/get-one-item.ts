import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { RepositoryNotFoundError } from "../errors/repository-not-found-error";

const dynamodb = new DynamoDB({});

export async function getOne({ id }: { id: string }) {
  // Get the post from DynamoDB
  const result = await dynamodb.send(
    new GetCommand({
      TableName: process.env.TABLE_NAME,
      Key: {
        pk: `${id}`,
      },
    })
  );

  // If the post is not found, return a 404
  if (!result.Item) {
    return new RepositoryNotFoundError("Item not found!");
  }

  // Otherwise, return the post
  return result.Item;
}
