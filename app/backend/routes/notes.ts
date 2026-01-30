import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ok, created, error } from '../http/responses.js';
import { ErrorCodes } from '../http/errors.js';
import * as s3 from '../services/s3.js';
import { randomUUID } from 'crypto';

export const listNotes = async (): Promise<APIGatewayProxyResult> => {
  const notes = await s3.listNotes();
  return ok({ notes });
};

export const getNote = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;
  if (!id) {
    return error(400, ErrorCodes.BAD_REQUEST, 'Missing note id');
  }

  try {
    const { note, etag } = await s3.getNote(id);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        ETag: etag,
      },
      body: JSON.stringify({ ok: true, data: note }),
    };
  } catch {
    return error(404, ErrorCodes.NOT_FOUND, 'Note not found');
  }
};

export const createNote = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  if (!event.body) {
    return error(400, ErrorCodes.BAD_REQUEST, 'Missing request body');
  }

  const { title, content } = JSON.parse(event.body);

  const now = new Date().toISOString();
  const id = randomUUID();

  const note = {
    id,
    title,
    content,
    createdAt: now,
    updatedAt: now,
  };

  const { etag } = await s3.createNote(id, note);

  return {
    ...created(note),
    headers: {
      ETag: etag ?? '',
    },
  };
};

export const updateNote = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;
  const ifMatch = event.headers['If-Match'] || event.headers['if-match'];

  if (!id || !event.body) {
    return error(400, ErrorCodes.BAD_REQUEST, 'Invalid request');
  }

  if (!ifMatch) {
    return error(
      428,
      ErrorCodes.PRECONDITION_REQUIRED,
      'Missing If-Match header'
    );
  }

  const payload = JSON.parse(event.body);

  const note = {
    ...payload,
    id,
    updatedAt: new Date().toISOString(),
  };

  try {
    const { etag } = await s3.updateNote(id, note, ifMatch);

    return {
      ...ok(note),
      headers: {
        ETag: etag ?? '',
      },
    };
  } catch (err) {
    if ((err as Error).message === 'ETAG_MISMATCH') {
      return error(
        412,
        ErrorCodes.CONFLICT,
        'Note was modified elsewhere'
      );
    }

    throw err;
  }
};

export const deleteNote = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;
  const ifMatch = event.headers['If-Match'] || event.headers['if-match'];

  if (!id) {
    return error(400, ErrorCodes.BAD_REQUEST, 'Missing note id');
  }

  if (!ifMatch) {
    return error(
      428,
      ErrorCodes.PRECONDITION_REQUIRED,
      'Missing If-Match header'
    );
  }

  try {
    await s3.deleteNote(id, ifMatch);
    return {
      statusCode: 204,
      body: '',
    };
  } catch (err) {
    if ((err as Error).message === 'ETAG_MISMATCH') {
      return error(
        412,
        ErrorCodes.CONFLICT,
        'Note was modified elsewhere'
      );
    }

    throw err;
  }
};
