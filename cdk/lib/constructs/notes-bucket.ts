import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';

export interface NotesBucketProps {
  bucketName: string;
}

export class NotesBucket extends Construct {
  public readonly bucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: NotesBucketProps) {
    super(scope, id);

    this.bucket = new s3.Bucket(this, 'NotesBucket', {
      bucketName: props.bucketName,
      versioned : true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });
  }
}