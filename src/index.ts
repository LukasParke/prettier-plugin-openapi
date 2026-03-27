import * as jsYaml from "js-yaml";
import { Document, Scalar, isScalar, visit } from "yaml";
import type {
  AstPath,
  Doc,
  Parser,
  ParserOptions,
  Printer,
  SupportLanguage,
  SupportOptions,
} from "prettier";
import { getVendorExtensions } from "./extensions/vendor-loader.js";

export type PrintFn = (path: AstPath) => Doc;

import {
  ComponentsKeys,
  ContactKeys,
  DiscriminatorKeys,
  EncodingKeys,
  ExampleKeys,
  ExternalDocsKeys,
  HeaderKeys,
  InfoKeys,
  LicenseKeys,
  LinkKeys,
  MediaTypeKeys,
  OAuthFlowKeys,
  OperationKeys,
  ParameterKeys,
  PathItemKeys,
  RequestBodyKeys,
  ResponseKeys,
  RootKeys,
  SchemaKeys,
  SecuritySchemeKeys,
  ServerKeys,
  ServerVariableKeys,
  TagKeys,
  WebhookKeys,
  XMLKeys,
} from "./keys.js";

// Type definitions for better type safety
interface OpenAPINode {
  isOpenAPI: boolean;
  content?: any;
  format?: "json" | "yaml";
}

/** Registered with Prettier so `.prettierrc` can set these without "unknown option" warnings. */
export const options: SupportOptions = {
  openApiFormatMarkdown: {
    type: "boolean",
    category: "OpenAPI",
    default: true,
    description: "Run Prettier's Markdown formatter on `description` and `summary` string fields.",
  },
  openApiSortKeys: {
    type: "boolean",
    category: "OpenAPI",
    default: true,
    description:
      "Reorder object keys to the plugin's canonical OpenAPI order (operations, components, etc.).",
  },
  openApiYamlSingleQuote: {
    type: "boolean",
    category: "OpenAPI",
    default: true,
    description:
      "In YAML output, prefer single quotes for scalars that must be quoted (numeric response keys like `'200':`, `x-` keys, etc.). Set false for double-quoted YAML. Does not use Prettier `singleQuote` (that option targets JavaScript and other languages).",
  },
  openApiYamlDoubleQuoteRefs: {
    type: "boolean",
    category: "OpenAPI",
    default: true,
    description:
      "In YAML output, always emit `$ref` string values as double-quoted scalars. When false, `$ref` follows `openApiYamlSingleQuote` like other strings.",
  },
};

// Load vendor extensions
const vendorExtensions = getVendorExtensions();

/**
 * Unified parser that can handle both JSON and YAML OpenAPI files
 */
function parseOpenAPIFile(text: string, options?: any): OpenAPINode {
  let format: "json" | "yaml" | undefined;

  if (options?.filepath) {
    switch (true) {
      case options?.filepath.endsWith(".yaml") || options?.filepath.endsWith(".yml"):
        format = "yaml";
        break;
      case options?.filepath.endsWith(".json"):
        format = "json";
        break;
    }
  }

  if (!format) {
    // Try to detect format from content
    const trimmedText = text.trim();
    if (trimmedText.startsWith("{") || trimmedText.startsWith("[")) {
      format = "json";
    } else {
      format = "yaml";
    }
  }

  let parsed: any;

  try {
    switch (format) {
      case "yaml":
        parsed = jsYaml.load(text, {
          schema: jsYaml.DEFAULT_SCHEMA,
        });
        break;
      case "json":
        parsed = JSON.parse(text);
        break;
    }
  } catch (error) {
    return {
      isOpenAPI: false,
    };
  }

  let isOpenAPI: boolean;

  try {
    isOpenAPI = isOpenAPIFile(parsed, options?.filepath);
  } catch (error) {
    return {
      isOpenAPI: false,
    };
  }

  switch (isOpenAPI) {
    case true:
      return {
        isOpenAPI: true,
        content: parsed,
        format: format,
      };
    case false:
      return {
        isOpenAPI: false,
      };
  }
}

// ============================================================================
// FILE DETECTION FUNCTIONS
// ============================================================================

/**
 * Detects if a file is an OpenAPI-related file based on content and structure
 */
function isOpenAPIFile(content: any, filePath?: string): boolean {
  if (!content || typeof content !== "object") {
    return false;
  }

  // Check for root-level OpenAPI indicators (most important)
  if (content.openapi || content.swagger) {
    return true;
  }

  // Check file path patterns for common OpenAPI file structures
  // Only accept files in OpenAPI-related directories, but validate content first
  if (filePath) {
    const path = filePath.toLowerCase();

    // Check for component directory patterns
    if (
      path.includes("/components/") ||
      path.includes("/schemas/") ||
      path.includes("/parameters/") ||
      path.includes("/responses/") ||
      path.includes("/requestbodies/") ||
      path.includes("/headers/") ||
      path.includes("/examples/") ||
      path.includes("/securityschemes/") ||
      path.includes("/links/") ||
      path.includes("/callbacks/") ||
      path.includes("/webhooks/") ||
      path.includes("/paths/")
    ) {
      // Fast-path: if filepath matches, still validate content to prevent
      // generic JSON from being misclassified as OpenAPI
      const keys = Object.keys(content);
      const hasOnlyGenericProperties = keys.every(
        (key) =>
          !key.startsWith("x-") && // Not a custom extension
          ![
            "openapi",
            "swagger",
            "info",
            "paths",
            "components",
            "definitions",
            "parameters",
            "responses",
            "securityDefinitions",
            "tags",
            "servers",
            "webhooks",
          ].includes(key)
      );

      // Only accept if content doesn't have only generic properties
      if (!hasOnlyGenericProperties) {
        return true;
      }
      // If it has only generic properties, fall through to continue validation
    }
  }

  // Check for component-like structures (only if we have strong indicators)
  if (
    content.components ||
    content.definitions ||
    content.parameters ||
    content.responses ||
    content.securityDefinitions
  ) {
    return true;
  }

  // Check for path-like structures (operations)
  if (content.paths || isPathObject(content)) {
    return true;
  }

  // Check for schema-like structures (but be more strict)
  // Only accept if we have strong schema indicators
  if (
    isSchemaObject(content) &&
    (content.$ref ||
      content.allOf ||
      content.oneOf ||
      content.anyOf ||
      content.not ||
      content.properties ||
      content.items)
  ) {
    return true;
  }

  // Check for parameter-like structures
  if (isParameterObject(content)) {
    return true;
  }

  // Check for response-like structures
  if (isResponseObject(content)) {
    return true;
  }

  // Check for header-like structures (OpenAPI 3.0+)
  if (isHeaderObject(content)) {
    return true;
  }

  // Check for link-like structures (OpenAPI 3.0+)
  if (isLinkObject(content)) {
    return true;
  }

  // Check for request body-like structures (OpenAPI 3.0+)
  if (isRequestBodyObject(content)) {
    return true;
  }

  // Check for security scheme-like structures
  if (isSecuritySchemeObject(content)) {
    return true;
  }

  // Check for server-like structures
  if (isServerObject(content)) {
    return true;
  }

  // Check for tag-like structures
  if (isTagObject(content)) {
    return true;
  }

  // Check for external docs-like structures
  if (isExternalDocsObject(content)) {
    return true;
  }

  // Check for webhook-like structures
  if (isWebhookObject(content)) {
    return true;
  }

  // Additional strict check: reject objects that look like generic data
  // If an object only has simple properties like name, age, etc. without any OpenAPI structure, reject it
  const keys = Object.keys(content);
  const hasOnlyGenericProperties = keys.every(
    (key) =>
      !key.startsWith("x-") && // Not a custom extension
      ![
        "openapi",
        "swagger",
        "info",
        "paths",
        "components",
        "definitions",
        "parameters",
        "responses",
        "securityDefinitions",
        "tags",
        "servers",
        "webhooks",
      ].includes(key)
  );

  if (hasOnlyGenericProperties) {
    return false;
  }

  // If none of the above conditions are met, it's not an OpenAPI file
  return false;
}

/**
 * Detects if an object represents a path with operations
 */
function isPathObject(obj: any): boolean {
  if (!obj || typeof obj !== "object") {
    return false;
  }

  const httpMethods = ["get", "post", "put", "patch", "delete", "head", "options", "trace"];
  return Object.keys(obj).some((key) => httpMethods.includes(key.toLowerCase()));
}

export const languages: SupportLanguage[] = [
  {
    name: "openapi",
    extensions: [
      // Accepting all JSON and YAML files so that component files used by $ref work
      ".json",
      ".yaml",
      ".yml",
    ],
    parsers: ["openapi-parser"],
  },
] as const;

export const parsers: Record<string, Parser> = {
  "openapi-parser": {
    parse: (text: string, options?: any): OpenAPINode => {
      return parseOpenAPIFile(text, options);
    },
    astFormat: "openapi-ast",
    locStart: (node: OpenAPINode) => 0,
    locEnd: (node: OpenAPINode) => node.content?.length || 0,
  },
};

export const printers: Record<string, Printer> = {
  "openapi-ast": {
    print: (path: AstPath, options: ParserOptions, print: PrintFn): string => {
      const node = path.getNode();
      if (!node.isOpenAPI || node.isOpenAPI === false) {
        // Return original text unchanged
        return options.originalText;
      }
      return formatOpenAPI(node.content, node.format, options);
    },
  },
};

/**
 * Formats markdown strings using Prettier's markdown parser and printer
 *
 * This uses Prettier's actual markdown formatting implementation, ensuring
 * that markdown in OpenAPI descriptions is formatted exactly as Prettier would format it.
 */
function formatMarkdownSync(markdown: string, options?: ParserOptions): string {
  if (!markdown || typeof markdown !== "string") {
    return markdown;
  }

  if (options?.openApiFormatMarkdown === false) {
    return markdown;
  }

  // Trim to avoid formatting whitespace-only strings
  const trimmed = markdown.trim();
  if (trimmed.length === 0) {
    return markdown;
  }

  try {
    // Use Prettier's markdown formatter
    // Dynamic require to avoid issues during build
    const formatModule = require("./prettier-markdown/format-markdown.js");
    const formatted = formatModule.formatMarkdown(trimmed, {
      printWidth: options?.printWidth ?? 80,
      tabWidth: options?.tabWidth ?? 2,
      proseWrap: "preserve",
      singleQuote: options?.singleQuote ?? false,
    });

    return formatted;
  } catch (error) {
    // If Prettier's formatter fails, fall back to basic normalization
    // This ensures we always return valid markdown
    return trimmed;
  }
}

/**
 * Recursively formats all description and summary fields that may contain markdown
 */
function formatMarkdownFields(obj: any, options?: ParserOptions): any {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  if (obj instanceof Date) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => formatMarkdownFields(item, options));
  }

  const formatted: any = {};

  for (const [key, value] of Object.entries(obj)) {
    // Fields that commonly contain markdown in OpenAPI
    const markdownFields = ["description", "summary"];

    if (markdownFields.includes(key) && typeof value === "string" && value.trim().length > 0) {
      // Format markdown synchronously
      formatted[key] = formatMarkdownSync(value, options);
    } else if (typeof value === "object" && value !== null) {
      // Recursively process nested objects
      formatted[key] = formatMarkdownFields(value, options);
    } else {
      // Keep other values as-is
      formatted[key] = value;
    }
  }

  return formatted;
}

/**
 * Stringify OpenAPI as YAML. General quoted scalars follow `yamlSingleQuote` (see
 * `openApiYamlSingleQuote`); `$ref` values can be forced double-quoted (see `openApiYamlDoubleQuoteRefs`).
 */
function dumpOpenApiYaml(
  content: unknown,
  tabWidth: number,
  yamlSingleQuote: boolean,
  doubleQuoteRefs: boolean,
): string {
  const doc = new Document(content, { aliasDuplicateObjects: false });

  visit(doc, {
    Scalar(_, node) {
      // Force ISO-8601 timestamp strings to be double-quoted so YAML parsers
      // don't re-interpret them as native Date objects.
      if (typeof node.value === "string" && /^\d{4}-\d{2}-\d{2}[T ]/.test(node.value)) {
        node.type = Scalar.QUOTE_DOUBLE;
      }
    },
    Pair(_, pair) {
      if (!doubleQuoteRefs) return;
      const keyNode = pair.key;
      if (!isScalar(keyNode) || keyNode.value !== "$ref") return;
      const valNode = pair.value;
      if (isScalar(valNode) && typeof valNode.value === "string") {
        valNode.type = Scalar.QUOTE_DOUBLE;
      }
    },
  });
  return doc.toString({
    indent: tabWidth,
    lineWidth: 0,
    singleQuote: !!yamlSingleQuote,
  });
}

/**
 * Unified formatter that outputs in the detected format
 */
function formatOpenAPI(content: any, format: "json" | "yaml", options?: ParserOptions): string {
  const sortedContent =
    options?.openApiSortKeys === false ? content : sortOpenAPIKeys(content);

  const contentWithFormattedMarkdown = formatMarkdownFields(sortedContent, options);

  switch (format) {
    case "json":
      return JSON.stringify(contentWithFormattedMarkdown, null, options?.tabWidth ?? 2);
    case "yaml":
      return dumpOpenApiYaml(
        contentWithFormattedMarkdown,
        options?.tabWidth ?? 2,
        options?.openApiYamlSingleQuote !== false,
        options?.openApiYamlDoubleQuoteRefs !== false,
      );
  }
}

/**
 * True when `path` is at or under an OpenAPI `example` or `examples` node.
 * Payloads there are arbitrary JSON/YAML; we keep author key order (no canonical sort).
 */
function isPreservedExampleSubtreePath(path: string): boolean {
  if (!path) return false;
  return /(^|\.)(example|examples)(\[|\.|$)/.test(path);
}

function sortOpenAPIKeys(obj: any): any {
  // Special handling: if root object is a referenced OpenAPI object (for referenced files)
  // Check for ref-able object types before checking for root-level keys
  let contextKey = "top-level";

  // Skip detection if it's a full OpenAPI spec (has openapi/swagger)
  if (!("openapi" in obj) && !("swagger" in obj)) {
    // Check for all ref-able object types in priority order
    // Check more specific types first to avoid false positives
    if (isLinkObject(obj)) {
      contextKey = "link";
    } else if (isOperationObject(obj)) {
      contextKey = "operation";
    } else if (isSchemaObject(obj)) {
      contextKey = "schema";
    } else if (isParameterObject(obj)) {
      contextKey = "parameter";
    } else if (isResponseObject(obj)) {
      contextKey = "response";
    } else if (isHeaderObject(obj)) {
      contextKey = "header";
    } else if (isPathItemObject(obj)) {
      contextKey = "pathItem";
    } else if (isRequestBodyObject(obj)) {
      contextKey = "requestBody";
    } else {
      // Fall back to standard context detection
      contextKey = getContextKey("", obj);
    }
  } else {
    // Determine what class of OpenAPI schema this is for full specs
    contextKey = getContextKey("", obj);
  }

  const standardKeys = getStandardKeysForContext(contextKey);
  const customExtensions = vendorExtensions[contextKey] || {};

  const sortedKeys = Object.keys(obj).sort((a, b) => {
    // Use the unified sorting function
    return sortKeys(a, b, standardKeys, customExtensions);
  });

  const sortedObj: any = {};
  for (const key of sortedKeys) {
    sortedObj[key] = sortOpenAPIKeysEnhanced(obj[key], key);
  }

  return sortedObj;
}

// Enhanced sorting for nested OpenAPI structures
function sortOpenAPIKeysEnhanced(obj: any, path: string = ""): any {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  if (obj instanceof Date) {
    return obj;
  }

  // Handle arrays by recursively sorting each element
  if (Array.isArray(obj)) {
    const sortedObjs = [];

    for (let i = 0; i < obj.length; i++) {
      const elPath = `${path}[${i}]`;
      sortedObjs.push(sortOpenAPIKeysEnhanced(obj[i], elPath));
    }

    if (path === "tags") {
      return sortedObjs.sort((a, b) => sortTags(a, b));
    }

    // Sort parameter arrays so $ref items come first
    // Check if this array is a parameters array (path ends with '.parameters' or is 'parameters')
    if (path.endsWith(".parameters") || path === "parameters") {
      return sortedObjs.sort((a, b) => {
        const aHasRef = a && typeof a === "object" && "$ref" in a;
        const bHasRef = b && typeof b === "object" && "$ref" in b;

        if (aHasRef && !bHasRef) return -1; // $ref comes first
        if (!aHasRef && bHasRef) return 1; // $ref comes first
        return 0; // Keep original order for items of same type
      });
    }

    return sortedObjs;
  }

  if (isPreservedExampleSubtreePath(path)) {
    const preserved: any = {};
    for (const key of Object.keys(obj)) {
      const newPath = path ? `${path}.${key}` : key;
      preserved[key] = sortOpenAPIKeysEnhanced(obj[key], newPath);
    }
    return preserved;
  }

  const contextKey = getContextKey(path, obj);
  const standardKeys = getStandardKeysForContext(contextKey);
  const customExtensions = vendorExtensions[contextKey] || {};

  const sortedKeys = Object.keys(obj).sort((a, b) => {
    switch (path) {
      case "paths":
        return sortPathKeys(a, b);
      case "responses":
        return sortResponseCodes(a, b);
      default:
        return sortKeys(a, b, standardKeys, customExtensions);
    }
  });

  const sortedObj: any = {};
  for (const key of sortedKeys) {
    const newPath = path ? `${path}.${key}` : key;
    sortedObj[key] = sortOpenAPIKeysEnhanced(obj[key], newPath);
  }

  return sortedObj;
}

function sortPathKeys(a: string, b: string): number {
  // Sort paths by specificity (more specific paths first)
  const aSpecificity = (a.match(/\{/g) || []).length;
  const bSpecificity = (b.match(/\{/g) || []).length;

  if (aSpecificity !== bSpecificity) {
    return aSpecificity - bSpecificity;
  }

  return a.localeCompare(b);
}

type Tag = {
  name: string;
};

function sortTags(a: Tag, b: Tag): number {
  // Sort tags by name
  return a.name.localeCompare(b.name);
}

function sortResponseCodes(a: string, b: string): number {
  // Sort response codes numerically
  const aNum = parseInt(a, 10);
  const bNum = parseInt(b, 10);

  if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
    return aNum - bNum;
  }

  return a.localeCompare(b);
}

//#region Object type detection functions

function isOperationObject(obj: any): boolean {
  if (!obj || typeof obj !== "object") {
    return false;
  }

  // An operation object must have strong operation indicators
  // HTTP methods indicate a path item, not an operation
  // Strong indicators: operationId or responses (required fields in operations)
  // Secondary indicators: requestBody, callbacks (operation-specific)
  if ("operationId" in obj || "responses" in obj) {
    return true;
  }

  // If it has both requestBody or callbacks (operation-specific) AND other operation keys
  if (
    ("requestBody" in obj || "callbacks" in obj) &&
    ("parameters" in obj || "security" in obj || "servers" in obj)
  ) {
    return true;
  }

  return false;
}

function isParameterObject(obj: any): boolean {
  return obj && typeof obj === "object" && "name" in obj && "in" in obj;
}

function isSchemaObject(obj: any): boolean {
  if (!obj || typeof obj !== "object") {
    return false;
  }

  // Check for JSON Schema keywords - be very strict
  const hasSchemaKeywords =
    "$ref" in obj || "allOf" in obj || "oneOf" in obj || "anyOf" in obj || "not" in obj;
  const hasValidType =
    "type" in obj &&
    obj.type &&
    ["object", "array", "string", "number", "integer", "boolean", "null"].includes(obj.type);

  // Only return true if we have clear schema indicators
  // Must have either schema keywords OR valid type with schema properties
  // Also require additional schema-specific properties to be more strict
  return (
    hasSchemaKeywords ||
    (hasValidType &&
      ("properties" in obj ||
        "items" in obj ||
        "enum" in obj ||
        "format" in obj ||
        "pattern" in obj))
  );
}

function isResponseObject(obj: any): boolean {
  return obj && typeof obj === "object" && ("description" in obj || "content" in obj);
}

function isSecuritySchemeObject(obj: any): boolean {
  return (
    obj &&
    typeof obj === "object" &&
    "type" in obj &&
    ["apiKey", "http", "oauth2", "openIdConnect"].includes(obj.type)
  );
}

function isServerObject(obj: any): boolean {
  return obj && typeof obj === "object" && "url" in obj;
}

function isTagObject(obj: any): boolean {
  return (
    obj &&
    typeof obj === "object" &&
    "name" in obj &&
    typeof obj.name === "string" &&
    (Object.keys(obj).length === 1 || // Only name
      "description" in obj || // name + description
      "externalDocs" in obj)
  ); // name + externalDocs
}

function isExternalDocsObject(obj: any): boolean {
  return obj && typeof obj === "object" && "url" in obj;
}

function isWebhookObject(obj: any): boolean {
  const httpMethods = ["get", "post", "put", "patch", "delete", "head", "options", "trace"];
  return (
    obj &&
    typeof obj === "object" &&
    Object.keys(obj).some((key) => httpMethods.includes(key.toLowerCase()))
  );
}

function isPathItemObject(obj: any): boolean {
  const httpMethods = ["get", "post", "put", "patch", "delete", "head", "options", "trace"];
  return (
    obj &&
    typeof obj === "object" &&
    Object.keys(obj).some((key) => httpMethods.includes(key.toLowerCase()))
  );
}

function isRequestBodyObject(obj: any): boolean {
  if (!obj || typeof obj !== "object") return false;
  // OpenAPI Response uses headers/links; RequestBody does not.
  if ("headers" in obj || "links" in obj) return false;
  // Request Body Object is the only common parent of `content` + boolean `required` (OAS 3).
  if (typeof obj.required === "boolean") return true;
  if ("$ref" in obj) return true;
  if ("content" in obj) return true;
  return false;
}

function isMediaTypeObject(obj: any): boolean {
  return (
    obj && typeof obj === "object" && ("schema" in obj || "example" in obj || "examples" in obj)
  );
}

function isEncodingObject(obj: any): boolean {
  return (
    obj && typeof obj === "object" && ("contentType" in obj || "style" in obj || "explode" in obj)
  );
}

function isHeaderObject(obj: any): boolean {
  return (
    obj && typeof obj === "object" && ("description" in obj || "schema" in obj || "required" in obj)
  );
}

function isLinkObject(obj: any): boolean {
  if (!obj || typeof obj !== "object") {
    return false;
  }
  // Link objects have operationRef OR operationId, but NOT responses (which indicates an operation)
  return "operationRef" in obj || ("operationId" in obj && !("responses" in obj));
}

function isExampleObject(obj: any): boolean {
  return (
    obj && typeof obj === "object" && ("summary" in obj || "value" in obj || "externalValue" in obj)
  );
}

function isDiscriminatorObject(obj: any): boolean {
  return obj && typeof obj === "object" && "propertyName" in obj;
}

function isXMLObject(obj: any): boolean {
  return (
    obj && typeof obj === "object" && ("name" in obj || "namespace" in obj || "attribute" in obj)
  );
}

function isContactObject(obj: any): boolean {
  return obj && typeof obj === "object" && ("name" in obj || "url" in obj || "email" in obj);
}

function isLicenseObject(obj: any): boolean {
  return obj && typeof obj === "object" && ("name" in obj || "identifier" in obj || "url" in obj);
}

function isOAuthFlowObject(obj: any): boolean {
  return (
    obj &&
    typeof obj === "object" &&
    ("authorizationUrl" in obj || "tokenUrl" in obj || "scopes" in obj)
  );
}

function isServerVariableObject(obj: any): boolean {
  return obj && typeof obj === "object" && ("enum" in obj || "default" in obj);
}

//#endregion

//#region Unified sorting function
/**
 * Universal sorting function that handles all OpenAPI key sorting
 * @param a First key to compare
 * @param b Second key to compare
 * @param standardKeys Array of standard keys in order
 * @param customExtensions Custom extension positions
 * @returns Comparison result
 */
function sortKeys(
  a: string,
  b: string,
  standardKeys: readonly string[],
  customExtensions: Record<string, number> = {}
): number {
  const aCustomPos = customExtensions[a];
  const bCustomPos = customExtensions[b];

  // Get standard key positions
  const aStandardIndex = standardKeys.indexOf(a);
  const bStandardIndex = standardKeys.indexOf(b);

  // Both are custom extensions
  if (aCustomPos !== undefined && bCustomPos !== undefined) {
    return aCustomPos - bCustomPos;
  }

  // Both are standard keys
  if (aStandardIndex !== -1 && bStandardIndex !== -1) {
    return aStandardIndex - bStandardIndex;
  }

  // One is custom, one is standard
  if (aCustomPos !== undefined && bStandardIndex !== -1) {
    // Custom key should be positioned relative to standard keys
    if (aCustomPos < bStandardIndex) {
      return -1; // Custom key comes before this standard key
    } else if (aCustomPos > bStandardIndex) {
      return 1; // Custom key comes after this standard key
    } else {
      return -1; // Custom key comes before standard key at same position
    }
  }

  if (bCustomPos !== undefined && aStandardIndex !== -1) {
    // Custom key should be positioned relative to standard keys
    if (bCustomPos < aStandardIndex) {
      return 1; // Custom key comes before this standard key
    } else if (bCustomPos > aStandardIndex) {
      return -1; // Custom key comes after this standard key
    } else {
      return 1; // Standard key comes after custom key at same position
    }
  }

  // One is standard, one is unknown
  if (aStandardIndex !== -1) return -1; // Standard key comes first
  if (bStandardIndex !== -1) return 1; // Standard key comes first

  // One is custom, one is unknown
  if (aCustomPos !== undefined) return -1; // Custom key comes before unknown
  if (bCustomPos !== undefined) return 1; // Custom key comes before unknown

  // Both are unknown - sort alphabetically
  return a.localeCompare(b);
}
//#endregion

//#region Helper functions for custom extensions

function getContextKey(path: string, obj: any): string {
  // Determine the context based on path and object properties
  if (path === "info") return "info";
  if (path === "components") return "components";
  if (path === "servers" || path.startsWith("servers[")) return "server";
  if (path === "tags" || path.startsWith("tags[")) return "tag";
  if (path === "externalDocs") return "externalDocs";
  if (path === "webhooks") return "webhook";
  if (path === "definitions") return "definitions";
  if (path === "securityDefinitions") return "securityDefinitions";

  // Check if this is a path operation (e.g., "paths./users.get")
  if (path.includes(".") && path.split(".").length >= 3) {
    const pathParts = path.split(".");
    const lastPart = pathParts[pathParts.length - 1];
    const httpMethods = ["get", "post", "put", "patch", "delete", "head", "options", "trace"];
    if (httpMethods.includes(lastPart.toLowerCase())) {
      return "operation";
    }
  }

  // Handle nested paths for components
  if (path.startsWith("components.")) {
    if (path.includes("schemas.")) return "schema";
    if (path.includes("parameters.")) return "parameter";
    if (path.includes("responses.")) return "response";
    if (path.includes("securitySchemes.")) return "securityScheme";
    if (path.includes("requestBodies.")) return "requestBody";
    if (path.includes("headers.")) return "header";
    if (path.includes("examples.")) return "example";
    if (path.includes("links.")) return "link";
    if (path.includes("callbacks.")) return "callback";
    if (path.includes("pathItems.")) return "pathItem";
  }

  // Handle nested paths for Swagger 2.0
  if (path.startsWith("definitions.")) return "definitions";
  if (path.startsWith("securityDefinitions.")) return "securityDefinitions";

  // Handle nested paths for operations (parameters, responses, etc.)
  if (path.includes(".parameters.") && path.split(".").length > 3) return "parameter";
  // JSON Schema under responses/requestBody/etc. — before `.responses.` or every `...responses...` path matches "response"
  // and `type` / `items` sort as unknown keys (items before type).
  if (path.endsWith(".schema") || path.includes(".schema.")) return "schema";
  if (path.includes(".responses.") && path.split(".").length > 3) return "response";
  if (path.includes(".requestBody.")) return "requestBody";
  // Inline operation request body value: paths.*.(get|post|...).requestBody (not followed by .content)
  if (path.endsWith(".requestBody")) return "requestBody";
  if (path.includes(".headers.")) return "header";
  if (path.includes(".examples.")) return "example";
  if (path.includes(".links.")) return "link";
  if (path.includes(".content.")) return "mediaType";
  if (path.includes(".encoding.")) return "encoding";
  if (path.includes(".discriminator.")) return "discriminator";
  if (path.includes(".xml.")) return "xml";
  if (path.includes(".contact.")) return "contact";
  if (path.includes(".license.")) return "license";
  if (path.includes(".flows.")) return "oauthFlow";
  if (path.includes(".variables.")) return "serverVariable";

  // Check object types as fallback
  // Only check for operation if path is not empty (not at root level)
  // Root-level objects should not be detected as operations unless they're truly operations
  // (handled separately in sortOpenAPIKeys for referenced operation files)
  if (path && isOperationObject(obj)) return "operation";
  if (isParameterObject(obj)) return "parameter";
  if (isSchemaObject(obj)) return "schema";
  if (isRequestBodyObject(obj)) return "requestBody";
  if (isResponseObject(obj)) return "response";
  if (isSecuritySchemeObject(obj)) return "securityScheme";
  if (isServerObject(obj)) return "server";
  if (isTagObject(obj)) return "tag";
  if (isExternalDocsObject(obj)) return "externalDocs";
  if (isWebhookObject(obj)) return "webhook";
  if (isPathItemObject(obj)) return "pathItem";
  if (isMediaTypeObject(obj)) return "mediaType";
  if (isEncodingObject(obj)) return "encoding";
  if (isHeaderObject(obj)) return "header";
  if (isLinkObject(obj)) return "link";
  if (isExampleObject(obj)) return "example";
  if (isDiscriminatorObject(obj)) return "discriminator";
  if (isXMLObject(obj)) return "xml";
  if (isContactObject(obj)) return "contact";
  if (isLicenseObject(obj)) return "license";
  if (isOAuthFlowObject(obj)) return "oauthFlow";
  if (isServerVariableObject(obj)) return "serverVariable";

  return "top-level";
}

function getStandardKeysForContext(contextKey: string): readonly string[] {
  switch (contextKey) {
    case "info":
      return InfoKeys;
    case "components":
      return ComponentsKeys;
    case "operation":
      return OperationKeys;
    case "parameter":
      return ParameterKeys;
    case "schema":
      return SchemaKeys;
    case "response":
      return ResponseKeys;
    case "securityScheme":
      return SecuritySchemeKeys;
    case "server":
      return ServerKeys;
    case "tag":
      return TagKeys;
    case "externalDocs":
      return ExternalDocsKeys;
    case "webhook":
      return WebhookKeys;
    case "pathItem":
      return PathItemKeys;
    case "requestBody":
      return RequestBodyKeys;
    case "mediaType":
      return MediaTypeKeys;
    case "encoding":
      return EncodingKeys;
    case "header":
      return HeaderKeys;
    case "link":
      return LinkKeys;
    case "example":
      return ExampleKeys;
    case "discriminator":
      return DiscriminatorKeys;
    case "xml":
      return XMLKeys;
    case "contact":
      return ContactKeys;
    case "license":
      return LicenseKeys;
    case "oauthFlow":
      return OAuthFlowKeys;
    case "serverVariable":
      return ServerVariableKeys;
    case "definitions":
      return SchemaKeys; // Definitions use schema keys
    case "securityDefinitions":
      return SecuritySchemeKeys; // Security definitions use security scheme keys
    default:
      return RootKeys;
  }
}
