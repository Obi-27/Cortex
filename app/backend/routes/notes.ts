import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ok } from '../http/responses';

export const listNotes = async (
  _event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  return ok({ notes: [] });
};

export const getNote = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;
  return ok({ id, content: '' });
};

export const putNote = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;
  return ok({ id, updatedAt: new Date().toISOString() });
};

export const deleteNote = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;
  return ok({ id, deleted: true });
};
