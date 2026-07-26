import { beforeEach, describe, expect, it, vi } from "vitest";

import { app, type Bindings } from "../src/worker";

const bind = vi.fn(() => ({}) as D1PreparedStatement);
const prepare = vi.fn(() => ({ bind }) as unknown as D1PreparedStatement);
const batch = vi.fn(() => Promise.resolve([]));
const bindings = {
  ASSETS: {
    fetch: () => Promise.resolve(new Response("not used")),
  },
  DB: {
    batch,
    prepare,
  },
} as unknown as Bindings;

const eventPayload = {
  mode: "posts",
  name: "searched",
  sessionId: "7c0dbe70-8c47-4fc0-aa62-52427133c612",
};

describe("worker", () => {
  beforeEach(() => {
    bind.mockClear();
    prepare.mockClear();
    batch.mockClear();
  });

  it("renders the product-specific Japanese search workspace", async () => {
    const response = await app.request("/", undefined, bindings);
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-security-policy")).toContain("default-src 'self'");
    expect(html).toContain('lang="ja"');
    expect(html).toContain('itemscope=""');
    expect(html).toContain('itemtype="https://schema.org/WebApplication"');
    expect(html).toContain("検索条件を、見ながら組む。");
    expect(html).toContain('id="search-form"');
    expect(html).toContain('id="query-preview"');
    expect(html).toContain('id="search-button"');
    expect(html).toContain('id="saved-list"');
    expect(html).not.toContain("data-template-surface");
    expect(html).not.toContain('class="hero"');
    expect(html).not.toContain('class="product-flow"');
    expect(html).not.toContain("PUBLIC VALIDATION");
    expect(html).not.toContain("成功条件");
  });

  it("explains the actual browser and server data boundary", async () => {
    const response = await app.request("/privacy", undefined, bindings);
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toContain("ブラウザのlocalStorage");
    expect(html).toContain("匿名セッションID");
    expect(html).toContain("検索語");
    expect(html).toContain("35日間");
  });

  it("stores a validated anonymous product event", async () => {
    const response = await app.request(
      "/api/events",
      {
        body: JSON.stringify(eventPayload),
        headers: {
          "content-type": "application/json",
          "sec-fetch-site": "same-origin",
        },
        method: "POST",
      },
      bindings,
    );

    expect(response.status).toBe(204);
    expect(prepare).toHaveBeenCalledTimes(2);
    expect(bind).toHaveBeenCalledWith(
      eventPayload.sessionId,
      eventPayload.name,
      eventPayload.mode,
      expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
    );
    expect(batch).toHaveBeenCalledOnce();
  });

  it.each([
    {
      expected: 415,
      headers: { "content-type": "text/plain" },
      payload: JSON.stringify(eventPayload),
    },
    {
      expected: 403,
      headers: {
        "content-type": "application/json",
        "sec-fetch-site": "cross-site",
      },
      payload: JSON.stringify(eventPayload),
    },
    {
      expected: 400,
      headers: { "content-type": "application/json" },
      payload: "{",
    },
    {
      expected: 400,
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({ ...eventPayload, name: "unknown" }),
    },
    {
      expected: 413,
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({ ...eventPayload, padding: "x".repeat(1100) }),
    },
  ])("rejects invalid event requests with $expected", async ({ expected, headers, payload }) => {
    const response = await app.request(
      "/api/events",
      {
        body: payload,
        headers,
        method: "POST",
      },
      bindings,
    );

    expect(response.status).toBe(expected);
    expect(batch).not.toHaveBeenCalled();
  });

  it("exposes a machine-readable health endpoint", async () => {
    const response = await app.request("/healthz", undefined, bindings);
    const body = await response.json<{ healthy: boolean }>();

    expect(response.status).toBe(200);
    expect(body.healthy).toBe(true);
  });

  it("does not expose exception details", async () => {
    const response = await app.request("/missing", undefined, bindings);
    const body = await response.json<{ error: string; requestId: string }>();

    expect(response.status).toBe(404);
    expect(body.error).toBe("not_found");
    expect(body.requestId).toBeTruthy();
  });
});
