import { Handler } from "@netlify/functions";

const handler: Handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      status: "ok",
      platform: "netlify",
      time: new Date().toISOString(),
      method: event.httpMethod,
      path: event.path
    }),
  };
};

export { handler };
