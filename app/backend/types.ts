import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export type Handler = (
  event: APIGatewayProxyEvent,
) => Promise<APIGatewayProxyResult>;
