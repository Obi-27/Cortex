import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export interface NotesApiProps {
  notesLambda: lambda.Function;
  environment: string;
}

export class NotesApi extends Construct {
  public readonly api: apigateway.RestApi;

  constructor(scope: Construct, id: string, props: NotesApiProps) {
    super(scope, id);

    this.api = new apigateway.RestApi(this, 'NotesApi', {
      restApiName: `notes-api-${props.environment}`,
      deployOptions: {
        stageName: props.environment,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const lambdaIntegration = new apigateway.LambdaIntegration(
      props.notesLambda
    );

    // /notes
    const notes = this.api.root.addResource('notes');

    notes.addMethod('GET', lambdaIntegration);
    notes.addMethod('POST', lambdaIntegration);

    // /notes/{id}
    const noteById = notes.addResource('{id}');
    noteById.addMethod('GET', lambdaIntegration);
    noteById.addMethod('PUT', lambdaIntegration);
    noteById.addMethod('DELETE', lambdaIntegration);
  }
}