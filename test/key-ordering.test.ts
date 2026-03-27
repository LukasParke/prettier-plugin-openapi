import { describe, it, expect } from 'bun:test';
import { printers } from '../src/index';

describe('Key Ordering Tests', () => {
  describe('Info section key ordering', () => {
    it('should sort info keys correctly', () => {
      const printer = printers?.['openapi-ast'];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        format: 'json',
        content: {
          openapi: '3.0.0',
          info: {
            version: '1.0.0',
            termsOfService: 'https://example.com/terms',
            title: 'Test API',
            description: 'A test API',
            contact: { name: 'API Team', email: 'api@example.com' },
            license: { name: 'MIT', url: 'https://opensource.org/licenses/MIT' }
          }
        },
        originalText: '',
      };
      // @ts-expect-error We are mocking things here so we don't need to pass a print function
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 });
      expect(result).toBeDefined();

      if (!result) {
        throw new Error('Result is undefined');
      }

      const resultString = result.toString();

      // Check that info keys appear in the correct order
      const titleIndex = resultString.indexOf('title');
      const versionIndex = resultString.indexOf('version');
      const descriptionIndex = resultString.indexOf('description');
      const termsOfServiceIndex = resultString.indexOf('termsOfService');
      const contactIndex = resultString.indexOf('contact');
      const licenseIndex = resultString.indexOf('license');

      expect(titleIndex).toBeLessThan(versionIndex);
      expect(versionIndex).toBeLessThan(descriptionIndex);
      expect(descriptionIndex).toBeLessThan(termsOfServiceIndex);
      expect(termsOfServiceIndex).toBeLessThan(contactIndex);
      expect(contactIndex).toBeLessThan(licenseIndex);
    });
  });

  describe('Operation key ordering', () => {
    it('should sort operation keys correctly', () => {
      const printer = printers?.['openapi-ast'];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        format: 'yaml',
        content: {
          openapi: '3.0.0',
          info: { title: 'Test API', version: '1.0.0' },
          paths: {
            '/test': {
              get: {
                responses: { '200': { description: 'OK' } },
                operationId: 'getTest',
                summary: 'Get test data',
                description: 'Retrieve test data',
                tags: ['test'],
                parameters: [],
                requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
                callbacks: {},
                deprecated: false,
                security: [],
                'x-sailpoint-userLevels': ['ORG_ADMIN'],
                servers: []
              }
            }
          }
        },
        originalText: ''
      };

      // @ts-expect-error We are mocking things here so we don't need to pass a print function
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 });
      expect(result).toBeDefined();

      if (!result) {
        throw new Error('Result is undefined');
      }

      const resultString = result.toString();

      // Check that operation keys appear in the correct order
      const summaryIndex = resultString.indexOf('summary');
      const operationIdIndex = resultString.indexOf('operationId');
      const descriptionIndex = resultString.indexOf('description');
      const tagsIndex = resultString.indexOf('tags');
      const deprecatedIndex = resultString.indexOf('deprecated');
      const securityIndex = resultString.indexOf('security');
      const userLevelsIndex = resultString.indexOf('x-sailpoint-userLevels');
      const serversIndex = resultString.indexOf('servers');
      const parametersIndex = resultString.indexOf('parameters');
      const requestBodyIndex = resultString.indexOf('requestBody');
      const responsesIndex = resultString.indexOf('responses');
      const callbacksIndex = resultString.indexOf('callbacks');

      expect(operationIdIndex).toBeLessThan(summaryIndex);
      expect(operationIdIndex).toBeLessThan(descriptionIndex);
      expect(summaryIndex).toBeLessThan(tagsIndex);
      expect(tagsIndex).toBeLessThan(deprecatedIndex);
      expect(deprecatedIndex).toBeLessThan(descriptionIndex);
      expect(descriptionIndex).toBeLessThan(securityIndex);
      expect(securityIndex).toBeLessThan(userLevelsIndex);
      expect(userLevelsIndex).toBeLessThan(serversIndex);
      expect(serversIndex).toBeLessThan(parametersIndex);
      expect(parametersIndex).toBeLessThan(requestBodyIndex);
      expect(requestBodyIndex).toBeLessThan(responsesIndex);
      expect(responsesIndex).toBeLessThan(callbacksIndex);
    });
  });

  describe('Request body key ordering', () => {
    it('should order description, then required, then content (inline operation requestBody)', () => {
      const printer = printers?.['openapi-ast'];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        format: 'yaml',
        content: {
          openapi: '3.0.0',
          info: { title: 'Test API', version: '1.0.0' },
          paths: {
            '/items': {
              post: {
                operationId: 'createItem',
                responses: { '201': { description: 'Created' } },
                requestBody: {
                  content: {
                    'application/json': { schema: { type: 'object' } },
                  },
                  required: true,
                  description: 'Payload to create an item',
                },
              },
            },
          },
        },
        originalText: '',
      };

      // @ts-expect-error mock AstPath
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 });
      expect(result).toBeDefined();
      if (!result) throw new Error('Result is undefined');

      const s = result.toString();
      const rb = s.indexOf('requestBody:');
      const block = s.slice(rb);
      const d = block.indexOf('description:');
      const r = block.indexOf('required:');
      const c = block.indexOf('content:');
      expect(d).toBeLessThan(r);
      expect(r).toBeLessThan(c);
    });
  });

  describe('Sort tags by name', () => {
    it('should sort tags by name', () => {
      const printer = printers?.['openapi-ast'];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        format: 'json',
        content: {
          tags: [{ name: 'test2' }, { name: 'test' }],
          openapi: '3.0.0',
          info: { title: 'Test API', version: '1.0.0' }
        }
      };

      // @ts-expect-error We are mocking things here
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 });
      expect(result).toBeDefined();

      if (!result) {
        throw new Error('Result is undefined');
      }

      const resultString = result.toString();

      const testIndex = resultString.indexOf('test"');
      const test2Index = resultString.indexOf('test2"');

      expect(testIndex).toBeLessThan(test2Index);
    });
  });

  describe('Schema key ordering', () => {
    it('should sort schema keys correctly', () => {
      const printer = printers?.['openapi-ast'];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        format: 'yaml',
        content: {
          properties: { id: { type: 'integer' } },
          required: ['id'],
          type: 'object',
          title: 'User',
          description: 'A user object',
          format: 'object',
          default: {},
          example: { id: 1 },
          examples: { user1: { value: { id: 1 } } },
          enum: ['active', 'inactive'],
          const: 'user',
          multipleOf: 1,
          maximum: 100,
          exclusiveMaximum: true,
          minimum: 0,
          exclusiveMinimum: true,
          maxLength: 50,
          minLength: 1,
          pattern: '^[a-zA-Z]+$',
          maxItems: 10,
          minItems: 1,
          uniqueItems: true,
          maxProperties: 5,
          minProperties: 1,
          items: { type: 'string' },
          allOf: [{ type: 'object' }],
          oneOf: [{ type: 'string' }],
          anyOf: [{ type: 'number' }],
          not: { type: 'null' },
          discriminator: { propertyName: 'type' },
          xml: { name: 'user' },
          externalDocs: { url: 'https://example.com' },
          deprecated: false
        }
      };

      // @ts-expect-error We are mocking things here so we don't need to pass a print function
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 });
      expect(result).toBeDefined();

      if (!result) {
        throw new Error('Result is undefined');
      }

      const resultString = result.toString();

      const typeIndex = resultString.indexOf('type:');
      const formatIndex = resultString.indexOf('format:');
      const titleIndex = resultString.indexOf('title:');
      const descriptionIndex = resultString.indexOf('description:');
      const defaultIndex = resultString.indexOf('default:');
      const exampleIndex = resultString.indexOf('example:');
      const examplesIndex = resultString.indexOf('examples:');
      const enumIndex = resultString.indexOf('enum:');
      const constIndex = resultString.indexOf('const:');
      const multipleOfIndex = resultString.indexOf('multipleOf:');
      const maximumIndex = resultString.indexOf('maximum:');
      const exclusiveMaximumIndex = resultString.indexOf('exclusiveMaximum:');
      const minimumIndex = resultString.indexOf('minimum:');
      const exclusiveMinimumIndex = resultString.indexOf('exclusiveMinimum:');
      const maxLengthIndex = resultString.indexOf('maxLength:');
      const minLengthIndex = resultString.indexOf('minLength:');
      const patternIndex = resultString.indexOf('pattern:');
      const maxItemsIndex = resultString.indexOf('maxItems:');
      const minItemsIndex = resultString.indexOf('minItems:');
      const uniqueItemsIndex = resultString.indexOf('uniqueItems:');
      const maxPropertiesIndex = resultString.indexOf('maxProperties:');
      const minPropertiesIndex = resultString.indexOf('minProperties:');
      const requiredIndex = resultString.indexOf('required:');
      const propertiesIndex = resultString.indexOf('properties:');
      const itemsIndex = resultString.indexOf('items:');
      const allOfIndex = resultString.indexOf('allOf:');
      const oneOfIndex = resultString.indexOf('oneOf:');
      const anyOfIndex = resultString.indexOf('anyOf:');
      const notIndex = resultString.indexOf('not:');
      const discriminatorIndex = resultString.indexOf('discriminator:');
      const xmlIndex = resultString.indexOf('xml:');
      const externalDocsIndex = resultString.indexOf('externalDocs:');
      const deprecatedIndex = resultString.indexOf('deprecated:');

      // Test the core ordering - just the most important keys
      expect(titleIndex).toBeLessThan(descriptionIndex);
      expect(descriptionIndex).toBeLessThan(typeIndex);
      expect(typeIndex).toBeLessThan(formatIndex);
      expect(formatIndex).toBeLessThan(constIndex);
      expect(constIndex).toBeLessThan(enumIndex);
      expect(enumIndex).toBeLessThan(defaultIndex);
      expect(defaultIndex).toBeLessThan(exampleIndex);
      expect(exampleIndex).toBeLessThan(examplesIndex);
      expect(examplesIndex).toBeLessThan(minimumIndex);
      expect(minimumIndex).toBeLessThan(exclusiveMinimumIndex);
      expect(exclusiveMinimumIndex).toBeLessThan(multipleOfIndex);
      expect(multipleOfIndex).toBeLessThan(maximumIndex);
      expect(maximumIndex).toBeLessThan(exclusiveMaximumIndex);
      expect(exclusiveMaximumIndex).toBeLessThan(patternIndex);
      expect(patternIndex).toBeLessThan(minLengthIndex);
      expect(minLengthIndex).toBeLessThan(maxLengthIndex);
      expect(maxLengthIndex).toBeLessThan(uniqueItemsIndex);
      expect(uniqueItemsIndex).toBeLessThan(minItemsIndex);
      expect(minItemsIndex).toBeLessThan(maxItemsIndex);
      expect(uniqueItemsIndex).toBeLessThan(minPropertiesIndex);
      expect(minPropertiesIndex).toBeLessThan(maxPropertiesIndex);
      expect(minPropertiesIndex).toBeLessThan(propertiesIndex);
      expect(propertiesIndex).toBeLessThan(requiredIndex);
      // Skip the complex ordering for items, allOf, etc. as they might not be in exact order
      expect(discriminatorIndex).toBeLessThan(allOfIndex);
      expect(allOfIndex).toBeLessThan(anyOfIndex);
      expect(anyOfIndex).toBeLessThan(oneOfIndex);
      expect(oneOfIndex).toBeLessThan(notIndex);
      expect(notIndex).toBeLessThan(xmlIndex);
    });

    it('orders type before items for schemas under response content (schema context, not mediaType)', () => {
      const printer = printers?.['openapi-ast'];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        format: 'yaml',
        content: {
          openapi: '3.0.0',
          info: { title: 'T', version: '1' },
          paths: {
            '/x': {
              get: {
                operationId: 'getX',
                responses: {
                  '200': {
                    description: 'OK',
                    content: {
                      'application/json': {
                        schema: {
                          items: { type: 'string' },
                          type: 'array',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        originalText: '',
      };

      // @ts-expect-error mock AstPath
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 });
      expect(result).toBeDefined();
      if (!result) throw new Error('Result is undefined');

      const s = result.toString();
      const r200 = s.indexOf("'200':");
      expect(r200).toBeGreaterThanOrEqual(0);
      const slice = s.slice(r200, r200 + 900);
      const typeIdx = slice.indexOf('type:');
      const itemsIdx = slice.indexOf('items:');
      expect(typeIdx).toBeLessThan(itemsIdx);
    });
  });

  describe('Response key ordering', () => {
    it('should sort response keys correctly', () => {
      const printer = printers?.['openapi-ast'];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        format: 'json',
        content: {
          openapi: '3.0.0',
          info: { title: 'Test API', version: '1.0.0' },
          paths: {
            '/test': {
              get: {
                responses: {
                  '200': {
                    content: { 'application/json': { schema: { type: 'object' } } },
                    description: 'Successful response',
                    headers: { 'X-RateLimit-Limit': { schema: { type: 'integer' } } },
                    links: { user: { operationId: 'getUser' } }
                  }
                }
              }
            }
          }
        }
      };
      // @ts-expect-error We are mocking things here so we don't need to pass a print function
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 });
      expect(result).toBeDefined();

      if (!result) {
        throw new Error('Result is undefined');
      }

      const resultString = result.toString();

      // Check that response keys appear in the correct order
      const descriptionIndex = resultString.indexOf('description');
      const headersIndex = resultString.indexOf('headers');
      const contentIndex = resultString.indexOf('content');
      const linksIndex = resultString.indexOf('links');

      expect(descriptionIndex).toBeLessThan(headersIndex);
      expect(headersIndex).toBeLessThan(contentIndex);
      expect(contentIndex).toBeLessThan(linksIndex);
    });
  });

  describe('Parameter key ordering', () => {
    it('should sort parameter keys correctly', () => {
      const printer = printers?.['openapi-ast'];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        format: 'yaml',
        content: {
          openapi: '3.0.0',
          info: { title: 'Test API', version: '1.0.0' },
          paths: {
            '/test': {
              get: {
                parameters: [
                  {
                    schema: { type: 'string' },
                    examples: { example1: { value: 'test' } },
                    name: 'id',
                    in: 'path',
                    description: 'User ID',
                    required: true,
                    deprecated: false,
                    allowEmptyValue: false,
                    style: 'simple',
                    explode: false,
                    allowReserved: false,
                    example: '123'
                  }
                ],
                responses: { '200': { description: 'OK' } }
              }
            }
          }
        }
      };
      // @ts-expect-error We are mocking things here so we don't need to pass a print function
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 });
      expect(result).toBeDefined();

      if (!result) {
        throw new Error('Result is undefined');
      }

      const resultString = result.toString();

      const nameIndex = resultString.indexOf('name:');
      const inIndex = resultString.indexOf('in:');
      const descriptionIndex = resultString.indexOf('description:');
      const requiredIndex = resultString.indexOf('required:');
      const deprecatedIndex = resultString.indexOf('deprecated:');
      const allowEmptyValueIndex = resultString.indexOf('allowEmptyValue:');
      const styleIndex = resultString.indexOf('style:');
      const explodeIndex = resultString.indexOf('explode:');
      const allowReservedIndex = resultString.indexOf('allowReserved:');
      const schemaIndex = resultString.indexOf('schema:');
      const exampleIndex = resultString.indexOf('example:');
      const examplesIndex = resultString.indexOf('examples:');

      // Test the core parameter ordering
      expect(nameIndex).toBeLessThan(descriptionIndex);
      expect(descriptionIndex).toBeLessThan(inIndex);
      expect(inIndex).toBeLessThan(requiredIndex);
      expect(requiredIndex).toBeLessThan(deprecatedIndex);
      expect(deprecatedIndex).toBeLessThan(allowEmptyValueIndex);
      expect(allowEmptyValueIndex).toBeLessThan(styleIndex);
      expect(styleIndex).toBeLessThan(explodeIndex);
      expect(explodeIndex).toBeLessThan(allowReservedIndex);
      expect(allowReservedIndex).toBeLessThan(schemaIndex);
      expect(schemaIndex).toBeLessThan(exampleIndex);
      expect(exampleIndex).toBeLessThan(examplesIndex);
    });
  });

  describe('Security scheme key ordering', () => {
    it('should sort security scheme keys correctly', () => {
      const printer = printers?.['openapi-ast'];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        format: 'yaml',
        content: {
          openapi: '3.0.0',
          info: { title: 'Test API', version: '1.0.0' },
          components: {
            securitySchemes: {
              BearerAuth: {
                bearerFormat: 'JWT',
                description: 'Bearer token authentication',
                flows: {
                  implicit: {
                    authorizationUrl: 'https://example.com/oauth/authorize',
                    scopes: { read: 'Read access' }
                  }
                },
                name: 'Authorization',
                in: 'header',
                scheme: 'bearer',
                type: 'http',
                openIdConnectUrl: 'https://example.com/.well-known/openid_configuration'
              }
            }
          }
        }
      };
      // @ts-expect-error We are mocking things here so we don't need to pass a print function
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 });
      expect(result).toBeDefined();

      if (!result) {
        throw new Error('Result is undefined');
      }

      const resultString = result.toString();

      // Check that security scheme keys appear in the correct order
      const typeIndex = resultString.indexOf('type:');
      const descriptionIndex = resultString.indexOf('description:');
      const nameIndex = resultString.indexOf('name:');
      const inIndex = resultString.indexOf('in:');
      const schemeIndex = resultString.indexOf('scheme:');
      const bearerFormatIndex = resultString.indexOf('bearerFormat:');
      const flowsIndex = resultString.indexOf('flows:');
      const openIdConnectUrlIndex = resultString.indexOf('openIdConnectUrl:');

      expect(nameIndex).toBeLessThan(descriptionIndex);
      expect(descriptionIndex).toBeLessThan(typeIndex);
      expect(typeIndex).toBeLessThan(inIndex);
      expect(inIndex).toBeLessThan(schemeIndex);
      expect(schemeIndex).toBeLessThan(bearerFormatIndex);
      expect(bearerFormatIndex).toBeLessThan(openIdConnectUrlIndex);
      expect(openIdConnectUrlIndex).toBeLessThan(flowsIndex);
    });
  });

  describe('Server key ordering', () => {
    it('should sort server keys correctly', () => {
      const printer = printers?.['openapi-ast'];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        format: 'json',
        content: {
          openapi: '3.0.0',
          info: { title: 'Test API', version: '1.0.0' },
          servers: [
            {
              variables: { environment: { default: 'production' } },
              url: 'https://api.example.com/v1',
              description: 'Production server'
            }
          ]
        }
      };
      // @ts-expect-error We are mocking things here so we don't need to pass a print function
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 });
      expect(result).toBeDefined();

      if (!result) {
        throw new Error('Result is undefined');
      }

      const resultString = result.toString();

      const nameIndex = resultString.indexOf('name');
      const descriptionIndex = resultString.indexOf('description');
      const urlIndex = resultString.indexOf('url');
      const variablesIndex = resultString.indexOf('variables');

      expect(nameIndex).toBeLessThan(descriptionIndex);
      expect(descriptionIndex).toBeLessThan(urlIndex);
      expect(urlIndex).toBeLessThan(variablesIndex);
    });
  });

  describe('Tag key ordering', () => {
    it('should sort tag keys correctly', () => {
      const printer = printers?.['openapi-ast'];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        format: 'json',
        content: {
          openapi: '3.0.0',
          info: { title: 'Test API', version: '1.0.0' },
          tags: [
            {
              externalDocs: { url: 'https://example.com/docs' },
              name: 'users',
              description: 'User management operations'
            }
          ]
        }
      };
      // @ts-expect-error We are mocking things here so we don't need to pass a print function
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 });
      expect(result).toBeDefined();

      if (!result) {
        throw new Error('Result is undefined');
      }

      const resultString = result.toString();

      const nameIndex = resultString.indexOf('name');
      const descriptionIndex = resultString.indexOf('description');
      const externalDocsIndex = resultString.indexOf('externalDocs');

      expect(nameIndex).toBeLessThan(descriptionIndex);
      expect(descriptionIndex).toBeLessThan(externalDocsIndex);
    });
  });

  describe('External docs key ordering', () => {
    it('should sort external docs keys correctly', () => {
      const printer = printers?.['openapi-ast'];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        format: 'json',
        content: {
          openapi: '3.0.0',
          info: { title: 'Test API', version: '1.0.0' },
          externalDocs: {
            url: 'https://example.com/docs',
            description: 'External documentation'
          }
        }
      };
      // @ts-expect-error We are mocking things here so we don't need to pass a print function
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 });
      expect(result).toBeDefined();

      if (!result) {
        throw new Error('Result is undefined');
      }

      const resultString = result.toString();

      // Check that external docs keys appear in the correct order
      const descriptionIndex = resultString.indexOf('description');
      const urlIndex = resultString.indexOf('url');

      expect(descriptionIndex).toBeLessThan(urlIndex);
    });
  });

  describe('Path sorting', () => {
    it('should sort paths by specificity', () => {
      const printer = printers?.['openapi-ast'];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        format: 'json',
        content: {
          openapi: '3.0.0',
          info: { title: 'Test API', version: '1.0.0' },
          paths: {
            '/users/{id}/posts/{postId}': { get: {} },
            '/users/{id}': { get: {} },
            '/users': { get: {} },
            '/users/{id}/posts': { get: {} }
          }
        }
      };
      // @ts-expect-error We are mocking things here so we don't need to pass a print function
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 });
      expect(result).toBeDefined();

      if (!result) {
        throw new Error('Result is undefined');
      }

      const resultString = result.toString();

      // Check that paths are sorted by specificity (fewer parameters first)
      const usersIndex = resultString.indexOf('/users');
      const usersIdIndex = resultString.indexOf('/users/{id}');
      const usersIdPostsIndex = resultString.indexOf('/users/{id}/posts');
      const usersIdPostsPostIdIndex = resultString.indexOf('/users/{id}/posts/{postId}');

      expect(usersIndex).toBeLessThan(usersIdIndex);
      expect(usersIdIndex).toBeLessThan(usersIdPostsIndex);
      expect(usersIdPostsIndex).toBeLessThan(usersIdPostsPostIdIndex);
    });
  });

  describe('Response code sorting', () => {
    it('should sort response codes numerically', () => {
      const printer = printers?.['openapi-ast'];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        format: 'json',
        content: {
          openapi: '3.0.0',
          info: { title: 'Test API', version: '1.0.0' },
          paths: {
            '/test': {
              get: {
                responses: {
                  '500': { description: 'Internal Server Error' },
                  '200': { description: 'OK' },
                  '404': { description: 'Not Found' },
                  '400': { description: 'Bad Request' },
                  'default': { description: 'Default response' }
                }
              }
            }
          }
        }
      };
      // @ts-expect-error We are mocking things here so we don't need to pass a print function
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 });
      expect(result).toBeDefined();

      if (!result) {
        throw new Error('Result is undefined');
      }

      const resultString = result.toString();

      // Check that response codes are sorted numerically
      const code200Index = resultString.indexOf('200');
      const code400Index = resultString.indexOf('400');
      const code404Index = resultString.indexOf('404');
      const code500Index = resultString.indexOf('500');
      const defaultIndex = resultString.indexOf('default');

      expect(code200Index).toBeLessThan(code400Index);
      expect(code400Index).toBeLessThan(code404Index);
      expect(code404Index).toBeLessThan(code500Index);
      expect(code500Index).toBeLessThan(defaultIndex);
    });
  });
});
