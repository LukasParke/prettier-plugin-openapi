import { describe, expect, it } from 'bun:test';
import { getVendorExtensions } from '../src/extensions/vendor-loader';

describe('Vendor Extension System', () => {
  it('should load vendor extensions from TS files', () => {
    const vendorExtensions = getVendorExtensions();

    // Should have loaded built-in vendor extensions
    expect(vendorExtensions).toBeDefined();
    expect(typeof vendorExtensions).toBe('object');

    // Check if extensions were loaded
    expect(vendorExtensions['top-level']).toBeDefined();
    expect(vendorExtensions['top-level']['x-tagGroups']).toBe(13);
    expect(vendorExtensions.operation['x-sailpoint-userLevels']).toBe(7);
  });


  it('should handle vendor extensions gracefully', () => {
    // This test ensures the system doesn't crash when loading extensions
    const vendorExtensions = getVendorExtensions();
    expect(vendorExtensions).toBeDefined();
    expect(typeof vendorExtensions).toBe('object');
  });

  it('should have proper extension structure', () => {
    const vendorExtensions = getVendorExtensions();

    // Check that extensions have the right structure
    expect(vendorExtensions['top-level']).toBeDefined();
    expect(vendorExtensions.operation).toBeDefined();
  });
});
