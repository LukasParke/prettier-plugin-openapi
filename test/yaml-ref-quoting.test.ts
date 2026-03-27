import { describe, expect, it } from "bun:test";
import { printers } from "../src/index.js";

describe("YAML $ref quoting", () => {
  const printer = printers?.["openapi-ast"];

  it("double-quotes $ref values when singleQuote is true", () => {
    const testData = {
      isOpenAPI: true,
      format: "yaml",
      content: {
        openapi: "3.0.0",
        info: { title: "T", version: "1" },
        paths: {
          "/x": {
            get: {
              responses: {
                "200": {
                  description: "OK",
                  content: {
                    "application/json": {
                      schema: { $ref: "#/components/schemas/A" },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            A: { type: "string" },
          },
        },
      },
      originalText: "",
    };

    // @ts-expect-error mock AstPath
    const result = printer?.print(
      { getNode: () => testData },
      { tabWidth: 2, singleQuote: true },
      () => "",
    );
    expect(result).toBeDefined();
    const s = String(result);
    expect(s).toContain('$ref: "#/components/schemas/A"');
    expect(s).not.toContain("$ref: '#/components/schemas/A'");
  });

  it("double-quotes $ref values when singleQuote is false", () => {
    const testData = {
      isOpenAPI: true,
      format: "yaml",
      content: {
        openapi: "3.0.0",
        info: { title: "T", version: "1" },
        paths: {
          "/x": {
            get: {
              responses: {
                "200": {
                  description: "OK",
                  content: {
                    "application/json": {
                      schema: { $ref: "./other.yaml#/components/schemas/B" },
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
    const result = printer?.print(
      { getNode: () => testData },
      { tabWidth: 2, singleQuote: false },
      () => "",
    );
    expect(result).toBeDefined();
    const s = String(result);
    expect(s).toContain('$ref: "./other.yaml#/components/schemas/B"');
  });

  it("lets $ref follow singleQuote when openApiYamlDoubleQuoteRefs is false", () => {
    const testData = {
      isOpenAPI: true,
      format: "yaml",
      content: {
        openapi: "3.0.0",
        info: { title: "T", version: "1" },
        paths: {
          "/x": {
            get: {
              responses: {
                "200": {
                  description: "OK",
                  content: {
                    "application/json": {
                      schema: { $ref: "#/components/schemas/A" },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            A: { type: "string" },
          },
        },
      },
      originalText: "",
    };

    // @ts-expect-error mock AstPath
    const result = printer?.print(
      { getNode: () => testData },
      {
        tabWidth: 2,
        singleQuote: true,
        openApiYamlDoubleQuoteRefs: false,
      },
      () => "",
    );
    expect(result).toBeDefined();
    const s = String(result);
    expect(s).toContain("$ref: '#/components/schemas/A'");
    expect(s).not.toContain('$ref: "#/components/schemas/A"');
  });
});
