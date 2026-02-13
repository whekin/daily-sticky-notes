import { describe, expect, it } from "bun:test";
import { createServer } from "node:http";
import request from "supertest";
import { createApiApp } from "@/server/api/app";

const runSocketBasedTests = process.env["ENABLE_SOCKET_TESTS"] === "1";
const maybeIt = runSocketBasedTests ? it : it.skip;

describe("api app with supertest", () => {
  maybeIt("returns health payload over an HTTP bridge", async () => {
    const app = createApiApp();
    const server = createServer((req, res) => {
      const url = new URL(req.url ?? "/", "http://127.0.0.1");
      const method = req.method ?? "GET";
      const requestInit: RequestInit = {
        method,
        headers: req.headers as Record<string, string>,
      };

      const incoming = new Request(url, requestInit);
      void (async () => {
        const response = await Promise.resolve(app.fetch(incoming));
        res.statusCode = response.status;
        response.headers.forEach((value, key) => {
          res.setHeader(key, value);
        });
        res.end(Buffer.from(await response.arrayBuffer()));
      })();
    });

    const response = await request(server).get("/api/v1/health");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("service", "valentine-api");
  });
});
