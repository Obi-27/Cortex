export const handler = async (event) => {
  const method = event.httpMethod;
  const id = event.pathParameters?.id;

  if (method === 'GET' && id) {
    return {
      statusCode: 200,
      body: JSON.stringify({ id, message: 'Get note' }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello from Notes API' }),
  };
};