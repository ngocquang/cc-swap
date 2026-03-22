/** Items inside ~/.claude that get symlinked per-account */
export const SWITCH_ITEMS = [
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

export type SwitchItem = (typeof SWITCH_ITEMS)[number];
