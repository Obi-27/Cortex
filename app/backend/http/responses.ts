import type { APIGatewayProxyResult } from 'aws-lambda';
import type { ErrorCode } from './errors';

export const json = (
  statusCode: number,
  body: unknown,
  headers: Record<string, string> = {}
): APIGatewayProxyResult => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    ...headers,
  },
  body: JSON.stringify(body),
});

export const ok = (data: unknown): APIGatewayProxyResult =>
  json(200, { ok: true, data });

export const created = (data: unknown): APIGatewayProxyResult =>
  json(201, { ok: true, data });

export const noContent = (): APIGatewayProxyResult => ({
  statusCode: 204,
  headers: {},
  body: '',
});

export const error = (
  statusCode: number,
  code: ErrorCode,
  message: string
): APIGatewayProxyResult =>
  json(statusCode, {
    ok: false,
    error: { code, message },
  });
