import { describe, expect, it } from "bun:test";
import { printers } from "../src/index.js";

describe("OpenAPI Prettier plugin options", () => {
  const printer = printers?.["openapi-ast"];

  it("uses plain YAML scalars for typical strings (quotes only when required)", () => {
    const testData = {
      isOpenAPI: true,
      format: "yaml" as const,
      content: {
        openapi: "3.0.0",
        info: { title: "API", version: "1.0.0" },
        paths: {
          "/items": {
            get: {
              operationId: "listItems",
              summary: "List items",
              responses: { "200": { description: "OK" } },
            },
          },
        },
      },
      originalText: "",
    };

    // @ts-expect-error mock AstPath
    const result = printer?.print({ getNode: () => testData }, { tabWidth: 2, singleQuote: false });
    expect(result).toBeDefined();
    const s = String(result);
    expect(s).toContain("operationId: listItems");
    expect(s).toContain("summary: List items");
    expect(s).not.toContain('operationId: "listItems"');
  });

  it("uses single quotes for YAML scalars that need quoting by default (e.g. response codes)", () => {
    const testData = {
      isOpenAPI: true,
      format: "yaml" as const,
      content: {
        openapi: "3.0.0",
        info: { title: "T", version: "1" },
        paths: {
          "/items": {
            get: {
              responses: { "200": { description: "OK" } },
            },
          },
        },
      },
      originalText: "",
    };

    // @ts-expect-error mock AstPath
    const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 });
    expect(result).toBeDefined();
    expect(String(result)).toContain("'200':");
  });

  it("uses double quotes for YAML scalars that need quoting when openApiYamlSingleQuote is false", () => {
    const testData = {
      isOpenAPI: true,
      format: "yaml" as const,
      content: {
        openapi: "3.0.0",
        info: { title: "T", version: "1" },
        paths: {
          "/items": {
            get: {
              responses: { "200": { description: "OK" } },
            },
          },
        },
      },
      originalText: "",
    };

    // @ts-expect-error mock AstPath
    const result = printer?.print(
      { getNode: () => testData },
      { tabWidth: 2, openApiYamlSingleQuote: false },
    );
    expect(result).toBeDefined();
    expect(String(result)).toContain('"200":');
    expect(String(result)).not.toContain("'200':");
  });

  it("uses single quotes in YAML when singleQuote is true", () => {
    const testData = {
      isOpenAPI: true,
      format: "yaml" as const,
      content: {
        openapi: "3.0.0",
        info: {
          title: "Test API",
          version: "1.0.0",
        },
        paths: {},
        "x-needs-quotes": "a: b",
      },
      originalText: "",
    };

    // @ts-expect-error mock AstPath
    const result = printer?.print({ getNode: () => testData }, { tabWidth: 2, singleQuote: true });
    expect(result).toBeDefined();
    const s = String(result);
    expect(s).toContain("x-needs-quotes: 'a: b'");
  });

  it("skips markdown formatting when openApiFormatMarkdown is false", () => {
    const testData = {
      isOpenAPI: true,
      format: "yaml" as const,
      content: {
        openapi: "3.0.0",
        info: {
          title: "Test API",
          version: "1.0.0",
          description: "Hello   world   spaces",
        },
        paths: {},
      },
      originalText: "",
    };

    // @ts-expect-error mock AstPath
    const result = printer?.print(
      { getNode: () => testData },
      { tabWidth: 2, openApiFormatMarkdown: false },
    );
    expect(result).toBeDefined();
    expect(String(result)).toContain("Hello   world   spaces");
  });

  it("preserves key order when openApiSortKeys is false", () => {
    const testData = {
      isOpenAPI: true,
      format: "yaml" as const,
      content: {
        paths: { "/x": { get: { responses: { "200": { description: "OK" } } } } },
        openapi: "3.0.0",
        info: { title: "T", version: "1" },
      },
      originalText: "",
    };

    // @ts-expect-error mock AstPath
    const result = printer?.print(
      { getNode: () => testData },
      { tabWidth: 2, openApiSortKeys: false, openApiFormatMarkdown: false },
    );
    expect(result).toBeDefined();
    const s = String(result);
    const pathsIdx = s.indexOf("paths:");
    const openapiIdx = s.indexOf("openapi:");
    expect(pathsIdx).toBeGreaterThanOrEqual(0);
    expect(openapiIdx).toBeGreaterThanOrEqual(0);
    expect(pathsIdx).toBeLessThan(openapiIdx);
  });
});
