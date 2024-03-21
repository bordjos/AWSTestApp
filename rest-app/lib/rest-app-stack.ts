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
import { RemovalPolicy } from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { S3DeployAction } from "aws-cdk-lib/aws-codepipeline-actions";
import { ReadFromFile } from "../src/functions/read-from-file.class";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";

export class RestAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create DynamoDB table
    const dbTable = new Table(this, "DbTable", {
      partitionKey: { name: "pk", type: AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
      tableName: "FilmsTable",
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

    const queue = new Queue(this, "Queue", {
      queueName: "MyCDKQueue",
    });

    // defining Lambdas

    // producer
    const validateFilmLambda = new NodejsFunction(this, "ValidateLambda", {
      runtime: Runtime.NODEJS_20_X,
      entry: "src/functions/producer/validate.ts",
      handler: "handler",
      environment: {
        TABLE_NAME: dbTable.tableName,
        SQS_URL: queue.queueUrl,
      },
    });

    // consumer
    const storeFilmLambda = new NodejsFunction(this, "StoreLambda", {
      runtime: Runtime.NODEJS_20_X,
      entry: "src/functions/consumer/store-item.ts",
      handler: "handler",
      environment: {
        TABLE_NAME: dbTable.tableName, // "DbTable"???
      },
    });

    storeFilmLambda.addEventSource(new SqsEventSource(queue));
    queue.grantConsumeMessages(storeFilmLambda);

    const getFilmLambda = new NodejsFunction(this, "GetLambda", {
      runtime: Runtime.NODEJS_20_X,
      entry: "src/functions/get-one.ts",
      handler: "handler",
      environment: {
        TABLE_NAME: dbTable.tableName, // "DbTable"???
      },
    });

    const getAllFilmsLambda = new NodejsFunction(this, "GetAllLambda", {
      runtime: Runtime.NODEJS_20_X,
      entry: "src/functions/get-all.ts",
      handler: "handler",
      environment: {
        TABLE_NAME: dbTable.tableName,
      },
    });

    const updateFilmLambda = new NodejsFunction(this, "UpdateLambda", {
      runtime: Runtime.NODEJS_20_X,
      entry: "src/functions/update.ts",
      handler: "handler",
      environment: {
        TABLE_NAME: dbTable.tableName,
      },
    });

    const deleteFilmLambda = new NodejsFunction(this, "DeleteLambda", {
      runtime: Runtime.NODEJS_20_X,
      entry: "src/functions/delete.ts",
      handler: "handler",
      environment: {
        TABLE_NAME: dbTable.tableName,
      },
    });

    // const storeNewFilmLambda = new NodejsFunction(this, "DeleteLambda", {
    //   runtime: Runtime.NODEJS_20_X,
    //   entry: "src/functions/store-film.ts",
    //   handler: "handler",
    //   environment: {
    //     TABLE_NAME: dbTable.tableName,
    //   },
    // });

    queue.grantSendMessages(validateFilmLambda);
    // dbTable.grantReadWriteData(validateFilmLambda);
    dbTable.grantReadWriteData(getFilmLambda);
    dbTable.grantReadWriteData(getAllFilmsLambda);
    dbTable.grantReadWriteData(updateFilmLambda);
    dbTable.grantReadWriteData(deleteFilmLambda);
    dbTable.grantReadWriteData(storeFilmLambda);

    // creating routes?
    const films = api.root.addResource("films"); // /films
    const film = films.addResource("{id}"); // /films/id

    // integration with Lambdas
    const createFilmIntegration = new LambdaIntegration(validateFilmLambda);
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

    const bucket = new s3.Bucket(this, "FilmsBucket", {
      // blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      // encryption: s3.BucketEncryption.S3_MANAGED,
      // enforceSSL: true,
      // versioned: true,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      bucketName: "films-bucket",
    });

    // new cdk.aws_s3_deployment.BucketDeployment(this, "Deployment", {
    //   sources: [cdk.aws_s3_deployment.Source.asset("src/csv")],
    //   destinationBucket: bucket,
    // });

    const filmsReadWriteDB = new NodejsFunction(this, "FilmsReadWriteDB", {
      runtime: Runtime.NODEJS_20_X,
      entry: "src/functions/read-file-csv.ts",
      handler: "handler",
      environment: {
        TABLE_NAME: dbTable.tableName,
      },
    });

    bucket.grantReadWrite(filmsReadWriteDB);
    dbTable.grantReadWriteData(filmsReadWriteDB);

    const s3PutEventSource = new cdk.aws_lambda_event_sources.S3EventSource(
      bucket,
      {
        events: [s3.EventType.OBJECT_CREATED_PUT],
      }
    );

    filmsReadWriteDB.addEventSource(s3PutEventSource);
  }
}
