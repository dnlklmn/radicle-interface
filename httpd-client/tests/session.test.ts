import { HttpdClient } from "../index";
import { describe, test } from "vitest";
import { authenticate } from "./support/httpd";

const api = new HttpdClient({
  hostname: "127.0.0.1",
  port: 8080,
  scheme: "http",
});

describe("session", () => {
  test("#getById(id)", async () => {
    const id = await authenticate(api);
    await api.session.getById(id);
  });

  // TODO: We have the endpoint ready, but we need to figure out how to sign the session payload.
  test.todo("#update(id, {sig, pk})");

  test("#delete(id)", async () => {
    const id = await authenticate(api);
    await api.session.delete(id);
  });
});
