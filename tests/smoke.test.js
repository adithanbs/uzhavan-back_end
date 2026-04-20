process.env.NODE_ENV = "test";
process.env.MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/uzhamart_test";
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";

const assert = require("node:assert/strict");
const test = require("node:test");
const app = require("../dist/app").default;

const createServer = () => {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, "127.0.0.1");

    server.once("error", reject);
    server.once("listening", () => {
      const address = server.address();

      if (!address || typeof address === "string") {
        reject(new Error("Test server did not start on a TCP port."));
        return;
      }

      resolve({
        baseUrl: `http://127.0.0.1:${address.port}`,
        close: () => new Promise((closeResolve) => server.close(closeResolve))
      });
    });
  });
};

test("health endpoint returns service status", async () => {
  const server = await createServer();

  try {
    const response = await fetch(`${server.baseUrl}/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.success, true);
    assert.equal(body.data.service, "uzhavan-back_end");
  } finally {
    await server.close();
  }
});

test("product route rejects invalid ids before hitting the database", async () => {
  const server = await createServer();

  try {
    const response = await fetch(`${server.baseUrl}/api/products/not-a-valid-id`);
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.success, false);
    assert.equal(body.message, "Invalid product id");
  } finally {
    await server.close();
  }
});

test("unknown routes return a normalized 404 response", async () => {
  const server = await createServer();

  try {
    const response = await fetch(`${server.baseUrl}/missing-route`);
    const body = await response.json();

    assert.equal(response.status, 404);
    assert.equal(body.success, false);
  } finally {
    await server.close();
  }
});
