import { describe, expect, it } from "bun:test";
import { printers } from "../src/index.js";

describe("example / examples payload key order", () => {
  const printer = printers?.["openapi-ast"];

  it("preserves key order inside media type example object", () => {
    const testData = {
      isOpenAPI: true,
      format: "yaml",
      content: {
        openapi: "3.0.0",
        info: { title: "T", version: "1" },
        paths: {
          "/x": {
            get: {
              operationId: "getX",
              responses: {
                "200": {
                  description: "OK",
                  content: {
                    "application/json": {
                      schema: { type: "object" },
                      example: { zebra: 1, apple: 2, mango: 3 },
                    },
                  },
                },
              },
            },
          },
        },
      },
      originalText: "",
    };

    // @ts-expect-error mock AstPath
    const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 });
    expect(result).toBeDefined();
    const s = String(result);
    const zebra = s.indexOf("zebra:");
    const apple = s.indexOf("apple:");
    const mango = s.indexOf("mango:");
    expect(zebra).toBeLessThan(apple);
    expect(apple).toBeLessThan(mango);
  });

  it("preserves key order inside examples map named entry value", () => {
    const testData = {
      isOpenAPI: true,
      format: "yaml",
      content: {
        openapi: "3.0.0",
        info: { title: "T", version: "1" },
        paths: {
          "/x": {
            post: {
              operationId: "postX",
              responses: {
                "201": {
                  description: "Created",
                  content: {
                    "application/json": {
                      schema: { type: "object" },
                      examples: {
                        sample: {
                          summary: "S",
                          value: { last: true, first: false },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      originalText: "",
    };

    // @ts-expect-error mock AstPath
    const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 });
    expect(result).toBeDefined();
    const s = String(result);
    const last = s.indexOf("last:");
    const first = s.indexOf("first:");
    expect(last).toBeLessThan(first);
  });
});
