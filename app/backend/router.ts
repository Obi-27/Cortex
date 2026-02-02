import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { error } from './http/responses.js';
import { ErrorCodes } from './http/errors.js';
import {
  listNotes,
  getNote,
  createNote,
  deleteNote,
  updateNote,
  getNoteHistory,
  getNoteVersion,
  restoreNoteVersion,
} from './routes/notes.js';

type Handler = (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>;

const routes: Record<string, Handler> = {
  'GET /notes': listNotes,
  'POST /notes': createNote,

  'GET /notes/{id}': getNote,
  'PUT /notes/{id}': updateNote,
  'DELETE /notes/{id}': deleteNote,

  'GET /notes/{id}/history': getNoteHistory,
  'GET /notes/{id}/versions/{versionId}': getNoteVersion,
  'POST /notes/{id}/restore/{versionId}': restoreNoteVersion,
};

export const route = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const method = event.httpMethod;
    const resource = event.resource;

    const key = `${method} ${resource}`;

    const handler = routes[key];
    if (!handler) {
      return error(
        404,
        ErrorCodes.NOT_FOUND,
        `No route for ${method} ${resource}`,
      );
    }

    return await handler(event);
  } catch (err) {
    console.error('Unhandled error', err);
    return error(500, ErrorCodes.INTERNAL_ERROR, 'Internal server error');
  }
};
