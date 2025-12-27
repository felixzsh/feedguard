import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import { mkdtempSync, writeFileSync, unlinkSync, readdirSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const fixturesDir = join(__dirname, '../fixtures/config');

describe('Config Loading', () => {
  let tempDir: string;

  beforeAll(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'feedguard-test-'));
    process.env.NODE_ENV = 'production';
  });

  describe('File System Errors', () => {
    test('throws error when config file does not exist', () => {
      const configPath = join(tempDir, 'non-existent.yaml');

      expect(() => loadConfigAtPath(configPath)).toThrow('ENOENT');
    });

    test('throws error when config directory does not exist', () => {
      const configPath = join(tempDir, 'non-existent-dir', 'config.yaml');

      expect(() => loadConfigAtPath(configPath)).toThrow('ENOENT');
    });

    test('throws error when config file is empty', () => {
      const configPath = join(tempDir, 'empty.yaml');
      writeFileSync(configPath, '');

      expect(() => loadConfigAtPath(configPath)).toThrow();

      unlinkSync(configPath);
    });
  });

  describe('Edge Cases', () => {
    test('handles large blacklist arrays', () => {
      const configPath = join(tempDir, 'large-blacklist.yaml');
      const blacklist = Array.from({ length: 100 }, (_, i) => `keyword${i}`);
      const validConfig = `sources:
  - platform: facebook
    handle: CNN
    limit: 5
    filters:
      blacklist: ${JSON.stringify(blacklist)}`;

      writeFileSync(configPath, validConfig);

      const config = loadConfigAtPath(configPath);

      expect(config.sources[0].filters?.blacklist).toHaveLength(100);
      expect(config.sources[0].filters?.blacklist[0]).toBe('keyword0');
      expect(config.sources[0].filters?.blacklist[99]).toBe('keyword99');

      unlinkSync(configPath);
    });

    test('handles single source with limit of 1', () => {
      const configPath = join(tempDir, 'minimal.yaml');
      const validConfig = `sources:
  - platform: facebook
    handle: CNN
    limit: 1`;

      writeFileSync(configPath, validConfig);

      const config = loadConfigAtPath(configPath);

      expect(config.sources).toHaveLength(1);
      expect(config.sources[0].limit).toBe(1);

      unlinkSync(configPath);
    });
  });

  describe('Fixture-based Tests', () => {
    const fixtureFiles = readdirSync(fixturesDir).filter((file) => file.endsWith('.yaml'));

    fixtureFiles.forEach((fixtureFile) => {
      const fixturePath = join(fixturesDir, fixtureFile);
      const isValid = fixtureFile.startsWith('valid-');

      test(`${isValid ? 'validates' : 'rejects'} ${fixtureFile}`, () => {
        if (isValid) {
          const config = loadConfigAtPath(fixturePath);
          expect(config).toBeDefined();
          expect(config.sources).toBeInstanceOf(Array);
        } else {
          expect(() => loadConfigAtPath(fixturePath)).toThrow();
        }
      });
    });
  });
});

function loadConfigAtPath(configPath: string): any {
  const { readFileSync } = require('fs');
  const { load } = require('js-yaml');
  const { ConfigSchema } = require('../../src/core/config');

  const configContent = readFileSync(configPath, 'utf-8');
  const parsedConfig = load(configContent);
  return ConfigSchema.parse(parsedConfig);
}
