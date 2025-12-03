import { describe, it, expect } from 'vitest';
import { validateUrl } from '../../src/features/siteAnalyzer/utils.js';

describe('validateUrl', () => {
  it('accepts valid http/https URLs', () => {
    expect(validateUrl('https://google.com')).toBe(true);
    expect(validateUrl('http://foo.bar')).toBe(true);
  });
  it('rejects invalid URLs', () => {
    expect(validateUrl('notaurl')).toBe(false);
    expect(validateUrl('ftp://example.com')).toBe(false);
    expect(validateUrl('http:/bad')).toBe(false);
    expect(validateUrl('')).toBe(false);
  });
});
