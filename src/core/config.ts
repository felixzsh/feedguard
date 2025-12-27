import { readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
// @ts-ignore
import { load as loadYaml } from 'js-yaml';
import { z } from 'zod';

// Configuration schema per platform
export const SourceSchema = z.object({
  platform: z.string(),
  handle: z.string(),
  limit: z.number().int().positive(),
  filters: z.object({
    blacklist: z.array(z.string())
  }).optional()
});

// Whole config schema
export const ConfigSchema = z.object({
  sources: z.array(SourceSchema)
});

// Type exports
export type Source = z.infer<typeof SourceSchema>;
export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(): Config {
  const env = process.env.NODE_ENV || 'production';

  const prodConfigPath = join(homedir(), '.config', 'feedguard', 'daily_digest.yml');
  const devConfigPath = join(process.cwd(), 'config.example.yaml');

  const configPath = env === 'development' ? devConfigPath : prodConfigPath;

  console.log(`[Config] Environment: ${env}`);
  console.log(`[Config] Loading config from: ${configPath}`);

  let configContent: string;

  try {
    configContent = readFileSync(configPath, 'utf-8');
  } catch (error) {
    throw new Error(
      `Configuration file not found at: ${configPath}\n` +
      `Please create the configuration file or set NODE_ENV appropriately.\n` +
      `  Production path: ${prodConfigPath}\n` +
      `  Development path: ${devConfigPath}\n` +
      `  Current NODE_ENV: ${env}`
    );
  }

  // Parse YAML
  let parsedConfig: any;
  try {
    parsedConfig = loadYaml(configContent);
  } catch (error) {
    throw new Error(
      `Failed to parse YAML configuration at ${configPath}: ${error instanceof Error ? error.message : error
      }`
    );
  }

  // Validate with Zod
  try {
    const validatedConfig = ConfigSchema.parse(parsedConfig);
    console.log(
      `[Config] Configuration validated successfully with ${validatedConfig.sources.length} sources`
    );
    return validatedConfig;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Configuration validation failed at ${configPath}:\n${error.issues
          .map((err: any) => `  ${err.path.join('.')}: ${err.message}`)
          .join('\n')}`
      );
    }
    throw new Error(
      `Configuration validation failed at ${configPath}: ${error instanceof Error ? error.message : error
      }`
    );
  }
}
