import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DeleteCommand } from "@aws-sdk/lib-dynamodb";

const dynamodb = new DynamoDB({});

export async function deleteItem({ id }: { id: string }) {
  await dynamodb.send(
    new DeleteCommand({
      TableName: process.env.TABLE_NAME,
      Key: {
        pk: `${id}`,
      },
    })
  );
}
