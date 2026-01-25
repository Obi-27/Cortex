import type { Handler } from '../types';

export const getNotes: Handler = async () => {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ notes: [] }),
  };
};

export const createNote: Handler = async (event) => {
  const body = JSON.parse(event.body ?? '{}');

  return {
    statusCode: 201,
     headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ note: body }),
  };
};

export const getNoteById: Handler = async (event) => {
  const id = event.pathParameters?.id;

  return {
    statusCode: 200,
     headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  };
};

export const updateNote: Handler = async (event) => {
  const id = event.pathParameters?.id;
  const body = JSON.parse(event.body ?? '{}');

  return {
    statusCode: 200,
     headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, updates: body }),
  };
};

export const deleteNote: Handler = async (event) => {
  const id = event.pathParameters?.id;

  return {
    statusCode: 204,
    headers: {
      "Content-Type": "application/json",
    },
    body: '',
  };
};
