import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NotesBucket } from './constructs/notes-bucket';
import { NotesLambda } from './constructs/notes-lambda';
import { NotesApi } from './constructs/notes-api';

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    const environment = this.node.tryGetContext('env');
    console.log(environment)
    if (!environment) {
      throw new Error('Context variable "env" is required (dev | prod)');
    }

    const envConfig = this.node.tryGetContext(environment);
    if (!envConfig) {
      throw new Error(`No config found for environment: ${environment}`);
    }

    const notesBucket = new NotesBucket(this, 'NotesBucket', {
      bucketName: envConfig.bucketName,
    });

    const notesLambda =new NotesLambda(this, 'NotesLambda', {
      notesBucket: notesBucket.bucket,
      environment,
    });

    const notesApi = new NotesApi(this, 'NotesApi', {
      notesLambda: notesLambda.fn,
      environment,
    });
  }
}
