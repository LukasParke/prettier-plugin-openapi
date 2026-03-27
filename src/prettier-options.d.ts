import "prettier";

declare module "prettier" {
  interface RequiredOptions {
    /**
     * When true, run Prettier's Markdown formatter on OpenAPI `description` and `summary` fields.
     * @default true
     */
    openApiFormatMarkdown: boolean;
    /**
     * When true, reorder keys to the plugin's canonical OpenAPI order.
     * @default true
     */
    openApiSortKeys: boolean;
    /**
     * When true, YAML output prefers single quotes for scalars that need quoting (e.g. `'200':` response keys).
     * When false, uses double quotes for those scalars. Independent of Prettier `singleQuote` (JS/TS/etc.).
     * @default true
     */
    openApiYamlSingleQuote: boolean;
    /**
     * When true, YAML `$ref` string values are always double-quoted, regardless of `openApiYamlSingleQuote`.
     * @default true
     */
    openApiYamlDoubleQuoteRefs: boolean;
  }
}
