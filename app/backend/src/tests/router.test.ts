import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { APIGatewayProxyEvent } from 'aws-lambda';

vi.mock('../routes/notes.js', () => ({
  listNotes: vi.fn(),
  getNote: vi.fn(),
  putNote: vi.fn(),
  createNote: vi.fn(),
  updateNote: vi.fn(),
  deleteNote: vi.fn(),
  getNoteHistory: vi.fn(),
  getNoteVersion: vi.fn(),
  restoreNoteVersion: vi.fn(),
}));

import { route } from '../router.js';
import * as notes from '../routes/notes.js';

const apiEvent = (
  method: string,
  resource: string,
  overrides: Partial<APIGatewayProxyEvent> = {}
): APIGatewayProxyEvent =>
  ({
    httpMethod: method,
    resource,
    path: resource,
    headers: {},
    multiValueHeaders: {},
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    pathParameters: null,
    stageVariables: null,
    requestContext: {} as any,
    body: null,
    isBase64Encoded: false,
    ...overrides,
  } as APIGatewayProxyEvent);

describe('router', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // route matches
  it('routes GET /notes to listNotes', async () => {
    (notes.listNotes as any).mockResolvedValue({
      statusCode: 200,
      body: 'ok',
    });

    const res = await route(apiEvent('GET', '/notes'));

    expect(notes.listNotes).toHaveBeenCalledOnce();
    expect(res.statusCode).toBe(200);
  });

  // Route with path param
  it('routes GET /notes/{id} to getNote', async () => {
    (notes.getNote as any).mockResolvedValue({
      statusCode: 200,
      body: 'note',
    });

    const res = await route(
      apiEvent('GET', '/notes/{id}', {
        pathParameters: { id: '123' },
      })
    );

    expect(notes.getNote).toHaveBeenCalledOnce();
    expect(res.statusCode).toBe(200);
  });

  // Unknown route → 404
  it('returns 404 for unknown route', async () => {
    const res = await route(apiEvent('POST', '/unknown'));

    expect(res.statusCode).toBe(404);
    expect(JSON.parse(res.body).error.code).toBe('NOT_FOUND');
  });

  //Handler throws → 500
  it('returns 500 if handler throws', async () => {
    (notes.listNotes as any).mockRejectedValue(
      new Error('boom')
    );

    const res = await route(apiEvent('GET', '/notes'));

    expect(res.statusCode).toBe(500);
    expect(JSON.parse(res.body).error.code).toBe(
      'INTERNAL_ERROR'
    );
  });
});


