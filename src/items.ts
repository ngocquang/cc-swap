import fsPromises from "node:fs/promises";

/** Default items inside ~/.claude that get symlinked per-account */
export const DEFAULT_ITEMS = [
  "agents",
  "commands",
  "file-history",
  "hooks",
  "plugins",
  "projects",
  "rules",
  "session-env",
  "sessions",
  "settings.json",
  "skills",
  "tasks",
] as const;

export interface Config {
  syncItems: string[];
  autoContinue: boolean;
}

const DEFAULT_CONFIG: Config = {
  syncItems: [...DEFAULT_ITEMS],
  autoContinue: true,
};

/** Load config from config.json. Returns defaults if file doesn't exist. */
export async function loadConfig(configFile: string): Promise<Config> {
  try {
    const raw = await fsPromises.readFile(configFile, "utf-8");
    const parsed = JSON.parse(raw);
    return {
      syncItems: Array.isArray(parsed.syncItems) ? parsed.syncItems : [...DEFAULT_ITEMS],
      autoContinue: parsed.autoContinue !== false,
    };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

/** Save config to config.json. */
export async function saveConfig(configFile: string, config: Config): Promise<void> {
  await fsPromises.writeFile(configFile, JSON.stringify(config, null, 2) + "\n", { mode: 0o600 });
}

/** Get the list of items to sync (from config or defaults). */
export async function getSyncItems(configFile: string): Promise<string[]> {
  const config = await loadConfig(configFile);
  return config.syncItems;
}
