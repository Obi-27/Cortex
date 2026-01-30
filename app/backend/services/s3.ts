import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';

const client = new S3Client({});

const BUCKET = process.env.NOTES_BUCKET_NAME!;
const PREFIX = 'notes/';

export const putNote = async (id: string, body: object) => {
  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: `${PREFIX}${id}.json`,
      Body: JSON.stringify(body),
      ContentType: 'application/json',
    })
  );
};

export const getNote = async (id: string) => {
  const res = await client.send(
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: `${PREFIX}${id}.json`,
    })
  );

  const text = await res.Body!.transformToString();
  return JSON.parse(text);
};

export const deleteNote = async (id: string) => {
  await client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: `${PREFIX}${id}.json`,
    })
  );
};

export const listNotes = async () => {
  const res = await client.send(
    new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: PREFIX,
    })
  );

  return res.Contents?.map(obj => ({
    id: obj.Key!.replace(PREFIX, '').replace('.json', ''),
    updatedAt: obj.LastModified?.toISOString(),
  })) ?? [];
};
