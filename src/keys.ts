/**
 * OpenAPI Key Arrays
 * 
 * Centralized key ordering arrays for OpenAPI specifications.
 * Supports Swagger 2.0, OpenAPI 3.0, 3.1, and 3.2
 */

export const RootKeys = [
    // Version identifiers
    'swagger',           // Swagger 2.0
    'openapi',           // OpenAPI 3.0+

    // Schema identifier
    'jsonSchemaDialect', // OpenAPI 3.1+

    'info',
    'externalDocs',

    // Common sense grouping for a server definition
    'schemes',           // Swagger 2.0
    'host',              // Swagger 2.0
    'basePath',          // Swagger 2.0

    // Typically short arrays, grouped together higher up
    'consumes',          // Swagger 2.0
    'produces',          // Swagger 2.0

    // Servers is usually really short, and can be helpful to see at the top for quick reference
    'servers',           // OpenAPI 3.0+ (replaces host, basePath, schemes in 2.0)

    // Security is tiny, keep it at the top.
    'security',

    // Tags are often fairly long, but given that its a fairly core organizational feature, it's helpful to see at the top for quick reference
    'tags',

    // Paths are usually the longest block, unless components are used heavily, in which case it can be fairly short.
    'paths',

    // Webhooks are very often a short list, if its included at all, but depending on API structure and usage it can be quite long, having it below paths but above components seems like good placement..
    'webhooks',          // OpenAPI 3.1+

    // Components is usually the longest block when it's heavily used, due to it having sections for reuse in most all other sections.
    'components',        // OpenAPI 3.0+ (replaces definitions, parameters, responses, securityDefinitions in 2.0)

    'definitions',       // Swagger 2.0
    'parameters',        // Swagger 2.0
    'responses',         // Swagger 2.0
    'securityDefinitions', // Swagger 2.0
] as const;

export const InfoKeys = [
    // Title is just a name, usually a single short line.
    'title',

    // Version is a usually a tiny string, and should be at the top.
    'version',

    // Summary to me has always been a shorter description, seems appropriate to have it above description.
    'summary',            // OpenAPI 3.1+

    // Description is usually longer if its included alongside a summary. 
    // I have seen everything from a single line to a veriatable novel.
    'description',

    // Terms of Service is usually a single line, and should be at the top.
    'termsOfService',

    // Contact and license are multi-line objects when included, so they should be at the bottom.
    'contact',
    'license',
] as const;

// This key order should not require explaination.
// If it does let me know and I'll block you.
export const ContactKeys = [
    'name',
    'email',
    'url',
] as const;

export const LicenseKeys = [
    'name',
    'identifier',
    'url',
] as const;

// A sane ordering for components.
export const ComponentsKeys = [
    // Security is almost alwasy present, and very short, put it at the top.
    'securitySchemes',

    // I have never actually seen path items included in a specification.
    // That being said, I think the general philosophy of larger items at the top,
    // with smaller more atomic items used to make up the larger items at the bottom, makes sense.
    'pathItems',          // OpenAPI 3.1+

    // Parameters can be larger, especially in larger APIs with extremely consistent usage patterns, but almost always shorter than schemas.
    'parameters',

    // Headers are basically just more parameters.
    'headers',

    // Request bodies are almost never used, I believe this is because the request bodies are usually so different from endpoint to endpoint.
    // However, if they are used, Specifying them at this level seems reasonable.
    'requestBodies',

    // Responses are usually a smaller list, and often only used for global error responses.
    'responses',

    // Callbacks are essentially another kind of response.
    'callbacks',

    // Links are programatic ways to link endpoints together.
    'links',

    // Schemas are frequently the largest block, and are the building blocks that make up most every other section.
    'schemas',

    // Examples are fairly free form, and logically would be used in schemas, so it make sense to be at the bottom.
    'examples',
] as const;

export const OperationKeys = [
    // Important short info at a glance.
    'operationId',
    'summary',
    'tags',
    'deprecated',
    'description',
    'externalDocs',      // OpenAPI 3.0+

    // Security is a often short list, and is usually not included at the operation level.
    'security',

    // Servers is a often short list, and is usually not included at the operation level.
    'servers',            // OpenAPI 3.0+

    'consumes',           // Swagger 2.0
    'produces',           // Swagger 2.0

    // Parameters are ideally added first via $ref, for situations like pagination, and then single endpoint specific parameters inline after.
    'parameters',

    // Request body is going to be shorter that responses, unless the responses are all `$ref`s
    'requestBody',        // OpenAPI 3.0+

    // Responses come after the request because obviously.
    'responses',

    // Callbacks are essentially another kind of response.
    'callbacks',          // OpenAPI 3.0+

    // Schemes should never have been included at this level, its just silly, but if they are, put them at the bottom.
    'schemes',            // Swagger 2.0
] as const;

export const ParameterKeys = [
    // $ref should always be at the top, because when its included there are at most 2 other keys that are present.
    '$ref',

    // Important short info at a glance.
    'name',
    'description',
    'in',
    'required',
    'deprecated',

    // Semantic formatting options for parameters.
    'allowEmptyValue',
    'style',
    'explode',
    'allowReserved',

    // Schema is the core of the parameter, and specifies what the parameter actually is.
    'schema',

    // Content is similar to schema, and is typically only used for more complex parameters.
    'content',            // OpenAPI 3.0+

    // Type and format are the most common schema keys, and should be always be paired together.
    'type',               // Swagger 2.0
    'format',             // Swagger 2.0

    // When type is array, items should be present.
    // collectionFormat is the array equivalent of format.
    'items',              // Swagger 2.0
    'collectionFormat',   // Swagger 2.0

    // Default is the default value of the parameter when that parameter is not specified.
    'default',            // Swagger 2.0

    // Numeric parameter constraints grouped together
    // Min before max, multipleOf in the middle, since its essentially steps between.
    'minimum',            // Swagger 2.0
    'exclusiveMinimum',   // Swagger 2.0
    'multipleOf',         // Swagger 2.0
    'maximum',            // Swagger 2.0
    'exclusiveMaximum',   // Swagger 2.0

    // String parameter constraints
    'pattern',            // Swagger 2.0
    'minLength',          // Swagger 2.0
    'maxLength',          // Swagger 2.0

    // Array parameter constraints
    'minItems',           // Swagger 2.0
    'maxItems',           // Swagger 2.0
    'uniqueItems',        // Swagger 2.0

    // Enum is a strict list of allowed values for the parameter.
    'enum',               // Swagger 2.0

    // Example and examples are perfect directly below the schema.
    'example',
    'examples',
] as const;

export const SchemaKeys = [

    // $ref should always be at the top, because when its included there are at most 2 other keys that are present.
    '$ref',               // JSON Schema draft

    // When $id is included it's used as a kind of name, or an id if you will, and should be at the top.
    '$id',                // JSON Schema draft

    // These JSON Schema draft keys are rarely used in my experience.
    // They seem to all be extremely short, so are fine to be at the top.
    // Anybody who uses them a lot feel free to weigh in here and make an argument for a different placement.

    // Schema and Vocabulary appear to be universally be external links, so should be grouped.
    '$schema',            // JSON Schema draft
    '$vocabulary',        // JSON Schema draft

    // I have no idea on the practical use of these keys, especially in this context,
    // but someone using them would likely want them close to the top for reference.
    '$anchor',            // JSON Schema draft
    '$dynamicAnchor',     // JSON Schema draft
    '$dynamicRef',        // JSON Schema draft
    '$comment',           // JSON Schema draft
    '$defs',              // JSON Schema draft
    '$recursiveAnchor',   // JSON Schema draft
    '$recursiveRef',      // JSON Schema draft

    // This is where most non $ref schemas will begin.

    // The info section of the schema.
    'title',
    // description and externalDocs logically come after the title, 
    // describing it in more and more detail.
    'description',
    'externalDocs',
    // Deprecated is a good at a glance key, and stays at the top.
    'deprecated',

    // This next section describes the type and how it behaves.

    // Type and format should always be grouped together.
    'type',
    'format',

    // Content schema, media type, and encoding are all related to the content of the schema, 
    // and are similar to format. They should be grouped together.
    'contentSchema',      // JSON Schema draft
    'contentMediaType',   // JSON Schema draft
    'contentEncoding',    // JSON Schema draft

    // Nullable is like format, it specifies how the type can behave, 
    // and in more recent versions of OpenAPI its directly included in the type field.
    'nullable',

    // Enum and const are both static entries of allowed values for the schema.
    // They should be grouped together.
    'const',
    'enum',

    // The default value of the schema when that schema is not specified.
    // Same as with parameters, but at the schema level.
    'default',

    // ReadOnly and WriteOnly are boolean flags and should be grouped together.
    'readOnly',
    'writeOnly',

    // Examples when included should be directly below what they are examples of.
    'example',
    'examples',

    // Numeric constraints grouped together
    // Min before max, multipleOf in the middle, since its steps between them.
    'minimum',
    'exclusiveMinimum',
    'multipleOf',
    'maximum',
    'exclusiveMaximum',

    // String constraints grouped together
    'pattern',
    'minLength',
    'maxLength',

    // Array constraints grouped together (type/format above — keep type before items for array schemas)
    'uniqueItems',
    'minItems',
    'maxItems',
    'items',

    // Prefix items describes tuple like array behavior.
    'prefixItems',        // JSON Schema draft

    // Contains specifies a subschema that must be present in the array.
    // Min and max contains specify the match occurrence constraints for the contains key.
    'contains',           // JSON Schema draft
    'minContains',        // JSON Schema draft
    'maxContains',        // JSON Schema draft

    // After accounting for Items, prefixItems, and contains, unevaluatedItems specifies if additional items are allowed.
    // This key is either a boolean or a subschema.
    // Behaves the same as additionalProperties at the object level.
    'unevaluatedItems',   // JSON Schema draft

    // Object constraints grouped together
    // min and max properties specify how many properties an object can have.
    'minProperties',
    'maxProperties',

    // Pattern properties are a way to specify a pattern and schemas for properties that match that pattern.
    // Additional properties are a way to specify if additional properties are allowed and if so, how they are shaped.
    'patternProperties',
    'additionalProperties',

    // Properties are the actual keys and schemas that make up the object.
    'properties',

    // Required is a list of those properties that are required to be present in the object.
    'required',

    // Unevaluated properties specifies if additional properties are allowed after applying all other validation rules.
    // This is more powerful than additionalProperties as it considers the effects of allOf, anyOf, oneOf, etc.
    'unevaluatedProperties', // JSON Schema draft

    // Property names defines a schema that property names must conform to.
    // This is useful for validating that all property keys follow a specific pattern or format.
    'propertyNames',      // JSON Schema draft

    // Dependent required specifies properties that become required when certain other properties are present.
    // This allows for conditional requirements based on the presence of specific properties.
    'dependentRequired',  // JSON Schema draft

    // Dependent schemas defines schemas that apply when certain properties are present.
    // This allows for conditional validation rules based on the presence of specific properties.
    // For example, if a property is present, a certain other property must also be present, and match a certain schema.
    'dependentSchemas',   // JSON Schema draft

    // Discriminator is a way to specify a property that differentiates between different types of objects.
    // This is useful for polymorphic schemas, and should go above the schema composition keys.
    'discriminator',

    // Schema composition keys grouped together
    // allOf, anyOf, oneOf, and not are all used to compose schemas from other schemas.
    // allOf is a logical AND, 
    // anyOf is a logical OR, 
    // oneOf is a logical XOR, 
    // and not is a logical NOT.
    'allOf',
    'anyOf',
    'oneOf',
    'not',

    // Conditional keys grouped together
    'if',                 // JSON Schema draft
    'then',               // JSON Schema draft
    'else',               // JSON Schema draft

    // XML is a way to specify the XML serialization of the schema.
    // This is useful for APIs that need to support XML serialization.
    'xml',
] as const;

export const ResponseKeys = [
    // $ref should always be at the top, because when its included there are at most 2 other keys that are present.
    '$ref',

    // Description is a good at a glance key, and stays at the top.
    'description',

    // Headers are a common key, and should be at the top.
    'headers',

    // Schema and content are the core shape of the response.
    'schema',              // Swagger 2.0
    'content',             // OpenAPI 3.0+

    // Examples are of the schema, and should be directly below the schema.
    'examples',            // Swagger 2.0

    // Links are programatic ways to link responses together.
    'links',               // OpenAPI 3.0+
] as const;

export const SecuritySchemeKeys = [
    // Good at a glance keys.
    'name',
    'description',

    // The primary type of this security scheme
    'type',
    'in',
    'scheme',

    // If scheme is bearer, bearerFormat is the format of the bearer token.
    // Should be directly below scheme.
    'bearerFormat',

    // If scheme is openIdConnect, openIdConnectUrl is the URL of the OpenID Connect server.
    'openIdConnectUrl',

    // Flows are the different ways to authenticate with this security scheme.
    'flows',               // OpenAPI 3.0+

    'flow',                // Swagger 2.0
    'authorizationUrl',    // Swagger 2.0
    'tokenUrl',            // Swagger 2.0
    'scopes',              // Swagger 2.0
] as const;

export const OAuthFlowKeys = [
    // Authorization URL is where the client can get an authorization code.
    'authorizationUrl',

    // Token URL is where the client can get a token.
    'tokenUrl',

    // Refresh URL is where the client can refresh a token.
    'refreshUrl',

    // Scopes are the different scopes that can be used with this security scheme.
    'scopes',
] as const;

export const ServerKeys = [
    // Name first because obviously.
    'name',           // OpenAPI 3.2+

    // Description so you know what you are looking at.
    'description',

    // URL is the URL of the server.
    'url',

    // Variables are the different variables that are present in the URL.
    'variables',
] as const;

export const ServerVariableKeys = [
    // Description so you know what you are looking at.
    'description',

    // Default is the default value of the variable when that variable is not specified.
    // IMO this should be optional, but I was not consulted.
    'default',

    // Enum is a static list of allowed values for the variable.
    'enum',
] as const;

export const TagKeys = [
    // Name first because obviously.
    'name',

    // Description so you know what you are looking at.
    'description',

    // External docs should be like an extension of the description.
    'externalDocs',
] as const;

// The only sane key order, fight me.
export const ExternalDocsKeys = [
    'description',
    'url',
] as const;

// This seems like an obvious order given out running philosophy.
export const WebhookKeys = [
    'summary',
    'operationId',
    'description',
    'deprecated',
    'tags',
    'security',
    'servers',
    'parameters',
    'requestBody',
    'responses',
    'callbacks',
] as const;

// Short blocks at the top, long at the bottom.
export const PathItemKeys = [
    '$ref',
    'summary',
    'description',
    'servers',
    'parameters',
    'get',
    'put',
    'post',
    'patch',
    'delete',
    'options',
    'head',
    'trace',
] as const;

// OpenAPI Request Body Object: description → required → content (required sits between the two when all are present).
export const RequestBodyKeys = [
    // $ref should always be at the top, because when its included there are at most 2 other keys that are present.
    '$ref',

    'description',
    'required',
    'content',
] as const;

// These are a bit trickier, all seem rather long in context.
// I'll with this order since it seems less to more complex.
export const MediaTypeKeys = [
    'schema',
    'example',
    'examples',
    'encoding',
] as const;

export const EncodingKeys = [
    // Content type is just MIME type.
    'contentType',

    // Style, explode, and allowReserved are simple string or boolean values.
    'style',
    'explode',
    'allowReserved',

    // Headers is longer, put it at the bottom.
    'headers',
] as const;

export const HeaderKeys = [
    // $ref should always be at the top, because when its included there are at most 2 other keys that are present.
    '$ref',
    
    // Description is a good at a glance key, and stays at the top.
    'description',
    'required',
    'deprecated',

    'schema',
    'content',
    'type',
    'format',
    'style',
    'explode',
    'enum',
    'default',
    'example',
    'examples',

    // Array keys grouped together
    'items',
    'collectionFormat',
    // Array constraints grouped together
    'maxItems',
    'minItems',
    'uniqueItems',

    // Numeric constraints grouped together
    'minimum',
    'multipleOf',
    'exclusiveMinimum',
    'maximum',
    'exclusiveMaximum',

    // String constraints grouped together
    'pattern',
    'minLength',
    'maxLength',
] as const;

export const LinkKeys = [
    // $ref should always be at the top, because when its included there are at most 2 other keys that are present.
    '$ref',
    
    'operationId',
    'description',
    'server',
    'operationRef',
    'parameters',
    'requestBody',
] as const;

export const ExampleKeys = [
    'summary',
    'description',
    'value',
    'externalValue',
] as const;

// Discriminator keys in preferred order (OpenAPI 3.0+)
export const DiscriminatorKeys = [
    'propertyName',
    'mapping',
] as const;

// XML keys in preferred order (OpenAPI 3.0+)
export const XMLKeys = [
    'name',
    'namespace',
    'prefix',
    'attribute',
    'wrapped',
] as const;
