import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  getNotes,
  createNote,
  getNoteById,
  updateNote,
  deleteNote,
} from './handlers/notes';

type RouteKey = `${string} ${string}`;

const routes: Record<RouteKey, any> = {
  'GET /notes': getNotes,
  'POST /notes': createNote,
  'GET /notes/{id}': getNoteById,
  'PUT /notes/{id}': updateNote,
  'DELETE /notes/{id}': deleteNote,
};

function normalizePath(path: string): string {
  // /notes/123 -> /notes/{id}
  const parts = path.split('/').filter(Boolean);

  if (parts.length === 2) {
    return '/notes/{id}';
  }

  return `/${parts.join('/')}`;
}

export async function route(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const method = event.httpMethod;
  const path = normalizePath(event.path);

  const key = `${method} ${path}` as RouteKey;
  const handler = routes[key];

  if (!handler) {
    return {
      statusCode: 404,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: 'Route not found' }),
    };
  }

  try {
    return await handler(event);
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
}
