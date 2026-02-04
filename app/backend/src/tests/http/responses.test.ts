import { describe, it, expect } from 'vitest';
import { ok, created, error } from '../../http/responses.js';

describe('http responses', () => {
  it('ok() returns 200 with body', () => {
    const res = ok({ hello: 'world' });

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ 
      ok: true, 
      data: { hello: 'world' } 
    });
  });

  it('created() returns 201 with body', () => {
    const res = created({ id: '123' });

    expect(res.statusCode).toBe(201);
    expect(JSON.parse(res.body)).toEqual({ 
      ok: true, 
      data: { id: '123' } 
    });
  });

  it('error() returns correct shape', () => {
    const res = error(404, 'NOT_FOUND', 'Missing');

    expect(res.statusCode).toBe(404);

    const body = JSON.parse(res.body);
    expect(body).toEqual({
      ok: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Missing',
      },
    });
  });
});
