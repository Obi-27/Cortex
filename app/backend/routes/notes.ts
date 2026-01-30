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
    const note = await s3.getNote(id);
    return ok(note);
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

  await s3.putNote(id, note);
  return created(note);
};

export const updateNote = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;
  if (!id || !event.body) {
    return error(400, ErrorCodes.BAD_REQUEST, 'Invalid request');
  }

  const { title, content } = JSON.parse(event.body);

  const note = {
    id,
    title,
    content,
    updatedAt: new Date().toISOString(),
  };

  await s3.putNote(id, note);
  return ok(note);
};

export const deleteNote = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;
  if (!id) {
    return error(400, ErrorCodes.BAD_REQUEST, 'Missing note id');
  }

  await s3.deleteNote(id);
  return ok({ id });
};
