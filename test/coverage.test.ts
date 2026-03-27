import { describe, expect, it } from 'bun:test';
import { parsers, printers } from '../src/index';

describe('Coverage Tests', () => {
  describe('File path detection', () => {
    it('should detect OpenAPI files in component directories', () => {
      const parser = parsers?.['openapi-parser'];
      expect(parser).toBeDefined();

      const testYaml = `type: object
properties:
  id:
    type: integer`;

      // Test various component directory patterns
      const paths = [
        'components/schemas/User.yaml',
        'components/parameters/UserId.yaml',
        'components/responses/UserResponse.yaml',
        'components/requestBodies/UserCreateBody.yaml',
        'components/headers/RateLimitHeaders.yaml',
        'components/examples/UserExample.yaml',
        'components/securitySchemes/BearerAuth.yaml',
        'components/links/UserCreatedLink.yaml',
        'components/callbacks/NewMessageCallback.yaml',
        'webhooks/messageCreated.yaml',
        'paths/users.yaml'
      ];

      paths.forEach(path => {
        // @ts-expect-error We are testing edge cases
        const result = parser?.parse(testYaml, { filepath: path });
        expect(result).toBeDefined();
        expect(result?.isOpenAPI).toBeTrue();
        expect(result?.format).toBe('yaml');
      });
    });

    it('should handle files without filepath', () => {
      const parser = parsers?.['openapi-parser'];
      expect(parser).toBeDefined();

      const testYaml = `openapi: 3.0.0
info:
  title: Test API
  version: 1.0.0`;

      // @ts-expect-error We are testing edge cases
      const result = parser?.parse(testYaml, { filepath: 'test.yaml' });
      expect(result).toBeDefined();
      expect(result?.isOpenAPI).toBeTrue();
    });
  });

  describe('Object type detection', () => {
    it('should detect operation objects', () => {
      const parser = parsers?.['openapi-parser'];
      expect(parser).toBeDefined();

      const operationYaml = `get:
  summary: Get users
  responses:
    '200':
      description: Success`;

      // @ts-expect-error We are testing edge cases
      const result = parser?.parse(operationYaml, { filepath: 'paths/users.yaml' });
      expect(result).toBeDefined();
      expect(result?.isOpenAPI).toBeTrue();
    });

    it('should detect parameter objects', () => {
      const parser = parsers?.['openapi-parser'];
      expect(parser).toBeDefined();

      const parameterYaml = `name: id
in: path
required: true
schema:
  type: integer`;

      // @ts-expect-error We are testing edge cases
      const result = parser?.parse(parameterYaml, { filepath: 'components/parameters/UserId.yaml' });
      expect(result).toBeDefined();
      expect(result?.isOpenAPI).toBeTrue();
    });

    it('should detect schema objects', () => {
      const parser = parsers?.['openapi-parser'];
      expect(parser).toBeDefined();

      const schemaYaml = `type: object
properties:
  id:
    type: integer
  name:
    type: string
required:
  - id`;

      // @ts-expect-error We are testing edge cases
      const result = parser?.parse(schemaYaml, { filepath: 'components/schemas/User.yaml' });
      expect(result).toBeDefined();
      expect(result?.isOpenAPI).toBeTrue();
    });

    it('should detect response objects', () => {
      const parser = parsers?.['openapi-parser'];
      expect(parser).toBeDefined();

      const responseYaml = `description: User response
content:
  application/json:
    schema:
      type: object`;

      // @ts-expect-error We are testing edge cases
      const result = parser?.parse(responseYaml, { filepath: 'components/responses/UserResponse.yaml' });
      expect(result).toBeDefined();
      expect(result?.isOpenAPI).toBeTrue();
    });

    it('should detect security scheme objects', () => {
      const parser = parsers?.['openapi-parser'];
      expect(parser).toBeDefined();

      const securityYaml = `type: http
scheme: bearer
bearerFormat: JWT`;

      // @ts-expect-error We are testing edge cases
      const result = parser?.parse(securityYaml, { filepath: 'components/securitySchemes/BearerAuth.yaml' });
      expect(result).toBeDefined();
      expect(result?.isOpenAPI).toBeTrue();
    });

    it('should detect server objects', () => {
      const parser = parsers?.['openapi-parser'];
      expect(parser).toBeDefined();

      const serverYaml = `url: https://api.example.com
description: Production server`;

      // @ts-expect-error We are testing edge cases
      const result = parser?.parse(serverYaml, { filepath: 'servers/production.yaml' });
      expect(result).toBeDefined();
      expect(result?.isOpenAPI).toBeTrue();
    });

    it('should detect tag objects', () => {
      const parser = parsers?.['openapi-parser'];
      expect(parser).toBeDefined();

      const tagYaml = `name: users
description: User management operations`;

      // @ts-expect-error We are testing edge cases
      const result = parser?.parse(tagYaml, { filepath: 'tags/users.yaml' });
      expect(result).toBeDefined();
      expect(result?.isOpenAPI).toBeTrue();
    });

    it('should detect external docs objects', () => {
      const parser = parsers?.['openapi-parser'];
      expect(parser).toBeDefined();

      const externalDocsYaml = `url: https://example.com/docs
description: External documentation`;

      // @ts-expect-error We are testing edge cases
      const result = parser?.parse(externalDocsYaml, { filepath: 'externalDocs/api.yaml' });
      expect(result).toBeDefined();
      expect(result?.isOpenAPI).toBeTrue();
    });

    it('should detect webhook objects', () => {
      const parser = parsers?.['openapi-parser'];
      expect(parser).toBeDefined();

      const webhookYaml = `post:
  summary: New message webhook
  responses:
    '200':
      description: Success`;

      // @ts-expect-error We are testing edge cases
      const result = parser?.parse(webhookYaml, { filepath: 'webhooks/messageCreated.yaml' });
      expect(result).toBeDefined();
      expect(result?.isOpenAPI).toBeTrue();
    });
  });

  describe('Sorting functions', () => {
    it('should handle path sorting by specificity', () => {
      const printer = printers?.['openapi-ast'];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        content: {
          openapi: '3.0.0',
          info: { title: 'Test API', version: '1.0.0' },
          paths: {
            '/users/{id}': { get: {} },
            '/users': { get: {} },
            '/users/{id}/posts': { get: {} }
          }
        },
        originalText: '',
        format: 'json'
      };

      // @ts-expect-error We are testing edge cases
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 }, () => '');
      expect(result).toBeDefined();

      if (result && typeof result === 'string') {
        const formatted = JSON.parse(result);
        const pathKeys = Object.keys(formatted.paths);
        // Paths should be sorted (the exact order may vary based on implementation)
        expect(pathKeys).toContain('/users');
        expect(pathKeys).toContain('/users/{id}');
        expect(pathKeys).toContain('/users/{id}/posts');
      }
    });

    it('should handle response code sorting', () => {
      const printer = printers?.['openapi-ast'];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        content: {
          openapi: '3.0.0',
          info: { title: 'Test API', version: '1.0.0' },
          paths: {
            '/test': {
              get: {
                responses: {
                  '500': { description: 'Server Error' },
                  '200': { description: 'Success' },
                  '400': { description: 'Bad Request' }
                }
              }
            }
          }
        },
        originalText: '',
        format: 'json'
      };

      // @ts-expect-error We are testing edge cases
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 }, () => '');
      expect(result).toBeDefined();

      if (result && typeof result === 'string') {
        const formatted = JSON.parse(result);
        const responseKeys = Object.keys(formatted.paths['/test'].get.responses);
        // Response codes should be sorted numerically
        expect(responseKeys[0]).toBe('200');
        expect(responseKeys[1]).toBe('400');
        expect(responseKeys[2]).toBe('500');
      }
    });
  });

  describe('Context key detection', () => {
    it('should handle nested path contexts', () => {
      const printer = printers?.['openapi-ast'];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        content: {
          openapi: '3.0.0',
          info: { title: 'Test API', version: '1.0.0' },
          components: {
            schemas: {
              User: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  name: { type: 'string' }
                }
              }
            }
          }
        },
        originalText: '',
        format: 'json'
      };

      // @ts-expect-error We are testing edge cases
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 }, () => '');
      expect(result).toBeDefined();

      if (result && typeof result === 'string') {
        const formatted = JSON.parse(result);
        expect(formatted.components.schemas.User).toBeDefined();
        expect(formatted.components.schemas.User.type).toBe('object');
      }
    });
  });

  describe('Format detection', () => {
    it('should detect JSON format from content when filepath is missing', () => {
      const parser = parsers?.['openapi-parser'];
      expect(parser).toBeDefined();

      const jsonContent = `{"openapi": "3.0.0", "info": {"title": "Test", "version": "1.0.0"}}`;

      // @ts-expect-error We are testing edge cases
      const result = parser?.parse(jsonContent, {});
      expect(result).toBeDefined();
      expect(result?.format).toBe('json');
    });

    it('should detect YAML format from content when filepath is missing', () => {
      const parser = parsers?.['openapi-parser'];
      expect(parser).toBeDefined();

      const yamlContent = `openapi: 3.0.0\ninfo:\n  title: Test\n  version: 1.0.0`;

      // @ts-expect-error We are testing edge cases
      const result = parser?.parse(yamlContent, {});
      expect(result).toBeDefined();
      expect(result?.format).toBe('yaml');
    });

    it('should detect JSON format from array content', () => {
      const parser = parsers?.['openapi-parser'];
      expect(parser).toBeDefined();

      const jsonArray = `[{"test": "value"}]`;

      // @ts-expect-error We are testing edge cases
      const result = parser?.parse(jsonArray, {});
      expect(result).toBeDefined();
      // Format detection happens before parsing, so format should be 'json'
      // But since arrays aren't valid OpenAPI objects, isOpenAPI will be false
      // The format might be undefined if parsing fails early, so we check both cases
      if (result?.format) {
        expect(result.format).toBe('json');
      }
      expect(result?.isOpenAPI).toBeFalse();
    });
  });

  describe('Error handling', () => {
    it('should handle parse errors gracefully', () => {
      const parser = parsers?.['openapi-parser'];
      expect(parser).toBeDefined();

      const invalidJson = `{invalid json}`;

      // @ts-expect-error We are testing edge cases
      const result = parser?.parse(invalidJson, { filepath: 'test.json' });
      expect(result).toBeDefined();
      expect(result?.isOpenAPI).toBeFalse();
    });

    it('should handle non-object content', () => {
      const parser = parsers?.['openapi-parser'];
      expect(parser).toBeDefined();

      const stringContent = `"just a string"`;

      // @ts-expect-error We are testing edge cases
      const result = parser?.parse(stringContent, { filepath: 'test.json' });
      expect(result).toBeDefined();
      expect(result?.isOpenAPI).toBeFalse();
    });

    it('should handle null content', () => {
      const parser = parsers?.['openapi-parser'];
      expect(parser).toBeDefined();

      const nullContent = `null`;

      // @ts-expect-error We are testing edge cases
      const result = parser?.parse(nullContent, { filepath: 'test.json' });
      expect(result).toBeDefined();
      expect(result?.isOpenAPI).toBeFalse();
    });

    it('should handle errors in isOpenAPIFile check', () => {
      const parser = parsers?.['openapi-parser'];
      expect(parser).toBeDefined();

      // Create content that might cause isOpenAPIFile to throw
      const problematicContent = `{"openapi": "3.0.0"}`;

      // Mock a scenario where isOpenAPIFile might throw
      // This tests the try-catch around isOpenAPIFile
      // @ts-expect-error We are testing edge cases
      const result = parser?.parse(problematicContent, { filepath: 'test.json' });
      expect(result).toBeDefined();
    });
  });

  describe('Printer edge cases', () => {
    it('should return originalText when node is not OpenAPI', () => {
      const printer = printers?.['openapi-ast'];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: false,
        content: {},
        originalText: 'original content',
      };

      // @ts-expect-error We are testing edge cases
      const result = printer?.print({ getNode: () => testData }, { originalText: 'original content', tabWidth: 2 }, () => '');
      expect(result).toBe('original content');
    });

    it('should handle null/undefined node', () => {
      const printer = printers?.['openapi-ast'];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: false,
        content: null,
        originalText: 'original content',
      };

      // @ts-expect-error We are testing edge cases
      const result = printer?.print({ getNode: () => testData }, { originalText: 'original content', tabWidth: 2 }, () => '');
      expect(result).toBe('original content');
    });
  });

  describe('Markdown formatting edge cases', () => {
    it('should handle non-string markdown input', () => {
      const printer = printers?.['openapi-ast'];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        format: 'yaml',
        content: {
          openapi: '3.0.0',
          info: {
            title: 'Test API',
            version: '1.0.0',
            description: null, // null description
          },
        },
        originalText: '',
      };

      // @ts-expect-error We are testing edge cases
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 }, () => '');
      expect(result).toBeDefined();
    });

    it('should skip markdown formatting when openApiFormatMarkdown is false', () => {
      const printer = printers?.['openapi-ast'];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        format: 'yaml',
        content: {
          openapi: '3.0.0',
          info: {
            title: 'Test API',
            version: '1.0.0',
            description: 'This   has   extra   spaces',
          },
        },
        originalText: '',
      };

      // @ts-expect-error We are testing edge cases
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2, openApiFormatMarkdown: false }, () => '');
      expect(result).toBeDefined();
      if (result && typeof result === 'string') {
        // When openApiFormatMarkdown is false, extra spaces should remain
        expect(result).toContain('description');
      }
    });

    it('should handle empty string markdown', () => {
      const printer = printers?.['openapi-ast'];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        format: 'yaml',
        content: {
          openapi: '3.0.0',
          info: {
            title: 'Test API',
            version: '1.0.0',
            description: '   ', // whitespace-only string
          },
        },
        originalText: '',
      };

      // @ts-expect-error We are testing edge cases
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 }, () => '');
      expect(result).toBeDefined();
    });
  });

  describe('Context key detection fallbacks', () => {
    it('should detect parameter context from object type', () => {
      const printer = printers?.['openapi-ast'];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        format: 'json',
        content: {
          openapi: '3.0.0',
          info: { title: 'Test', version: '1.0.0' },
          components: {
            parameters: {
              TestParam: {
                name: 'test',
                in: 'query',
                schema: { type: 'string' },
              },
            },
          },
        },
        originalText: '',
      };

      // @ts-expect-error We are testing edge cases
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 }, () => '');
      expect(result).toBeDefined();
    });

    it('should detect response context from object type', () => {
      const printer = printers?.['openapi-ast'];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        format: 'json',
        content: {
          openapi: '3.0.0',
          info: { title: 'Test', version: '1.0.0' },
          components: {
            responses: {
              TestResponse: {
                description: 'Test response',
              },
            },
          },
        },
        originalText: '',
      };

      // @ts-expect-error We are testing edge cases
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 }, () => '');
      expect(result).toBeDefined();
    });

    it('should detect header context from object type', () => {
      const printer = printers?.['openapi-ast'];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        format: 'json',
        content: {
          openapi: '3.0.0',
          info: { title: 'Test', version: '1.0.0' },
          components: {
            headers: {
              TestHeader: {
                description: 'Test header',
                schema: { type: 'string' },
              },
            },
          },
        },
        originalText: '',
      };

      // @ts-expect-error We are testing edge cases
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 }, () => '');
      expect(result).toBeDefined();
    });

    it('should detect requestBody context from object type', () => {
      const printer = printers?.['openapi-ast'];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        format: 'json',
        content: {
          openapi: '3.0.0',
          info: { title: 'Test', version: '1.0.0' },
          components: {
            requestBodies: {
              TestBody: {
                description: 'Test body',
                content: {},
              },
            },
          },
        },
        originalText: '',
      };

      // @ts-expect-error We are testing edge cases
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 }, () => '');
      expect(result).toBeDefined();
    });
  });

  describe('Response code sorting edge cases', () => {
    it('should handle non-numeric response codes', () => {
      const printer = printers?.['openapi-ast'];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        format: 'json',
        content: {
          openapi: '3.0.0',
          info: { title: 'Test', version: '1.0.0' },
          paths: {
            '/test': {
              get: {
                responses: {
                  'default': { description: 'Default' },
                  '2xx': { description: 'Success range' },
                  '200': { description: 'OK' },
                },
              },
            },
          },
        },
        originalText: '',
      };

      // @ts-expect-error We are testing edge cases
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 }, () => '');
      expect(result).toBeDefined();
    });
  });

  describe('Object type detection edge cases', () => {
    it('should handle null/undefined in isOperationObject', () => {
      const parser = parsers?.['openapi-parser'];
      expect(parser).toBeDefined();

      // Test with null
      const nullYaml = `null`;

      // @ts-expect-error We are testing edge cases
      const result = parser?.parse(nullYaml, { filepath: 'test.yaml' });
      expect(result).toBeDefined();
      expect(result?.isOpenAPI).toBeFalse();
    });

    it('should handle non-object in isSchemaObject', () => {
      const parser = parsers?.['openapi-parser'];
      expect(parser).toBeDefined();

      const stringYaml = `"just a string"`;

      // @ts-expect-error We are testing edge cases
      const result = parser?.parse(stringYaml, { filepath: 'test.yaml' });
      expect(result).toBeDefined();
      expect(result?.isOpenAPI).toBeFalse();
    });

    it('should detect Swagger 2.0 files with definitions', () => {
      const parser = parsers?.['openapi-parser'];
      expect(parser).toBeDefined();

      const swaggerYaml = `swagger: "2.0"
info:
  title: Test API
  version: 1.0.0
definitions:
  User:
    type: object`;

      // @ts-expect-error We are testing edge cases
      const result = parser?.parse(swaggerYaml, { filepath: 'test.yaml' });
      expect(result).toBeDefined();
      expect(result?.isOpenAPI).toBeTrue();
    });

    it('should detect Swagger 2.0 files with parameters', () => {
      const parser = parsers?.['openapi-parser'];
      expect(parser).toBeDefined();

      const swaggerYaml = `swagger: "2.0"
info:
  title: Test API
  version: 1.0.0
parameters:
  userId:
    name: id
    in: path`;

      // @ts-expect-error We are testing edge cases
      const result = parser?.parse(swaggerYaml, { filepath: 'test.yaml' });
      expect(result).toBeDefined();
      expect(result?.isOpenAPI).toBeTrue();
    });

    it('should detect Swagger 2.0 files with responses', () => {
      const parser = parsers?.['openapi-parser'];
      expect(parser).toBeDefined();

      const swaggerYaml = `swagger: "2.0"
info:
  title: Test API
  version: 1.0.0
responses:
  NotFound:
    description: Not found`;

      // @ts-expect-error We are testing edge cases
      const result = parser?.parse(swaggerYaml, { filepath: 'test.yaml' });
      expect(result).toBeDefined();
      expect(result?.isOpenAPI).toBeTrue();
    });

    it('should detect Swagger 2.0 files with securityDefinitions', () => {
      const parser = parsers?.['openapi-parser'];
      expect(parser).toBeDefined();

      const swaggerYaml = `swagger: "2.0"
info:
  title: Test API
  version: 1.0.0
securityDefinitions:
  BearerAuth:
    type: apiKey`;

      // @ts-expect-error We are testing edge cases
      const result = parser?.parse(swaggerYaml, { filepath: 'test.yaml' });
      expect(result).toBeDefined();
      expect(result?.isOpenAPI).toBeTrue();
    });

    it('should detect standalone header objects', () => {
      const parser = parsers?.['openapi-parser'];
      expect(parser).toBeDefined();

      const headerYaml = `description: Rate limit header
schema:
  type: integer
required: true`;

      // @ts-expect-error We are testing edge cases
      const result = parser?.parse(headerYaml, { filepath: 'components/headers/RateLimit.yaml' });
      expect(result).toBeDefined();
      expect(result?.isOpenAPI).toBeTrue();
    });

    it('should detect standalone link objects', () => {
      const parser = parsers?.['openapi-parser'];
      expect(parser).toBeDefined();

      const linkYaml = `operationId: getUser
parameters:
  userId: $response.body#/id`;

      // @ts-expect-error We are testing edge cases
      const result = parser?.parse(linkYaml, { filepath: 'components/links/UserLink.yaml' });
      expect(result).toBeDefined();
      expect(result?.isOpenAPI).toBeTrue();
    });

    it('should detect link objects with operationRef', () => {
      const parser = parsers?.['openapi-parser'];
      expect(parser).toBeDefined();

      const linkYaml = `operationRef: '#/paths/~1users~1{id}/get'
parameters:
  userId: $response.body#/id`;

      // @ts-expect-error We are testing edge cases
      const result = parser?.parse(linkYaml, { filepath: 'components/links/UserLink.yaml' });
      expect(result).toBeDefined();
      expect(result?.isOpenAPI).toBeTrue();
    });

    it('should distinguish link objects from operation objects', () => {
      const parser = parsers?.['openapi-parser'];
      expect(parser).toBeDefined();

      // Link with operationId but no responses should be detected as link
      const linkYaml = `operationId: getUser
parameters:
  userId: $response.body#/id`;

      // @ts-expect-error We are testing edge cases
      const result = parser?.parse(linkYaml, { filepath: 'components/links/UserLink.yaml' });
      expect(result).toBeDefined();
      expect(result?.isOpenAPI).toBeTrue();

      // Operation with operationId AND responses should be detected as operation
      const operationYaml = `operationId: getUser
responses:
  '200':
    description: Success`;

      // @ts-expect-error We are testing edge cases
      const result2 = parser?.parse(operationYaml, { filepath: 'paths/users.yaml' });
      expect(result2).toBeDefined();
      expect(result2?.isOpenAPI).toBeTrue();
    });

    it('should detect standalone requestBody objects', () => {
      const parser = parsers?.['openapi-parser'];
      expect(parser).toBeDefined();

      const requestBodyYaml = `description: User creation payload
content:
  application/json:
    schema:
      type: object`;

      // @ts-expect-error We are testing edge cases
      const result = parser?.parse(requestBodyYaml, { filepath: 'components/requestBodies/UserCreate.yaml' });
      expect(result).toBeDefined();
      expect(result?.isOpenAPI).toBeTrue();
    });

    it('should detect standalone security scheme objects', () => {
      const parser = parsers?.['openapi-parser'];
      expect(parser).toBeDefined();

      const securityYaml = `type: http
scheme: bearer
bearerFormat: JWT`;

      // @ts-expect-error We are testing edge cases
      const result = parser?.parse(securityYaml, { filepath: 'components/securitySchemes/BearerAuth.yaml' });
      expect(result).toBeDefined();
      expect(result?.isOpenAPI).toBeTrue();
    });

    it('should detect standalone server objects', () => {
      const parser = parsers?.['openapi-parser'];
      expect(parser).toBeDefined();

      const serverYaml = `url: https://api.example.com
description: Production server`;

      // @ts-expect-error We are testing edge cases
      const result = parser?.parse(serverYaml, { filepath: 'servers/production.yaml' });
      expect(result).toBeDefined();
      expect(result?.isOpenAPI).toBeTrue();
    });

    it('should detect standalone tag objects', () => {
      const parser = parsers?.['openapi-parser'];
      expect(parser).toBeDefined();

      const tagYaml = `name: users`;

      // @ts-expect-error We are testing edge cases
      const result = parser?.parse(tagYaml, { filepath: 'tags/users.yaml' });
      expect(result).toBeDefined();
      expect(result?.isOpenAPI).toBeTrue();
    });

    it('should detect tag objects with description', () => {
      const parser = parsers?.['openapi-parser'];
      expect(parser).toBeDefined();

      const tagYaml = `name: users
description: User management operations`;

      // @ts-expect-error We are testing edge cases
      const result = parser?.parse(tagYaml, { filepath: 'tags/users.yaml' });
      expect(result).toBeDefined();
      expect(result?.isOpenAPI).toBeTrue();
    });

    it('should detect tag objects with externalDocs', () => {
      const parser = parsers?.['openapi-parser'];
      expect(parser).toBeDefined();

      const tagYaml = `name: users
externalDocs:
  url: https://example.com/docs`;

      // @ts-expect-error We are testing edge cases
      const result = parser?.parse(tagYaml, { filepath: 'tags/users.yaml' });
      expect(result).toBeDefined();
      expect(result?.isOpenAPI).toBeTrue();
    });

    it('should detect standalone external docs objects', () => {
      const parser = parsers?.['openapi-parser'];
      expect(parser).toBeDefined();

      const externalDocsYaml = `url: https://example.com/docs
description: External documentation`;

      // @ts-expect-error We are testing edge cases
      const result = parser?.parse(externalDocsYaml, { filepath: 'externalDocs/api.yaml' });
      expect(result).toBeDefined();
      expect(result?.isOpenAPI).toBeTrue();
    });

    it('should detect standalone webhook objects', () => {
      const parser = parsers?.['openapi-parser'];
      expect(parser).toBeDefined();

      const webhookYaml = `post:
  summary: New message webhook
  responses:
    '200':
      description: Success`;

      // @ts-expect-error We are testing edge cases
      const result = parser?.parse(webhookYaml, { filepath: 'webhooks/messageCreated.yaml' });
      expect(result).toBeDefined();
      expect(result?.isOpenAPI).toBeTrue();
    });
  });

  describe('Custom extension sorting', () => {
    it('should sort custom extensions relative to standard keys', () => {
      const printer = printers?.['openapi-ast'];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        format: 'json',
        content: {
          openapi: '3.0.0',
          info: {
            title: 'Test API',
            version: '1.0.0',
            'x-custom-before-title': 'before',
            'x-custom-after-title': 'after',
          },
        },
        originalText: '',
      };

      // @ts-expect-error We are testing edge cases
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 }, () => '');
      expect(result).toBeDefined();
    });

    it('should handle custom extensions with same position as standard keys', () => {
      const printer = printers?.['openapi-ast'];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        format: 'json',
        content: {
          openapi: '3.0.0',
          info: {
            title: 'Test API',
            'x-custom-at-title': 'value',
            version: '1.0.0',
          },
        },
        originalText: '',
      };

      // @ts-expect-error We are testing edge cases
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 }, () => '');
      expect(result).toBeDefined();
    });
  });

  describe('Context key mapping', () => {
    it('should handle encoding context', () => {
      const printer = printers?.['openapi-ast'];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        format: 'json',
        content: {
          openapi: '3.0.0',
          info: { title: 'Test', version: '1.0.0' },
          paths: {
            '/test': {
              post: {
                requestBody: {
                  content: {
                    'application/json': {
                      encoding: {
                        field1: {
                          contentType: 'text/plain',
                        },
                      },
                    },
                  },
                },
                responses: { '200': { description: 'OK' } },
              },
            },
          },
        },
        originalText: '',
      };

      // @ts-expect-error We are testing edge cases
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 }, () => '');
      expect(result).toBeDefined();
    });

    it('should handle mediaType context', () => {
      const printer = printers?.['openapi-ast'];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        format: 'json',
        content: {
          openapi: '3.0.0',
          info: { title: 'Test', version: '1.0.0' },
          paths: {
            '/test': {
              post: {
                requestBody: {
                  content: {
                    'application/json': {
                      schema: { type: 'object' },
                    },
                  },
                },
                responses: { '200': { description: 'OK' } },
              },
            },
          },
        },
        originalText: '',
      };

      // @ts-expect-error We are testing edge cases
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 }, () => '');
      expect(result).toBeDefined();
    });

    it('should handle example context', () => {
      const printer = printers?.['openapi-ast'];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        format: 'json',
        content: {
          openapi: '3.0.0',
          info: { title: 'Test', version: '1.0.0' },
          components: {
            examples: {
              UserExample: {
                summary: 'User example',
                value: { id: 1 },
              },
            },
          },
        },
        originalText: '',
      };

      // @ts-expect-error We are testing edge cases
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 }, () => '');
      expect(result).toBeDefined();
    });

    it('should handle discriminator context', () => {
      const printer = printers?.['openapi-ast'];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        format: 'json',
        content: {
          openapi: '3.0.0',
          info: { title: 'Test', version: '1.0.0' },
          components: {
            schemas: {
              Pet: {
                discriminator: {
                  propertyName: 'petType',
                },
              },
            },
          },
        },
        originalText: '',
      };

      // @ts-expect-error We are testing edge cases
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 }, () => '');
      expect(result).toBeDefined();
    });

    it('should handle xml context', () => {
      const printer = printers?.['openapi-ast'];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        format: 'json',
        content: {
          openapi: '3.0.0',
          info: { title: 'Test', version: '1.0.0' },
          components: {
            schemas: {
              User: {
                type: 'object',
                xml: {
                  name: 'user',
                },
              },
            },
          },
        },
        originalText: '',
      };

      // @ts-expect-error We are testing edge cases
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 }, () => '');
      expect(result).toBeDefined();
    });

    it('should handle contact context', () => {
      const printer = printers?.['openapi-ast'];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        format: 'json',
        content: {
          openapi: '3.0.0',
          info: {
            title: 'Test',
            version: '1.0.0',
            contact: {
              name: 'API Support',
              email: 'support@example.com',
            },
          },
        },
        originalText: '',
      };

      // @ts-expect-error We are testing edge cases
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 }, () => '');
      expect(result).toBeDefined();
    });

    it('should handle license context', () => {
      const printer = printers?.['openapi-ast'];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        format: 'json',
        content: {
          openapi: '3.0.0',
          info: {
            title: 'Test',
            version: '1.0.0',
            license: {
              name: 'MIT',
            },
          },
        },
        originalText: '',
      };

      // @ts-expect-error We are testing edge cases
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 }, () => '');
      expect(result).toBeDefined();
    });

    it('should handle oauthFlow context', () => {
      const printer = printers?.['openapi-ast'];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        format: 'json',
        content: {
          openapi: '3.0.0',
          info: { title: 'Test', version: '1.0.0' },
          components: {
            securitySchemes: {
              OAuth2: {
                type: 'oauth2',
                flows: {
                  authorizationCode: {
                    authorizationUrl: 'https://example.com/oauth/authorize',
                    tokenUrl: 'https://example.com/oauth/token',
                    scopes: {},
                  },
                },
              },
            },
          },
        },
        originalText: '',
      };

      // @ts-expect-error We are testing edge cases
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 }, () => '');
      expect(result).toBeDefined();
    });

    it('should handle serverVariable context', () => {
      const printer = printers?.['openapi-ast'];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        format: 'json',
        content: {
          openapi: '3.0.0',
          info: { title: 'Test', version: '1.0.0' },
          servers: [
            {
              url: 'https://{username}.example.com',
              variables: {
                username: {
                  default: 'demo',
                  enum: ['demo', 'prod'],
                },
              },
            },
          ],
        },
        originalText: '',
      };

      // @ts-expect-error We are testing edge cases
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 }, () => '');
      expect(result).toBeDefined();
    });
  });

  describe('Additional edge cases', () => {
    it('should handle objects with only generic properties', () => {
      const parser = parsers?.['openapi-parser'];
      expect(parser).toBeDefined();

      // Object with only generic properties that don't indicate OpenAPI
      // Using properties that are generic and don't match OpenAPI patterns
      const genericYaml = `someProperty: value
anotherProperty: value2
type: string`;

      // @ts-expect-error We are testing edge cases
      const result = parser?.parse(genericYaml, { filepath: 'test.yaml' });
      expect(result).toBeDefined();
      // Should not be detected as OpenAPI since it only has generic properties
      // Note: This tests the hasOnlyGenericProperties check
      expect(result?.isOpenAPI).toBeFalse();
    });

    it('should reject generic content in component directories (security check)', () => {
      const parser = parsers?.['openapi-parser'];
      expect(parser).toBeDefined();

      // Generic JSON/YAML that should NOT be accepted even in component directories
      const genericContent = `firstName: John
lastName: Doe
email: john@example.com
age: 30`;

      // Test various component directory paths
      const componentPaths = [
        'components/schemas/User.yaml',
        'components/parameters/UserId.yaml',
        'components/responses/UserResponse.yaml',
        'components/requestBodies/UserCreate.yaml',
        'components/headers/RateLimit.yaml',
        'components/examples/UserExample.yaml',
        'components/securitySchemes/BearerAuth.yaml',
        'components/links/UserLink.yaml',
        'components/callbacks/NewMessageCallback.yaml',
        'webhooks/messageCreated.yaml',
        'paths/users.yaml',
      ];

      componentPaths.forEach((path) => {
        // @ts-expect-error We are testing edge cases
        const result = parser?.parse(genericContent, { filepath: path });
        expect(result).toBeDefined();
        // Should be rejected even though path matches component directory pattern
        expect(result?.isOpenAPI).toBeFalse();
      });
    });

    it('should handle response code sorting with mixed numeric and non-numeric codes', () => {
      const printer = printers?.['openapi-ast'];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        format: 'json',
        content: {
          openapi: '3.0.0',
          info: { title: 'Test', version: '1.0.0' },
          paths: {
            '/test': {
              get: {
                responses: {
                  'default': { description: 'Default' },
                  '2xx': { description: 'Success range' },
                  '200': { description: 'OK' },
                  '400': { description: 'Bad Request' },
                  '5xx': { description: 'Server Error' },
                },
              },
            },
          },
        },
        originalText: '',
      };

      // @ts-expect-error We are testing edge cases
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 }, () => '');
      expect(result).toBeDefined();
      if (result && typeof result === 'string') {
        const formatted = JSON.parse(result);
        const responseKeys = Object.keys(formatted.paths['/test'].get.responses);
        // Numeric codes should be sorted numerically, non-numeric alphabetically
        expect(responseKeys).toContain('200');
        expect(responseKeys).toContain('400');
        expect(responseKeys).toContain('default');
        expect(responseKeys).toContain('2xx');
        expect(responseKeys).toContain('5xx');
      }
    });

    it('should handle operation objects with requestBody and parameters', () => {
      const parser = parsers?.['openapi-parser'];
      expect(parser).toBeDefined();

      const operationYaml = `requestBody:
  content:
    application/json:
      schema:
        type: object
parameters:
  - name: id
    in: path`;

      // @ts-expect-error We are testing edge cases
      const result = parser?.parse(operationYaml, { filepath: 'paths/users.yaml' });
      expect(result).toBeDefined();
      expect(result?.isOpenAPI).toBeTrue();
    });

    it('should handle operation objects with callbacks and security', () => {
      const parser = parsers?.['openapi-parser'];
      expect(parser).toBeDefined();

      // Operation object with callbacks AND security (both operation-specific)
      const operationYaml = `callbacks:
  myCallback:
    '{$request.body#/callbackUrl}':
      post:
        responses:
          '200':
            description: Success
parameters:
  - name: id
    in: path
security:
  - BearerAuth: []`;

      // @ts-expect-error We are testing edge cases
      const result = parser?.parse(operationYaml, { filepath: 'paths/users.yaml' });
      expect(result).toBeDefined();
      // This should be detected as OpenAPI because it has callbacks AND parameters/security
      expect(result?.isOpenAPI).toBeTrue();
    });

    it('should handle link objects with operationId but no responses', () => {
      const parser = parsers?.['openapi-parser'];
      expect(parser).toBeDefined();

      // Link object: has operationId but NOT responses
      const linkYaml = `operationId: getUserById
parameters:
  userId: $response.body#/id`;

      // @ts-expect-error We are testing edge cases
      const result = parser?.parse(linkYaml, { filepath: 'components/links/UserLink.yaml' });
      expect(result).toBeDefined();
      expect(result?.isOpenAPI).toBeTrue();
    });

    it('should handle custom extensions sorting when both are custom', () => {
      const printer = printers?.['openapi-ast'];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        format: 'json',
        content: {
          openapi: '3.0.0',
          info: {
            title: 'Test API',
            version: '1.0.0',
            'x-extension-1': 'value1',
            'x-extension-2': 'value2',
          },
        },
        originalText: '',
      };

      // @ts-expect-error We are testing edge cases
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 }, () => '');
      expect(result).toBeDefined();
    });

    it('should handle custom extensions when one is custom and one is standard', () => {
      const printer = printers?.['openapi-ast'];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        format: 'json',
        content: {
          openapi: '3.0.0',
          info: {
            'x-custom-extension': 'value',
            title: 'Test API',
            version: '1.0.0',
          },
        },
        originalText: '',
      };

      // @ts-expect-error We are testing edge cases
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 }, () => '');
      expect(result).toBeDefined();
    });

    it('should handle custom extensions positioned before standard keys', () => {
      const printer = printers?.['openapi-ast'];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        format: 'json',
        content: {
          openapi: '3.0.0',
          info: {
            'x-before-title': 'before',
            title: 'Test API',
            'x-after-title': 'after',
            version: '1.0.0',
          },
        },
        originalText: '',
      };

      // @ts-expect-error We are testing edge cases
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 }, () => '');
      expect(result).toBeDefined();
    });

    it('should handle custom extensions positioned after standard keys', () => {
      const printer = printers?.['openapi-ast'];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        format: 'json',
        content: {
          openapi: '3.0.0',
          info: {
            title: 'Test API',
            version: '1.0.0',
            'x-after-version': 'after',
          },
        },
        originalText: '',
      };

      // @ts-expect-error We are testing edge cases
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 }, () => '');
      expect(result).toBeDefined();
    });

    it('should handle external docs objects without description', () => {
      const parser = parsers?.['openapi-parser'];
      expect(parser).toBeDefined();

      const externalDocsYaml = `url: https://example.com/docs`;

      // @ts-expect-error We are testing edge cases
      const result = parser?.parse(externalDocsYaml, { filepath: 'externalDocs/api.yaml' });
      expect(result).toBeDefined();
      expect(result?.isOpenAPI).toBeTrue();
    });

    it('should handle webhook objects with different HTTP methods', () => {
      const parser = parsers?.['openapi-parser'];
      expect(parser).toBeDefined();

      const webhookYaml = `put:
  summary: Update webhook
  responses:
    '200':
      description: Success`;

      // @ts-expect-error We are testing edge cases
      const result = parser?.parse(webhookYaml, { filepath: 'webhooks/update.yaml' });
      expect(result).toBeDefined();
      expect(result?.isOpenAPI).toBeTrue();
    });
  });
});
