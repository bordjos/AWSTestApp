import * as cdk from "aws-cdk-lib";
import {
  ApiKey,
  ApiKeySourceType,
  Cors,
  LambdaIntegration,
  RestApi,
  UsagePlan,
} from "aws-cdk-lib/aws-apigateway";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class RestAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create DynamoDB table
    const dbTable = new Table(this, "DbTable", {
      partitionKey: { name: "pk", type: AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
      tableName: "FilmsTable"
    });

    // Create REST API - this API will expose endpoints to interact with the application
    const api = new RestApi(this, "RestAPI", {
      restApiName: "RestAPI",
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
      },
      apiKeySourceType: ApiKeySourceType.HEADER,
    });

    // Create ApiKey - it acts as a token that API consumers include in their requests to the API to prove their identity and authorization to access the API's resources
    const apiKey = new ApiKey(this, "ApiKey");

    // Create UsagePlan - a usage plan in the context of AWS API Gateway is a mechanism for managing and controlling access to your APIs. It allows you to define usage policies, set access quotas, and apply throttling limits to different client applications or API consumers
    const usagePlan = new UsagePlan(this, "UsagePlan", {
      name: "Usage Plan",
      apiStages: [
        {
          api,
          stage: api.deploymentStage,
        },
      ],
    });

    usagePlan.addApiKey(apiKey);

    // defining Lambdas
    const createFilmLambda = new NodejsFunction(this, "CreateLambda", {
      entry: "src/functions/create.ts",
      handler: "handler",
      environment: {
        TABLE_NAME: dbTable.tableName,
      },
    });

    const getFilmLambda = new NodejsFunction(this, "GetLambda", {
      entry: "src/functions/get-one.ts",
      handler: "handler",
      environment: {
        TABLE_NAME: dbTable.tableName, // "DbTable"???
      },
    });

    const getAllFilmsLambda = new NodejsFunction(this, "GetAllLambda", {
      entry: "src/functions/get-all.ts",
      handler: "handler",
      environment: {
        TABLE_NAME: dbTable.tableName,
      },
    });

    const updateFilmLambda = new NodejsFunction(this, "UpdateLambda", {
      entry: "src/functions/update.ts",
      handler: "handler",
      environment: {
        TABLE_NAME: dbTable.tableName,
      },
    });

    const deleteFilmLambda = new NodejsFunction(this, "DeleteLambda", {
      entry: "src/functions/delete.ts",
      handler: "handler",
      environment: {
        TABLE_NAME: dbTable.tableName,
      },
    });

    dbTable.grantReadWriteData(createFilmLambda);
    dbTable.grantReadWriteData(getFilmLambda);
    dbTable.grantReadWriteData(getAllFilmsLambda);
    dbTable.grantReadWriteData(updateFilmLambda);
    dbTable.grantReadWriteData(deleteFilmLambda);

    // creating routes?
    const films = api.root.addResource("films"); // /films
    const film = films.addResource("{id}"); // /films/id

    // integration with Lambdas
    const createFilmIntegration = new LambdaIntegration(createFilmLambda);
    const getFilmIntegration = new LambdaIntegration(getFilmLambda);
    const getAllFilmsIntegration = new LambdaIntegration(getAllFilmsLambda);
    const updateFilmIntegration = new LambdaIntegration(updateFilmLambda);
    const deleteFilmIntegration = new LambdaIntegration(deleteFilmLambda);

    films.addMethod("GET", getAllFilmsIntegration, {
      apiKeyRequired: true,
    });
    film.addMethod("GET", getFilmIntegration, {
      apiKeyRequired: true,
    });
    films.addMethod("POST", createFilmIntegration, {
      apiKeyRequired: true,
    });
    film.addMethod("PUT", updateFilmIntegration, {
      apiKeyRequired: true,
    });
    film.addMethod("DELETE", deleteFilmIntegration, {
      apiKeyRequired: true,
    });

    // adds an output to the console
    new cdk.CfnOutput(this, "API Key ID", {
      value: apiKey.keyId,
    });
  }
}