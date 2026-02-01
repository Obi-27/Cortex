import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  ListObjectVersionsCommand,
} from '@aws-sdk/client-s3';

const client = new S3Client({});

const BUCKET = process.env.NOTES_BUCKET_NAME!;
const PREFIX = 'notes/';

export const updateNote = async (
  id: string,
  note: object,
  expectedEtag: string
) => {
  try {
    const res = await client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: `${PREFIX}${id}.json`,
        Body: JSON.stringify(note),
        ContentType: 'application/json',
        IfMatch: expectedEtag, // let S3 enforce concurrency
      })
    );

    return {
      etag: res.ETag?.replace(/"/g, ''),
    };
  } catch (err: any) {
    if (err.name === 'PreconditionFailed') {
      throw new Error('ETAG_MISMATCH');
    }
    throw err;
  }
};

export const getNote = async (id: string) => {
  const res = await client.send(
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: `${PREFIX}${id}.json`,
    })
  );

  const body = await res.Body!.transformToString();
  return {
    note: JSON.parse(body),
    etag: res.ETag!,
  };
};

export const deleteNote = async (
  id: string,
  expectedEtag: string
) => {
  try {
    await client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: `${PREFIX}${id}.json`,
        IfMatch: expectedEtag, // enforce concurrency
      })
    );
  } catch (err: any) {
    if (err.name === 'PreconditionFailed') {
      throw new Error('ETAG_MISMATCH');
    }
    throw err;
  }
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

export const createNote = async (id: string, note: object) => {
  const res = await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: `${PREFIX}${id}.json`,
      Body: JSON.stringify(note),
      ContentType: 'application/json',
      IfNoneMatch: '*', // fail if object already exists
    })
  );

  return {
    etag: res.ETag?.replace(/"/g, ''),
  };
};

export const listNoteVersions = async (id: string) => {
  const res = await client.send(
    new ListObjectVersionsCommand({
      Bucket: BUCKET,
      Prefix: `${PREFIX}${id}.json`,
    })
  );

  const versions = res.Versions ?? [];

  return versions.map(v => ({
    versionId: v.VersionId!,
    etag: v.ETag?.replace(/"/g, ''),
    lastModified: v.LastModified?.toISOString(),
    isLatest: v.IsLatest,
    size: v.Size,
  }));
};

export const getNoteVersion = async (
  id: string,
  versionId: string
) => {
  const res = await client.send(
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: `${PREFIX}${id}.json`,
      VersionId: versionId,
    })
  );

  const body = await res.Body!.transformToString();

  return {
    note: JSON.parse(body),
    etag: res.ETag?.replace(/"/g, ''),
    versionId,
  };
};

export const restoreNoteVersion = async (
  id: string,
  versionId: string
) => {
  const old = await getNoteVersion(id, versionId);

  const now = new Date().toISOString();

  const restored = {
    ...old.note,
    updatedAt: now,
  };

  const res = await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: `${PREFIX}${id}.json`,
      Body: JSON.stringify(restored),
      ContentType: 'application/json',
    })
  );

  return {
    etag: res.ETag?.replace(/"/g, ''),
  };
};