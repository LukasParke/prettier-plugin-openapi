# Prettier Plugin OpenAPI

A Prettier plugin for formatting OpenAPI/Swagger JSON and YAML files with intelligent key sorting, proper indentation, and support for modular OpenAPI file structures.

## Features

- 🎯 **OpenAPI/Swagger Support**: Formats both JSON and YAML OpenAPI specifications
- 🔄 **Smart Key Sorting**: Automatically sorts OpenAPI keys in the recommended order
- 📁 **Modular File Support**: Handles both monolithic and modular OpenAPI file structures
- 🧩 **Component Files**: Supports individual component files (schemas, parameters, responses, etc.)
- 📝 **YAML & JSON**: Supports both `.yaml/.yml` and `.json` file formats
- 🎨 **Consistent Formatting**: Applies consistent indentation and line breaks
- 🔌 **Vendor Extensions**: Programmatic loading of vendor-specific extensions
- ⚡ **Fast**: Built with performance in mind using modern JavaScript
- 🧪 **Comprehensive Testing**: 142 tests with 95.69% line coverage
- 🚀 **CI/CD Ready**: Automated testing, building, and publishing
- 🔒 **Strict Validation**: Properly rejects non-OpenAPI content
- 📊 **High Quality**: Biome, Prettier, and TypeScript for code quality

## Current Status

✅ **Production Ready**: Version 1.0.1 with comprehensive test coverage  
✅ **Modern Tooling**: Updated to use Biome for fast linting and formatting  
✅ **Comprehensive Testing**: 142 tests covering all major functionality  
✅ **High Performance**: Optimized for large OpenAPI files  
✅ **Active Development**: Regular updates and improvements

## Installation

This plugin has a `prettier` peer dependency and works with Prettier 3 on Node 18+.

```bash
npm install --save-dev prettier prettier-plugin-openapi
# or
pnpm add --save-dev prettier prettier-plugin-openapi
# or
yarn add --dev prettier prettier-plugin-openapi
# or
bun add --dev prettier prettier-plugin-openapi
```

## Usage

### Command Line

```bash
# Format a single file
pnpx prettier --write api.yaml

# Format all OpenAPI files in a directory
pnpx prettier --write "**/*.{openapi.json,openapi.yaml,swagger.json,swagger.yaml}"

# Format with specific options
pnpx prettier --write api.yaml --tab-width 4 --print-width 100
```

### Configuration

Add the plugin to your Prettier configuration:

**package.json**
```json
{
  "prettier": {
    "plugins": ["prettier-plugin-openapi"]
  }
}
```

**.prettierrc**
```json
{
  "plugins": ["prettier-plugin-openapi"],
  "tabWidth": 2,
  "printWidth": 80
}
```

**.prettierrc.js**
```javascript
module.exports = {
  plugins: ['prettier-plugin-openapi'],
  tabWidth: 2,
  printWidth: 80,
};
```

### Repo Setup

For a typical repository, add a couple of scripts so local development and CI use the same commands:

**package.json**
```json
{
  "scripts": {
    "format": "prettier --write \"openapi/**/*.{yaml,yml,json}\"",
    "format:check": "prettier --check \"openapi/**/*.{yaml,yml,json}\""
  }
}
```

**.prettierrc.json**
```json
{
  "plugins": ["prettier-plugin-openapi"]
}
```

Then you can run:

```bash
npm run format
npm run format:check
```

Adjust the `openapi/**/*.{yaml,yml,json}` glob to match wherever your specs live.

### GitHub Actions

If you want formatting to run whenever `main` is updated and automatically push formatting fixes back to pull requests, you can use [autofix.ci](https://autofix.ci/).

1. Install the [autofix.ci GitHub App](https://autofix.ci/) for your repository.
2. Add a workflow like this:

**.github/workflows/format-openapi.yml**
```yaml
name: Format OpenAPI

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  format:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: 20

      - run: npm ci
      - run: npm run format

      - uses: autofix-ci/action@7a166d7532b277f34e16238930461bf77f9d7ed8
```

This runs the same Prettier command on pushes to `main` and on pull requests, while `autofix.ci` writes any formatting changes back to the PR branch for you.

If you only want CI to verify formatting instead of auto-fixing it, replace `npm run format` with `npm run format:check` and remove the `autofix-ci` step.

## Supported File Extensions

- `.openapi.json`
- `.openapi.yaml`
- `.openapi.yml`
- `.swagger.json`
- `.swagger.yaml`
- `.swagger.yml`
- `.json` (for component files)
- `.yaml` / `.yml` (for component files)

## Modular File Structure Support

The plugin supports both monolithic and modular OpenAPI file structures:

### Monolithic Structure
```
api.yaml                    # Single file with everything
```

### Modular Structure
```
├─ openapi.yaml             # Root document
├─ paths/                    # Path files
│  ├─ users.yaml
│  ├─ users_{id}.yaml
│  └─ auth_login.yaml
├─ components/               # Component files
│  ├─ schemas/
│  │  ├─ User.yaml
│  │  ├─ UserCreate.yaml
│  │  └─ Error.yaml
│  ├─ parameters/
│  │  ├─ CommonPagination.yaml
│  │  └─ UserId.yaml
│  ├─ responses/
│  │  ├─ ErrorResponse.yaml
│  │  └─ UserResponse.yaml
│  ├─ requestBodies/
│  │  └─ UserCreateBody.yaml
│  ├─ headers/
│  │  └─ RateLimitHeaders.yaml
│  ├─ examples/
│  │  └─ UserExample.yaml
│  ├─ securitySchemes/
│  │  └─ BearerAuth.yaml
│  ├─ links/
│  │  └─ UserCreatedLink.yaml
│  └─ callbacks/
│     └─ NewMessageCallback.yaml
└─ webhooks/                 # Webhook files
   └─ messageCreated.yaml
```

## Key Sorting

The plugin automatically sorts OpenAPI keys in the recommended order:

> 📖 **Complete Key Reference**: For a comprehensive reference of all keys, their ordering, and detailed reasoning, see [KEYS.md](./KEYS.md).

## Examples

### Monolithic File Structure

#### Before (unformatted):
```yaml
paths:
  /users:
    get:
      responses:
        '200':
          description: OK
components:
  schemas:
    User:
      type: object
openapi: 3.0.0
info:
  version: 1.0.0
  title: My API
```

#### After (formatted):
```yaml
openapi: 3.0.0
info:
  title: My API
  version: 1.0.0
paths:
  /users:
    get:
      responses:
        '200':
          description: OK
components:
  schemas:
    User:
      type: object
```

### Modular File Structure

#### Root Document (`openapi.yaml`):
```yaml
openapi: 3.0.0
info:
  title: My API
  version: 1.0.0
paths:
  $ref: './paths/users.yaml'
components:
  schemas:
    $ref: './components/schemas/User.yaml'
```

#### Component File (`components/schemas/User.yaml`):
```yaml
type: object
properties:
  id:
    type: integer
  name:
    type: string
required:
  - id
  - name
```

#### Path File (`paths/users.yaml`):
```yaml
get:
  summary: Get users
  responses:
    '200':
      description: Success
      content:
        application/json:
          schema:
            type: array
            items:
              $ref: '../components/schemas/User.yaml'
```

## Vendor Extension Guide

### Adding Your Vendor Extensions

The plugin supports a simple system for vendors to contribute custom extensions. 

Here's how to add your vendor extensions:

#### Step 1: Create Your Vendor Extension File

Create a new TypeScript file in `src/extensions/vendor/your-vendor.ts`:

```typescript
/**
 * Your Vendor Extensions
 * 
 * Your vendor extensions for OpenAPI formatting.
 * Website: https://your-vendor.com
 */

import { defineConfig } from "../index.js";

export const yourVendor = defineConfig({
  info: {
    name: 'Your Vendor',
    website: 'https://your-vendor.com',
    support: 'support@your-vendor.com'
  },
  extensions: {
    // Define your extensions here
  }
});
```

#### Step 2: Register Your Vendor

Add your vendor to the vendor loader in `src/extensions/vendor-loader.ts`:

```typescript
// Import your vendor extension
import { yourVendor } from './vendor/your-vendor.js';

// Add to the vendorModules array
const vendorModules = [
  speakeasy, 
  postman, 
  redoc,
  yourVendor  // Add your vendor here
];
```

#### Step 3: Define Your Extensions

Use the `before()` and `after()` helper functions to position your extensions relative to standard OpenAPI keys. The system now provides **full IntelliSense support** with type-safe key suggestions:

```typescript
extensions: {
  'top-level': (before, after) => {
    // ✅ IntelliSense shows: 'swagger', 'openapi', 'info', 'paths', etc.
    return {
      'x-your-vendor-sdk': before('info'),        // ✅ Type-safe: 'info' is valid
      'x-your-vendor-auth': after('paths'),       // ✅ Type-safe: 'paths' is valid
      // 'x-invalid': before('invalidKey'),       // ❌ TypeScript error: 'invalidKey' not valid
    };
  },
  'operation': (before, after) => {
    // ✅ IntelliSense shows: 'summary', 'operationId', 'parameters', 'responses', etc.
    return {
      'x-your-vendor-retries': after('parameters'), // ✅ Type-safe: 'parameters' is valid
      'x-your-vendor-timeout': before('responses'), // ✅ Type-safe: 'responses' is valid
    };
  },
  'schema': (before, after) => {
    // ✅ IntelliSense shows: '$ref', 'title', 'type', 'format', 'example', etc.
    return {
      'x-your-vendor-validation': after('type'),   // ✅ Type-safe: 'type' is valid
      'x-your-vendor-example': after('example'),    // ✅ Type-safe: 'example' is valid
    };
  }
}
```

### 🎯 Enhanced IntelliSense Features

The vendor extension system now provides comprehensive IntelliSense support:

#### Type-Safe Key Suggestions
- **Context-aware autocomplete**: Each context shows only valid OpenAPI keys
- **Real-time validation**: TypeScript errors for invalid keys
- **Hover documentation**: Detailed information about each key's purpose

#### Available Contexts with IntelliSense
- `'top-level'` → Shows: `swagger`, `openapi`, `info`, `paths`, `components`, etc.
- `'info'` → Shows: `title`, `version`, `description`, `contact`, `license`, etc.
- `'operation'` → Shows: `summary`, `operationId`, `parameters`, `responses`, etc.
- `'schema'` → Shows: `$ref`, `title`, `type`, `format`, `example`, etc.
- `'parameter'` → Shows: `name`, `description`, `in`, `required`, `schema`, etc.
- `'response'` → Shows: `description`, `headers`, `content`, `links`
- `'securityScheme'` → Shows: `type`, `description`, `name`, `in`, `scheme`, etc.
- `'server'` → Shows: `url`, `description`, `variables`
- `'tag'` → Shows: `name`, `description`, `externalDocs`
- `'externalDocs'` → Shows: `description`, `url`
- `'webhook'` → Shows: `summary`, `operationId`, `parameters`, `responses`, etc.
- `'definitions'` → Shows schema keys (Swagger 2.0)
- `'securityDefinitions'` → Shows security scheme keys (Swagger 2.0)

#### Enhanced Helper Functions

```typescript
import { createPositionHelpers } from "../index.js";

// Get enhanced helpers for a specific context
const helpers = createPositionHelpers('operation');

// Type-safe positioning
helpers.before('parameters');  // ✅ IntelliSense shows valid operation keys
helpers.after('responses');    // ✅ IntelliSense shows valid operation keys

// Additional utilities
const availableKeys = helpers.getAvailableKeys();  // Get all valid keys
const isValid = helpers.isValidKey('summary');      // Check if key is valid
```

### Supported Contexts

You can define extensions for these OpenAPI contexts:

- `'top-level'` - Root OpenAPI document
- `'info'` - API information section
- `'operation'` - HTTP operations (GET, POST, etc.)
- `'parameter'` - Operation parameters
- `'schema'` - Data schemas
- `'response'` - Operation responses
- `'securityScheme'` - Security schemes
- `'server'` - Server definitions
- `'tag'` - API tags
- `'externalDocs'` - External documentation
- `'webhook'` - Webhook definitions
- `'definitions'` - Swagger 2.0 definitions
- `'securityDefinitions'` - Swagger 2.0 security definitions

### Standard OpenAPI Keys Reference

When positioning your extensions, you can reference these standard OpenAPI keys:

#### Top-Level Keys
- `openapi`, `swagger`, `info`, `externalDocs`, `servers`, `security`, `tags`, `paths`, `webhooks`, `components`

#### Info Section Keys
- `title`, `version`, `summary`, `description`, `termsOfService`, `contact`, `license`

#### Operation Keys
- `summary`, `operationId`, `description`, `externalDocs`, `tags`, `deprecated`, `security`, `servers`, `parameters`, `requestBody`, `responses`, `callbacks`

#### Schema Keys
- `$ref`, `title`, `description`, `type`, `format`, `enum`, `default`, `example`, `properties`, `required`, `items`, `allOf`, `anyOf`, `oneOf`, `not`

#### Parameter Keys
- `name`, `description`, `in`, `required`, `deprecated`, `schema`, `content`, `style`, `explode`, `allowReserved`, `example`

#### Response Keys
- `description`, `headers`, `content`, `links`

#### Security Scheme Keys
- `type`, `description`, `name`, `in`, `scheme`, `bearerFormat`, `flows`, `openIdConnectUrl`

#### Server Keys
- `url`, `description`, `variables`

#### Tag Keys
- `name`, `description`, `externalDocs`

#### External Docs Keys
- `description`, `url`

#### Webhook Keys
- `summary`, `operationId`, `description`, `deprecated`, `tags`, `security`, `servers`, `parameters`, `requestBody`, `responses`, `callbacks`

> 📖 **Complete Key Reference**: For a comprehensive reference of all keys, their ordering, and detailed reasoning, see [KEYS.md](./KEYS.md).

### Positioning Your Extensions

Use the helper functions to position your extensions:

- `before(key)` - Position before a standard OpenAPI key
- `after(key)` - Position after a standard OpenAPI key

#### Example: Positioning Extensions

```typescript
'operation': (before, after) => {
  return {
    // Position before standard keys
    'x-your-vendor-auth': before('security'),
    'x-your-vendor-rate-limit': before('parameters'),
    
    // Position after standard keys  
    'x-your-vendor-retries': after('parameters'),
    'x-your-vendor-timeout': after('responses'),
    
    // Position relative to other extensions
    'x-your-vendor-cache': after('x-your-vendor-retries'),
  };
}
```

### Extension Naming Convention

Follow these naming conventions for your extensions:

- Use your vendor prefix: `x-your-vendor-`
- Use descriptive names: `x-your-vendor-retries`, `x-your-vendor-timeout`
- Keep names consistent across contexts
- Use kebab-case for multi-word extensions

### Testing Your Extensions

1. **Build the project**: `bun run build`
2. **Run tests**: `bun test`
3. **Test with real OpenAPI files**: Create test files with your extensions
4. **Verify positioning**: Check that your extensions appear in the correct order

### Extension Collision Detection

The system automatically detects and warns about extension key collisions:

```
⚠️  Extension collision detected!
   Key: "x-common-extension" in context "operation"
   Already defined by: Vendor A
   Conflicting with: Vendor B
   Using position from: Vendor A (5)
   Ignoring position from: Vendor B (3)
```

### Advanced Type Safety

The vendor extension system provides comprehensive TypeScript support:

#### Type Definitions
```typescript
import { 
  type VendorExtensions, 
  type ContextExtensionFunction,
  type OpenAPIContext,
  type ExtensionKey 
} from "../index.js";

// Type-safe extension configuration
const extensions: VendorExtensions = {
  'top-level': (before, after) => {
    // before and after are type-safe for top-level keys
    return {
      'x-my-extension': before('info'),
      'x-my-config': after('paths')
    };
  }
};
```

#### Extension Key Validation
```typescript
import { isValidExtensionKey } from "../index.js";

// Validate extension keys follow OpenAPI conventions
const isValid = isValidExtensionKey('x-my-vendor-extension'); // ✅ true
const isInvalid = isValidExtensionKey('my-extension');       // ❌ false
```

#### Context-Specific Helpers
```typescript
import { createPositionHelpers } from "../index.js";

// Get type-safe helpers for a specific context
const operationHelpers = createPositionHelpers('operation');

// All functions are type-safe
operationHelpers.before('summary');     // ✅ Valid operation key
operationHelpers.after('responses');   // ✅ Valid operation key
operationHelpers.isValidKey('summary'); // ✅ true
operationHelpers.getAvailableKeys();    // Returns all valid operation keys
```

### Best Practices

1. **Use descriptive extension names** that clearly indicate their purpose
2. **Position extensions logically** relative to related standard keys
3. **Document your extensions** in your vendor documentation
4. **Test thoroughly** with real OpenAPI files
5. **Follow OpenAPI extension conventions** (x-vendor-name format)
6. **Consider extension conflicts** when choosing names
7. **Leverage IntelliSense** for type-safe key positioning
8. **Use helper functions** for additional validation and discovery

### Troubleshooting

#### Common Issues

**Extension not appearing in formatted output:**
- Check that your vendor is registered in `vendor-loader.ts`
- Verify your extension keys follow the `x-vendor-name` format
- Ensure your positioning functions return valid numbers

**Extensions in wrong order:**
- Use `before()` and `after()` helper functions for positioning
- Check that referenced standard keys exist in the context
- Verify your positioning logic is correct

**Extension collisions:**
- Use unique vendor prefixes to avoid conflicts
- Check the console for collision warnings
- Consider renaming conflicting extensions

**Build errors:**
- Ensure your TypeScript syntax is correct
- Check that all imports are properly resolved
- Verify your extension structure matches the expected format

#### Debug Tips

1. **Enable debug logging**: Set `DEBUG=prettier-plugin-openapi:*` environment variable
2. **Check console output**: Look for collision warnings and error messages
3. **Test with simple extensions**: Start with basic positioning before complex logic
4. **Verify context names**: Ensure you're using the correct context names from the supported list

### Example: Complete Vendor Extension

```typescript
/**
 * MyAPI Extensions
 * 
 * MyAPI platform extensions for OpenAPI formatting.
 * Website: https://myapi.com
 */

import { defineConfig } from "../index.js";

export const myapi = defineConfig({
  info: {
    name: 'MyAPI',
    website: 'https://myapi.com',
    support: 'support@myapi.com'
  },
  extensions: {
    'top-level': (before, after) => {
      return {
        'x-myapi-sdk': before('info'),
        'x-myapi-version': after('info'),
      };
    },
    'operation': (before, after) => {
      return {
        'x-myapi-rate-limit': before('parameters'),
        'x-myapi-retries': after('parameters'),
        'x-myapi-timeout': after('responses'),
      };
    },
    'schema': (before, after) => {
      return {
        'x-myapi-validation': after('type'),
        'x-myapi-example': after('example'),
      };
    }
  }
});
```

## Development

### Modern Development Stack

This project uses modern development tools for optimal performance and developer experience:

- **Bun** - Fast JavaScript runtime and package manager
- **TypeScript** - Type-safe development with strict settings
- **Biome** - Fast linting and formatting (replaces ESLint + Prettier for code)
- **Prettier** - Documentation and configuration file formatting
- **GitHub Actions** - Automated CI/CD with smart releases

### Quick Start

```bash
# Install dependencies
bun install

# Build the plugin
bun run build

# Run tests
bun test

# Run tests with coverage
bun test --coverage

# Lint code
bun run lint

# Fix linting issues
bun run lint:fix

# Format code
bun run format
```

### Available Scripts

- `bun run dev` - Start development mode with TypeScript watch
- `bun run build` - Build the project
- `bun run test` - Run all tests
- `bun run test:coverage` - Run tests with coverage report
- `bun run test:watch` - Run tests in watch mode
- `bun run lint` - Run Biome linting
- `bun run lint:fix` - Fix Biome linting issues automatically
- `bun run format` - Format code with Prettier
- `bun run format:check` - Check code formatting
- `bun run type-check` - Run TypeScript type checking
- `bun run validate` - Run all validation checks (type-check, lint, test)
- `bun run clean` - Clean build artifacts

### Project Structure

```
src/
  index.ts                    # Main plugin implementation
  keys.ts                     # OpenAPI key definitions
  extensions/
    index.ts                  # Extension system
    vendor-loader.ts          # Automatic vendor loading
    vendor/                   # Vendor extensions
      speakeasy.ts
      postman.ts
      redoc.ts
test/
  plugin.test.ts              # Core plugin tests
  integration.test.ts         # Integration tests
  build.test.ts              # Build validation tests
  coverage.test.ts            # Coverage enhancement tests
  file-detection.test.ts      # File detection tests
  key-ordering.test.ts        # Key sorting tests
  custom-extensions.test.ts  # Extension tests
  options.test.ts            # Configuration tests
  simple-ordering.test.ts     # Basic ordering tests
  vendor.test.ts             # Vendor extension tests
  setup.ts                    # Test utilities
```

### Test Suite

The project includes a comprehensive test suite with **142 tests** covering:

- **Core Functionality**: Plugin structure, parsing, formatting
- **Integration Tests**: Real OpenAPI file processing, error handling
- **Build Tests**: Package validation, TypeScript compilation
- **Coverage Tests**: Edge cases, error scenarios
- **File Detection**: OpenAPI file recognition, component files
- **Key Ordering**: OpenAPI key sorting, custom extensions
- **Vendor Extensions**: Extension system functionality
- **Options**: Configuration and formatting options

**Coverage**: 95.69% line coverage, 97.00% function coverage

### CI/CD Pipeline

The project includes automated CI/CD with GitHub Actions:

- **Continuous Integration**: Tests on Node.js 18, 20, 22 and Bun
- **Automated Testing**: Linting with Biome, type checking, security audits
- **Smart Releases**: Automatic patch version bumps on main branch updates
- **NPM Publishing**: Automated publishing with version management
- **Quality Gates**: All tests must pass before release

## Configuration Options

The plugin respects standard Prettier options:

- `tabWidth`: Number of spaces for indentation (default: 2)
- `printWidth`: Maximum line length (default: 80)
- `useTabs`: Use tabs instead of spaces (default: true)

## Advanced Features

### File Detection

The plugin intelligently detects OpenAPI files based on:

1. **Content Structure**: Files with OpenAPI-specific keys (`openapi`, `swagger`, `components`, etc.)
2. **Directory Patterns**: Files in OpenAPI-related directories (`components/`, `paths/`, `webhooks/`)
3. **File Extensions**: Standard OpenAPI file extensions

### Key Sorting Algorithm

The plugin uses a unified sorting algorithm that:

1. **Prioritizes Standard Keys**: OpenAPI specification keys are sorted first
2. **Handles Custom Extensions**: Vendor extensions are positioned relative to standard keys
3. **Sorts Unknown Keys**: Non-standard keys are sorted alphabetically at the end
4. **Context-Aware**: Different sorting rules for different OpenAPI contexts (operations, schemas, etc.)

### Performance Optimizations

- **Unified Sorting Function**: Single function handles all sorting scenarios
- **Lazy Loading**: Vendor extensions are loaded only when needed
- **Efficient Detection**: Fast file type detection with minimal overhead

## Quality & Reliability

### Comprehensive Testing

- **142 Test Cases**: Covering all major functionality
- **95.69% Line Coverage**: Extensive test coverage
- **97.00% Function Coverage**: Nearly complete function testing
- **Edge Case Testing**: Malformed files, error scenarios, performance
- **Integration Testing**: Real-world OpenAPI file processing

### Code Quality

- **TypeScript**: Full type safety and IntelliSense support
- **Biome**: Fast linting and formatting with TypeScript support
- **Prettier**: Consistent code formatting
- **Security Audits**: Automated dependency vulnerability scanning
- **Performance Testing**: Large file handling and memory usage

### CI/CD Pipeline

- **Automated Testing**: Runs on every commit and PR
- **Multi-Environment**: Tests on Node.js 18, 20, 22 and Bun
- **Quality Gates**: All tests must pass before merge
- **Smart Releases**: Automatic patch version management
- **NPM Publishing**: Automated package publishing with proper versioning

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes** with proper TypeScript types
4. **Add tests** for new functionality (aim for 90%+ coverage)
5. **Run the test suite**:
   ```bash
   bun test
   bun run lint
   bun run format
   ```
6. **Ensure all tests pass** (142 tests, 0 failures)
7. **Submit a pull request** with a clear description

### Development Guidelines

- **Code Quality**: All code must pass Biome and Prettier checks
- **Testing**: New features require comprehensive tests
- **TypeScript**: Use proper types and interfaces
- **Documentation**: Update README for new features
- **CI/CD**: All GitHub Actions must pass before merge

### Release Process

- **Automatic**: Patch releases happen automatically on main branch updates
- **Manual**: Major/minor releases require manual version bumps
- **Quality Gates**: All tests, linting, and security checks must pass
- **NPM Publishing**: Automated publishing with proper versioning

## License

MIT License - see LICENSE file for details.

## Related Projects

- [Prettier](https://prettier.io/) - The core formatter
- [OpenAPI Specification](https://spec.openapis.org/oas/v3.1.0.html) - The OpenAPI specification
- [Swagger](https://swagger.io/) - API development tools
