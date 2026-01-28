import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { error } from './http/responses';
import { ErrorCodes } from './http/errors';

import {
  listNotes,
  getNote,
  putNote,
  deleteNote,
} from './routes/notes';

type Handler = (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>;

const routes: Record<string, Handler> = {
  'GET /notes': listNotes,
  'GET /notes/{id}': getNote,
  'PUT /notes/{id}': putNote,
  'DELETE /notes/{id}': deleteNote,
};

export const route = async (
  event: APIGatewayProxyEvent
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
        `No route for ${method} ${resource}`
      );
    }

    return await handler(event);
  } catch (err) {
    console.error('Unhandled error', err);
    return error(
      500,
      ErrorCodes.INTERNAL_ERROR,
      'Internal server error'
    );
  }
};