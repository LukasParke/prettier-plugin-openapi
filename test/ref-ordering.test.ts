import { describe, expect, it } from "bun:test";
import { printers } from "../src/index.js";

describe("Reference ($ref) Ordering Tests", () => {
  describe("Operation key ordering with references", () => {
    it("should sort operation keys correctly with $ref parameters", () => {
      const printer = printers?.["openapi-ast"];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        format: "yaml",
        content: {
          openapi: "3.0.0",
          info: { title: "Test API", version: "1.0.0" },
          paths: {
            "/test": {
              get: {
                // Intentionally out of order to test sorting
                description: "Get a list of Access Model Metadata Attributes",
                operationId: "listAccessModelMetadataAttribute",
                summary: "List access model metadata attributes",
                tags: ["Access Model Metadata"],
                security: [{ userAuth: ["idn:access-model-metadata:read"] }],
                parameters: [
                  {
                    name: "filters",
                    description: "Filter results",
                    in: "query",
                    required: false,
                    schema: { type: "string" },
                  },
                  {
                    $ref: "../../v3/parameters/offset.yaml",
                  },
                  {
                    $ref: "../../v3/parameters/limit.yaml",
                  },
                  {
                    name: "sorters",
                    description: "Sort results",
                    in: "query",
                    required: false,
                    schema: { type: "string", format: "comma-separated" },
                  },
                ],
                responses: {
                  "200": {
                    description: "OK",
                    content: {
                      "application/json": {
                        schema: {
                          type: "array",
                          items: {
                            $ref: "../schemas/gov-attributes/AttributeDTO.yaml",
                          },
                        },
                      },
                    },
                  },
                  "400": {
                    $ref: "../../v3/responses/400.yaml",
                  },
                  "401": {
                    $ref: "../../v3/responses/401.yaml",
                  },
                  "500": {
                    $ref: "../../v3/responses/500.yaml",
                  },
                },
                "x-sailpoint-userLevels": ["ORG_ADMIN"],
              },
            },
          },
        },
        originalText: "",
      };

      // @ts-expect-error We are mocking things here
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 });
      expect(result).toBeDefined();

      if (!result) {
        throw new Error("Result is undefined");
      }

      const resultString = result.toString();

      // Check operation keys appear in correct order
      const operationIdIndex = resultString.indexOf("operationId");
      const summaryIndex = resultString.indexOf("summary");
      const tagsIndex = resultString.indexOf("tags");
      const descriptionIndex = resultString.indexOf("description");
      const securityIndex = resultString.indexOf("security");
      const parametersIndex = resultString.indexOf("parameters");
      const responsesIndex = resultString.indexOf("responses");
      const xSailpointIndex = resultString.indexOf("x-sailpoint-userLevels");

      // Verify operation key order: ... -> security -> x-sailpoint-userLevels -> ... -> parameters -> responses
      expect(operationIdIndex).toBeLessThan(summaryIndex);
      expect(summaryIndex).toBeLessThan(tagsIndex);
      expect(tagsIndex).toBeLessThan(descriptionIndex);
      expect(descriptionIndex).toBeLessThan(securityIndex);
      expect(securityIndex).toBeLessThan(xSailpointIndex);
      expect(xSailpointIndex).toBeLessThan(parametersIndex);
      expect(parametersIndex).toBeLessThan(responsesIndex);
    });

    it("should sort parameters array with $ref items first", () => {
      const printer = printers?.["openapi-ast"];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        format: "yaml",
        content: {
          openapi: "3.0.0",
          info: { title: "Test API", version: "1.0.0" },
          paths: {
            "/test": {
              get: {
                operationId: "test",
                responses: { "200": { description: "OK" } },
                parameters: [
                  {
                    name: "filter",
                    in: "query",
                    schema: { type: "string" },
                  },
                  {
                    $ref: "../../v3/parameters/offset.yaml",
                  },
                  {
                    name: "sort",
                    in: "query",
                    schema: { type: "string" },
                  },
                  {
                    $ref: "../../v3/parameters/limit.yaml",
                  },
                ],
              },
            },
          },
        },
        originalText: "",
      };

      // @ts-expect-error We are mocking things here
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 });
      expect(result).toBeDefined();

      if (!result) {
        throw new Error("Result is undefined");
      }

      const resultString = result.toString();

      // Find indices of parameter items in the output
      // $ref parameters should come before named parameters
      const parametersSection = resultString.substring(resultString.indexOf("parameters:"));

      // Check that $ref items appear before named parameters
      const offsetRefIndex = parametersSection.indexOf("offset.yaml");
      const limitRefIndex = parametersSection.indexOf("limit.yaml");
      const filterIndex = parametersSection.indexOf("name: filter");
      const sortIndex = parametersSection.indexOf("name: sort");

      // $ref items should come first in parameters array
      expect(offsetRefIndex).toBeLessThan(filterIndex);
      expect(limitRefIndex).toBeLessThan(filterIndex);
      expect(limitRefIndex).toBeLessThan(sortIndex);
    });

    it("should sort responses with $ref items correctly", () => {
      const printer = printers?.["openapi-ast"];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        format: "yaml",
        content: {
          openapi: "3.0.0",
          info: { title: "Test API", version: "1.0.0" },
          paths: {
            "/test": {
              get: {
                operationId: "test",
                responses: {
                  "500": {
                    $ref: "../../v3/responses/500.yaml",
                  },
                  "200": {
                    description: "OK",
                    content: {
                      "application/json": {
                        schema: { type: "object" },
                      },
                    },
                  },
                  "400": {
                    $ref: "../../v3/responses/400.yaml",
                  },
                  "401": {
                    $ref: "../../v3/responses/401.yaml",
                  },
                },
              },
            },
          },
        },
        originalText: "",
      };

      // @ts-expect-error We are mocking things here
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 });
      expect(result).toBeDefined();

      if (!result) {
        throw new Error("Result is undefined");
      }

      const resultString = result.toString();

      // Response codes should be sorted numerically: 200, 400, 401, 500
      const responsesSection = resultString.substring(resultString.indexOf("responses:"));

      const code200Index = responsesSection.indexOf("'200':");
      const code400Index = responsesSection.indexOf("'400':");
      const code401Index = responsesSection.indexOf("'401':");
      const code500Index = responsesSection.indexOf("'500':");

      expect(code200Index).toBeLessThan(code400Index);
      expect(code400Index).toBeLessThan(code401Index);
      expect(code401Index).toBeLessThan(code500Index);
    });

    it("should handle parameter objects with $ref at the top", () => {
      const printer = printers?.["openapi-ast"];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        format: "yaml",
        content: {
          openapi: "3.0.0",
          info: { title: "Test API", version: "1.0.0" },
          components: {
            parameters: {
              OffsetParam: {
                description: "Pagination offset",
                in: "query",
                name: "offset",
                schema: { type: "integer" },
                $ref: "../../v3/parameters/offset.yaml",
              },
            },
          },
        },
        originalText: "",
      };

      // @ts-expect-error We are mocking things here
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 });
      expect(result).toBeDefined();

      if (!result) {
        throw new Error("Result is undefined");
      }

      const resultString = result.toString();

      // In a parameter object, if both $ref and other keys exist, $ref should come first
      // But typically in OpenAPI, if $ref exists, other keys (except $ref) are ignored
      // However, we should still verify the ordering
      const offsetParamSection = resultString.substring(resultString.indexOf("OffsetParam:"));

      // $ref should be at the top of the parameter object
      const refIndex = offsetParamSection.indexOf("$ref:");
      const nameIndex = offsetParamSection.indexOf("name:");
      const descriptionIndex = offsetParamSection.indexOf("description:");

      // When $ref is present, it should be first (though other keys should typically be removed)
      if (refIndex !== -1 && nameIndex !== -1) {
        expect(refIndex).toBeLessThan(nameIndex);
        expect(refIndex).toBeLessThan(descriptionIndex);
      }
    });

    it("should handle response objects with $ref correctly", () => {
      const printer = printers?.["openapi-ast"];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        format: "yaml",
        content: {
          openapi: "3.0.0",
          info: { title: "Test API", version: "1.0.0" },
          components: {
            responses: {
              ErrorResponse: {
                description: "Error response",
                content: {
                  "application/json": {
                    schema: { type: "object" },
                  },
                },
                $ref: "../../v3/responses/error.yaml",
              },
            },
          },
        },
        originalText: "",
      };

      // @ts-expect-error We are mocking things here
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 });
      expect(result).toBeDefined();

      if (!result) {
        throw new Error("Result is undefined");
      }

      const resultString = result.toString();

      // In a response object with $ref, $ref should be first
      const errorResponseSection = resultString.substring(resultString.indexOf("ErrorResponse:"));

      const refIndex = errorResponseSection.indexOf("$ref:");
      const descriptionIndex = errorResponseSection.indexOf("description:");
      const contentIndex = errorResponseSection.indexOf("content:");

      if (refIndex !== -1 && descriptionIndex !== -1) {
        expect(refIndex).toBeLessThan(descriptionIndex);
        expect(refIndex).toBeLessThan(contentIndex);
      }
    });

    it("should handle complete operation with mixed inline and $ref parameters", () => {
      const printer = printers?.["openapi-ast"];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        format: "yaml",
        content: {
          openapi: "3.0.0",
          info: { title: "Test API", version: "1.0.0" },
          paths: {
            "/test": {
              get: {
                // All keys intentionally out of order
                tags: ["Test"],
                description: "Test endpoint",
                summary: "Get test",
                operationId: "getTest",
                security: [{ apiKey: [] }],
                parameters: [
                  {
                    name: "custom",
                    in: "query",
                    schema: { type: "string" },
                  },
                  {
                    $ref: "#/components/parameters/Offset",
                  },
                  {
                    name: "another",
                    in: "query",
                    schema: { type: "string" },
                  },
                  {
                    $ref: "#/components/parameters/Limit",
                  },
                  {
                    $ref: "#/components/parameters/Count",
                  },
                ],
                responses: {
                  "200": {
                    description: "Success",
                  },
                },
                "x-custom": "value",
              },
            },
          },
        },
        originalText: "",
      };

      // @ts-expect-error We are mocking things here
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 });
      expect(result).toBeDefined();

      if (!result) {
        throw new Error("Result is undefined");
      }

      const resultString = result.toString();

      // Verify operation key order
      const operationIdIndex = resultString.indexOf("operationId");
      const summaryIndex = resultString.indexOf("summary");
      const tagsIndex = resultString.indexOf("tags");
      const descriptionIndex = resultString.indexOf("description");
      const securityIndex = resultString.indexOf("security");
      const parametersIndex = resultString.indexOf("parameters");
      const responsesIndex = resultString.indexOf("responses");
      const xCustomIndex = resultString.indexOf("x-custom");

      expect(operationIdIndex).toBeLessThan(summaryIndex);
      expect(summaryIndex).toBeLessThan(tagsIndex);
      expect(tagsIndex).toBeLessThan(descriptionIndex);
      expect(descriptionIndex).toBeLessThan(securityIndex);
      expect(securityIndex).toBeLessThan(parametersIndex);
      expect(parametersIndex).toBeLessThan(responsesIndex);
      expect(responsesIndex).toBeLessThan(xCustomIndex);

      // Verify $ref parameters come first in parameters array
      const parametersSection = resultString.substring(resultString.indexOf("parameters:"));
      const offsetRefIndex = parametersSection.indexOf("Offset");
      const limitRefIndex = parametersSection.indexOf("Limit");
      const countRefIndex = parametersSection.indexOf("Count");
      const customIndex = parametersSection.indexOf("name: custom");
      const anotherIndex = parametersSection.indexOf("name: another");

      // All $ref items should come before inline parameters
      expect(offsetRefIndex).toBeLessThan(customIndex);
      expect(limitRefIndex).toBeLessThan(customIndex);
      expect(countRefIndex).toBeLessThan(customIndex);
      expect(offsetRefIndex).toBeLessThan(anotherIndex);
      expect(limitRefIndex).toBeLessThan(anotherIndex);
      expect(countRefIndex).toBeLessThan(anotherIndex);
    });

    it("should handle root-level operation file (file with HTTP method at root)", () => {
      const printer = printers?.["openapi-ast"];
      expect(printer).toBeDefined();

      // This simulates a file that is referenced via $ref and contains just an operation
      const testData = {
        isOpenAPI: true,
        format: "yaml",
        content: {
          get: {
            // Keys intentionally out of order
            description: "Get a list of Access Model Metadata Attributes",
            operationId: "listAccessModelMetadataAttribute",
            summary: "List access model metadata attributes",
            tags: ["Access Model Metadata"],
            security: [{ userAuth: ["idn:access-model-metadata:read"] }],
            parameters: [
              {
                name: "filters",
                description: "Filter results",
                in: "query",
                required: false,
                schema: { type: "string" },
              },
              {
                $ref: "../../v3/parameters/offset.yaml",
              },
              {
                $ref: "../../v3/parameters/limit.yaml",
              },
              {
                name: "sorters",
                description: "Sort results",
                in: "query",
                required: false,
                schema: { type: "string", format: "comma-separated" },
              },
            ],
            responses: {
              "200": {
                description: "OK",
                content: {
                  "application/json": {
                    schema: {
                      type: "array",
                      items: {
                        $ref: "../schemas/gov-attributes/AttributeDTO.yaml",
                      },
                    },
                  },
                },
              },
              "400": {
                $ref: "../../v3/responses/400.yaml",
              },
              "401": {
                $ref: "../../v3/responses/401.yaml",
              },
            },
            "x-sailpoint-userLevels": ["ORG_ADMIN"],
          },
        },
        originalText: "",
      };

      // @ts-expect-error We are mocking things here
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 });
      expect(result).toBeDefined();

      if (!result) {
        throw new Error("Result is undefined");
      }

      const resultString = result.toString();

      // Find the operation keys within the get: block
      const getBlockStart = resultString.indexOf("get:");
      const getBlock = resultString.substring(getBlockStart);

      // Check operation keys appear in correct order
      const operationIdIndex = getBlock.indexOf("operationId");
      const summaryIndex = getBlock.indexOf("summary");
      const tagsIndex = getBlock.indexOf("tags");
      const descriptionIndex = getBlock.indexOf("description");
      const securityIndex = getBlock.indexOf("security");
      const parametersIndex = getBlock.indexOf("parameters");
      const responsesIndex = getBlock.indexOf("responses");
      const xSailpointIndex = getBlock.indexOf("x-sailpoint-userLevels");

      // Verify operation key order: ... -> security -> x-sailpoint-userLevels -> ... -> parameters -> responses
      expect(operationIdIndex).toBeLessThan(summaryIndex);
      expect(summaryIndex).toBeLessThan(tagsIndex);
      expect(tagsIndex).toBeLessThan(descriptionIndex);
      expect(descriptionIndex).toBeLessThan(securityIndex);
      expect(securityIndex).toBeLessThan(xSailpointIndex);
      expect(xSailpointIndex).toBeLessThan(parametersIndex);
      expect(parametersIndex).toBeLessThan(responsesIndex);

      // Verify $ref parameters come first in parameters array
      const parametersSection = getBlock.substring(getBlock.indexOf("parameters:"));
      const offsetRefIndex = parametersSection.indexOf("offset.yaml");
      const limitRefIndex = parametersSection.indexOf("limit.yaml");
      const filtersIndex = parametersSection.indexOf("name: filters");
      const sortersIndex = parametersSection.indexOf("name: sorters");

      // $ref items should come before inline parameters
      expect(offsetRefIndex).toBeLessThan(filtersIndex);
      expect(limitRefIndex).toBeLessThan(filtersIndex);
      expect(offsetRefIndex).toBeLessThan(sortersIndex);
      expect(limitRefIndex).toBeLessThan(sortersIndex);
    });

    it("should handle direct operation object at root (no HTTP method wrapper)", () => {
      const printer = printers?.["openapi-ast"];
      expect(printer).toBeDefined();

      // This simulates a file that contains just the operation object directly
      const testData = {
        isOpenAPI: true,
        format: "yaml",
        content: {
          // Direct operation object (no HTTP method wrapper)
          operationId: "testOperation",
          description: "Test operation",
          summary: "Test summary",
          tags: ["Test"],
          security: [{ apiKey: [] }],
          parameters: [
            {
              $ref: "#/components/parameters/Offset",
            },
            {
              name: "custom",
              in: "query",
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "Success",
            },
          },
        },
        originalText: "",
      };

      // @ts-expect-error We are mocking things here
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 });
      expect(result).toBeDefined();

      if (!result) {
        throw new Error("Result is undefined");
      }

      const resultString = result.toString();

      // Check operation keys appear in correct order
      const operationIdIndex = resultString.indexOf("operationId");
      const summaryIndex = resultString.indexOf("summary");
      const tagsIndex = resultString.indexOf("tags");
      const descriptionIndex = resultString.indexOf("description");
      const securityIndex = resultString.indexOf("security");
      const parametersIndex = resultString.indexOf("parameters");
      const responsesIndex = resultString.indexOf("responses");

      // Verify operation key order
      expect(operationIdIndex).toBeLessThan(summaryIndex);
      expect(summaryIndex).toBeLessThan(tagsIndex);
      expect(tagsIndex).toBeLessThan(descriptionIndex);
      expect(descriptionIndex).toBeLessThan(securityIndex);
      expect(securityIndex).toBeLessThan(parametersIndex);
      expect(parametersIndex).toBeLessThan(responsesIndex);

      // Verify $ref parameters come first
      const parametersSection = resultString.substring(resultString.indexOf("parameters:"));
      const offsetRefIndex = parametersSection.indexOf("Offset");
      const customIndex = parametersSection.indexOf("name: custom");

      expect(offsetRefIndex).toBeLessThan(customIndex);
    });
  });
});
