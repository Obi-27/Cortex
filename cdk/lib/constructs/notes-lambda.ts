import { Construct } from 'constructs';
import { NodejsFunction, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import * as s3 from 'aws-cdk-lib/aws-s3';

export interface NotesLambdaProps {
  notesBucket: s3.Bucket;
  environment: string;
}

export class NotesLambda extends Construct {
  public readonly fn: lambda.Function;

  constructor(scope: Construct, id: string, props: NotesLambdaProps) {
    super(scope, id);

    this.fn = new NodejsFunction(this, 'Function', {
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: 'handler',
      entry: path.resolve(process.cwd(), '../app/backend/index.ts'),
      bundling: {
        format: OutputFormat.ESM,
        target: 'node24',
      },
      environment: {
        NOTES_BUCKET_NAME: props.notesBucket.bucketName,
        ENVIRONMENT: props.environment,
      },
    });

    // Grant Lambda access to S3
    props.notesBucket.grantReadWrite(this.fn);
  }
}