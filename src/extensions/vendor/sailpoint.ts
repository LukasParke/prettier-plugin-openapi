/**
 * SailPoint Extensions
 *
 * SailPoint-specific OpenAPI extensions for formatting.
 */

import { defineConfig } from "../index.js";

export const sailpoint = defineConfig({
  info: {
    name: "SailPoint",
    website: "https://developer.sailpoint.com",
  },
  extensions: {
    operation: (before, after) => {
      return {
        "x-sailpoint-userLevels": after("security"),
      };
    },
  },
});
