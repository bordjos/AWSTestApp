import { DynamoDB } from "aws-sdk";
import { fstat, readFileSync } from "fs";
import { resolve } from "path";
import { parse } from "csv-parse";
import { Film, createFilm } from "../validation/film";
import { createItem } from "../repositories/create-item";
import { ReadFromFile } from "./read-from-file.class";
import { FilmDTO } from "../dto/read-from-csv-dto";
import { S3Event } from "aws-lambda";
import AWS = require("aws-sdk");
import { ReceiptFilter } from "aws-cdk-lib/aws-ses";
import fs = require("fs");

const s3 = new AWS.S3();

export const handler = async (event: S3Event) => {
  console.log("Inside of Lambda");

  try {
    const headers = [
      "film",
      "director",
      "cast",
      "length",
      "distributor",
      "country",
      "year",
      "about",
      "posterURL",
    ];
    const record = event.Records[0];

    console.log("event: ", event);

    console.log("event.Records", event.Records);

    console.log("record: ", record);

    // download the file from S3 bucket into /tmp folder
    const s3Object = await s3
      .getObject({
        Bucket: record.s3.bucket.name,
        Key: record.s3.object.key,
      })
      .promise();
    console.log("s3Object: ", s3Object);

    const fileName = `/tmp/${record.s3.object.key}`;
    fs.writeFileSync(fileName, s3Object.Body as string);
    console.log("DOWNLOADED FILE");

    const readFromFile = new ReadFromFile<FilmDTO>(headers, fileName);
    const films = await readFromFile.processData();
    for (const item of films) {
      const filmObject = createFilm(item);
      console.log("filmObject:", filmObject);

      await createItem(filmObject);
    }
  } catch (error) {
    console.log("Error in Lambda function:", error);
  }
};
