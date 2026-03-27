import { describe, expect, it } from 'bun:test';
import {parsers, printers} from '../src/index';

describe('Integration Tests', () => {
  describe('Real OpenAPI file processing', () => {
    it('should process a complete OpenAPI 3.0 file', () => {
      const openApiContent = {
        openapi: '3.0.0',
        info: {
          title: 'Test API',
          version: '1.0.0',
          description: 'A test API',
          contact: {
            name: 'API Support',
            email: 'support@example.com'
          },
          license: {
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT'
          }
        },
        servers: [
          {
            url: 'https://api.example.com/v1',
            description: 'Production server'
          }
        ],
        paths: {
          '/users': {
            get: {
              summary: 'Get users',
              description: 'Retrieve all users',
              operationId: 'getUsers',
              tags: ['users'],
              parameters: [
                {
                  name: 'limit',
                  in: 'query',
                  description: 'Number of users to return',
                  required: false,
                  schema: {
                    type: 'integer',
                    minimum: 1,
                    maximum: 100,
                    default: 10
                  }
                }
              ],
              responses: {
                '200': {
                  description: 'Successful response',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/User'
                        }
                      }
                    }
                  }
                },
                '400': {
                  description: 'Bad request',
                  content: {
                    'application/json': {
                      schema: {
                        $ref: '#/components/schemas/Error'
                      }
                    }
                  }
                }
              }
            },
            post: {
              summary: 'Create user',
              description: 'Create a new user',
              operationId: 'createUser',
              tags: ['users'],
              requestBody: {
                required: true,
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/UserCreate'
                    }
                  }
                }
              },
              responses: {
                '201': {
                  description: 'User created',
                  content: {
                    'application/json': {
                      schema: {
                        $ref: '#/components/schemas/User'
                      }
                    }
                  }
                }
              }
            }
          },
          '/users/{id}': {
            get: {
              summary: 'Get user by ID',
              operationId: 'getUserById',
              tags: ['users'],
              parameters: [
                {
                  name: 'id',
                  in: 'path',
                  required: true,
                  description: 'User ID',
                  schema: {
                    type: 'integer',
                    format: 'int64'
                  }
                }
              ],
              responses: {
                '200': {
                  description: 'User found',
                  content: {
                    'application/json': {
                      schema: {
                        $ref: '#/components/schemas/User'
                      }
                    }
                  }
                },
                '404': {
                  description: 'User not found',
                  content: {
                    'application/json': {
                      schema: {
                        $ref: '#/components/schemas/Error'
                      }
                    }
                  }
                }
              }
            }
          }
        },
        components: {
          schemas: {
            User: {
              type: 'object',
              required: ['id', 'name', 'email'],
              properties: {
                id: {
                  type: 'integer',
                  format: 'int64',
                  description: 'User ID'
                },
                name: {
                  type: 'string',
                  description: 'User name',
                  minLength: 1,
                  maxLength: 100
                },
                email: {
                  type: 'string',
                  format: 'email',
                  description: 'User email'
                },
                createdAt: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Creation timestamp'
                }
              }
            },
            UserCreate: {
              type: 'object',
              required: ['name', 'email'],
              properties: {
                name: {
                  type: 'string',
                  description: 'User name',
                  minLength: 1,
                  maxLength: 100
                },
                email: {
                  type: 'string',
                  format: 'email',
                  description: 'User email'
                }
              }
            },
            Error: {
              type: 'object',
              required: ['code', 'message'],
              properties: {
                code: {
                  type: 'string',
                  description: 'Error code'
                },
                message: {
                  type: 'string',
                  description: 'Error message'
                }
              }
            }
          }
        },
        tags: [
          {
            name: 'users',
            description: 'User management operations'
          }
        ]
      };

      const printer = printers?.['openapi-ast'];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        content: openApiContent,
        originalText: '',
        format: 'json'
      };

      // @ts-expect-error We are mocking things here
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 }, () => '');
      expect(result).toBeDefined();
      
      if (result && typeof result === 'string') {
        const formatted = JSON.parse(result);
        
        // Verify key ordering
        const keys = Object.keys(formatted);
        expect(keys[0]).toBe('openapi');
        expect(keys[1]).toBe('info');
        expect(keys[2]).toBe('servers');
        expect(keys[3]).toBe('tags');
        expect(keys[4]).toBe('paths');
        expect(keys[5]).toBe('components');
        
        // Verify nested key ordering
        const infoKeys = Object.keys(formatted.info);
        expect(infoKeys[0]).toBe('title');
        expect(infoKeys[1]).toBe('version');
        expect(infoKeys[2]).toBe('description');
        expect(infoKeys[3]).toBe('contact');
        expect(infoKeys[4]).toBe('license');
        
        // Verify components key ordering
        const componentKeys = Object.keys(formatted.components);
        expect(componentKeys[0]).toBe('schemas');
        
        // Verify schema key ordering (alphabetical)
        const schemaKeys = Object.keys(formatted.components.schemas);
        expect(schemaKeys[0]).toBe('Error');
        expect(schemaKeys[1]).toBe('User');
        expect(schemaKeys[2]).toBe('UserCreate');
      }
    });

    it('should process a Swagger 2.0 file', () => {
      const swaggerContent = {
        swagger: '2.0',
        info: {
          title: 'Test API',
          version: '1.0.0',
          description: 'A test API',
          contact: {
            name: 'API Support',
            email: 'support@example.com'
          },
          license: {
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT'
          }
        },
        host: 'api.example.com',
        basePath: '/v1',
        schemes: ['https'],
        consumes: ['application/json'],
        produces: ['application/json'],
        paths: {
          '/users': {
            get: {
              summary: 'Get users',
              description: 'Retrieve all users',
              operationId: 'getUsers',
              tags: ['users'],
              parameters: [
                {
                  name: 'limit',
                  in: 'query',
                  description: 'Number of users to return',
                  required: false,
                  type: 'integer',
                  minimum: 1,
                  maximum: 100,
                  default: 10
                }
              ],
              responses: {
                '200': {
                  description: 'Successful response',
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/definitions/User'
                    }
                  }
                },
                '400': {
                  description: 'Bad request',
                  schema: {
                    $ref: '#/definitions/Error'
                  }
                }
              }
            }
          }
        },
        definitions: {
          User: {
            type: 'object',
            required: ['id', 'name', 'email'],
            properties: {
              id: {
                type: 'integer',
                format: 'int64',
                description: 'User ID'
              },
              name: {
                type: 'string',
                description: 'User name',
                minLength: 1,
                maxLength: 100
              },
              email: {
                type: 'string',
                format: 'email',
                description: 'User email'
              }
            }
          },
          Error: {
            type: 'object',
            required: ['code', 'message'],
            properties: {
              code: {
                type: 'string',
                description: 'Error code'
              },
              message: {
                type: 'string',
                description: 'Error message'
              }
            }
          }
        },
        tags: [
          {
            name: 'users',
            description: 'User management operations'
          }
        ]
      };

      const printer = printers?.['openapi-ast'];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        content: swaggerContent,
        originalText: '',
        format: 'json'
      };

      // @ts-expect-error We are mocking things here
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 }, () => '');
      expect(result).toBeDefined();
      
      if (result && typeof result === 'string') {
        const formatted = JSON.parse(result);
        
        // Verify Swagger 2.0 key ordering
        const keys = Object.keys(formatted);
        expect(keys[0]).toBe('swagger');
        expect(keys[1]).toBe('info');
        expect(keys[2]).toBe('schemes');
        expect(keys[3]).toBe('host');
        expect(keys[4]).toBe('basePath');
        expect(keys[5]).toBe('consumes');
        expect(keys[6]).toBe('produces');
        expect(keys[7]).toBe('tags');
        expect(keys[8]).toBe('paths');
        expect(keys[9]).toBe('definitions');
      }
    });
  });

  describe('YAML formatting', () => {
    it('should format YAML with proper structure', () => {
      const yamlContent = {
        openapi: '3.0.0',
        info: {
          title: 'Test API',
          version: '1.0.0'
        },
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'Success'
                }
              }
            }
          }
        }
      };

      const printer = printers?.['openapi-ast'];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        content: yamlContent,
        originalText: '',
        format: 'yaml'
      };

      // @ts-expect-error We are mocking things here
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 }, () => '');
      expect(result).toBeDefined();
      
      if (result) {
        // Verify YAML structure
        expect(result).toContain('openapi:');
        expect(result).toContain('info:');
        expect(result).toContain('paths:');
        expect(result).toContain('title:');
        expect(result).toContain('version:');
        expect(result).toContain('get:');
        expect(result).toContain('responses:');
        expect(result).toContain("'200':");
        expect(result).toContain('description:');
        expect(result).toContain('Success');
      }
    });
  });

  describe('Error handling', () => {
    it('should handle malformed JSON gracefully', () => {
      const parser = parsers?.['openapi-parser'];
      expect(parser).toBeDefined();

      const malformedJson = '{"openapi": "3.0.0", "info": {';

      // @ts-expect-error We are mocking things here
      const result = parser?.parse(malformedJson, { filepath: 'test.json' });

      expect(result).toBeDefined();
      expect(result?.isOpenAPI).toBeFalse();
    });

    it('should handle malformed YAML gracefully', () => {
      const parser = parsers?.['openapi-parser'];
      expect(parser).toBeDefined();

      const malformedYaml = 'openapi: 3.0.0\ninfo:\n  title: Test\n  version: 1.0.0\n  invalid: [';

      // @ts-expect-error We are mocking things here
      const result = parser?.parse(malformedYaml, { filepath: 'test.yaml' });

      expect(result).toBeDefined();
      expect(result?.isOpenAPI).toBeFalse();
    });

    it('should handle non-OpenAPI content', () => {
      const parser = parsers?.['openapi-parser'];
      expect(parser).toBeDefined();

      const nonOpenAPI = '{"name": "John", "age": 30}';

      const parsedJSON = {
        name: 'John',
        age: 30
      }

      // @ts-expect-error We are mocking things here
      const parsedData = parser?.parse(nonOpenAPI, { filepath: 'test.json' })
      expect(parsedData).toBeDefined();
      expect(parsedData?.isOpenAPI).toBeFalse();
    });
  });

  describe('Performance tests', () => {
    it('should handle large OpenAPI files efficiently', () => {
      const largeOpenAPI = {
        openapi: '3.0.0',
        info: {
          title: 'Large API',
          version: '1.0.0'
        },
        paths: {}
      };

      // Create a large paths object
      for (let i = 0; i < 100; i++) {
        largeOpenAPI.paths[`/path${i}`] = {
          get: {
            summary: `Get path ${i}`,
            responses: {
              '200': {
                description: 'Success'
              }
            }
          }
        };
      }

      const printer = printers?.['openapi-ast'];
      expect(printer).toBeDefined();

      const testData = {
        isOpenAPI: true,
        content: largeOpenAPI,
        originalText: '',
        format: 'json'
      };

      const startTime = Date.now();
      
      // @ts-expect-error We are mocking things here
      const result = printer?.print({ getNode: () => testData }, { tabWidth: 2 }, () => '');
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(result).toBeDefined();
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});
