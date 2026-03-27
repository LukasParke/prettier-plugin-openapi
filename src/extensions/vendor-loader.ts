/**
 * Vendor Loader
 * 
 * Loads vendor extensions using static imports for ES module compatibility.
 */

import { before, after, type KeyMap, type VendorExtensions } from './index.js';

// Import vendor extensions statically
import { common } from './vendor/common.js';
import { sailpoint } from './vendor/sailpoint.js';
import { speakeasy } from './vendor/speakeasy.js';

// Import vendor extensions statically
const vendorModules = [
  // Update this list as new vendors are added
  speakeasy,
  sailpoint,
  common,
];

// Type for vendor module
export interface VendorModule {
  info: {
    name: string;
    website?: string;
    support?: string;
  }
  extensions?: VendorExtensions
}

function getTypedEntries<T>(obj: T): [keyof T, T[keyof T]][] {
  return Object.entries(obj as Record<string, any>) as [keyof T, T[keyof T]][];
}

export type Extensions = Record<string, Record<string, number>>
export type ExtensionSources = Record<string, Record<string, string>>


/**
 * Load vendor extensions using static imports
 * This approach is ES module compatible and doesn't require dynamic loading
 * Handles failures on a per-vendor basis so one failure doesn't break others
 * Detects and alerts on extension key collisions between vendors
 */
export function getVendorExtensions(customVendorModules?: VendorModule[]): Extensions {
  const extensions: Extensions = {};
  const extensionSources: ExtensionSources = {}; // Track which vendor defined each extension
  
  // Use custom modules for testing, or default modules for production
  const modulesToLoad = customVendorModules || vendorModules;
  
  for (const vendorModule of modulesToLoad) {
    try {
      if (vendorModule?.extensions) {
        for (const entry of getTypedEntries(vendorModule.extensions)) {
          const [context, contextFunction] = entry;
          if (typeof contextFunction === 'function') {
            // Create context-specific before/after functions
            const contextBefore = (key: typeof KeyMap[typeof context][number]) => before(context, key);
            const contextAfter = (key: typeof KeyMap[typeof context][number]) => after(context, key);
            
            // Execute the function to get the extensions
            const contextExtensions = contextFunction(contextBefore, contextAfter);
            
            if (!extensions[context]) {
              extensions[context] = {};
            }

            if (!extensionSources[context]) {
              extensionSources[context] = {};
            }
            
            // Check for collisions before adding extensions
            for (const [extensionKey, position] of getTypedEntries(contextExtensions)) {
              if (Object.hasOwn(extensions[context], extensionKey)) {
                const existingVendor = extensionSources[context][extensionKey];
                const currentVendor = vendorModule.info.name;
                
                console.warn(
                  `⚠️  Extension collision detected!\n` +
                  `   Key: "${extensionKey}" in context "${context}"\n` +
                  `   Already defined by: ${existingVendor}\n` +
                  `   Conflicting with: ${currentVendor}\n` +
                  `   Using position from: ${existingVendor} (${extensions[context][extensionKey]})\n` +
                  `   Ignoring position from: ${currentVendor} (${position})`
                );

              } else {
                // No collision, add the extension
                extensions[context][extensionKey] = position;
                extensionSources[context][extensionKey] = vendorModule.info.name;
              }
            }
          }
        }
      }
    } catch (error) {
      // Log the error but continue with other vendors
      console.warn(`Failed to load ${vendorModule.info.name} extensions`, error);
    }
  }
  
  return extensions;
}
