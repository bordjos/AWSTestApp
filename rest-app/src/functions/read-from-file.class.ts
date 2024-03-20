import { DynamoDB, S3 } from "aws-sdk";
import { createReadStream, readFileSync } from "fs";
import { error } from "console";
import { Film } from "../validation/film";
import { createItem } from "../repositories/create-item";
import path = require("path");
import { Aws } from "aws-cdk-lib";
// import * as csvParser from 'csv-parser';
import csv = require("csv-parser");

export class ReadFromFile<T extends object> {
  readonly headers: string[];
  readonly path: string;

  constructor(headers: string[], path: string) {
    this.headers = headers;
    this.path = path;
  }

  async processData(): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const results: T[] = [];

      createReadStream(this.path)
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", () => {
          resolve(results); // Resolve the promise with the results
        })
        .on("error", (error) => {
          reject(error); // Reject the promise if there's an error
        });
    });
  }
}

// // Example usage
// const createItem = async (item: any) => {
//   // Implementation of createItem
// };

// const filmProcessor = new FilmProcessor(createItem);
// filmProcessor.processFilms();
