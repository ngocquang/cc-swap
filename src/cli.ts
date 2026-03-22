import { Command } from "commander";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import {
  CLAUDE_DIR,
  CC_SWITCH_DIR,
  ACCOUNTS_DIR,
  CURRENT_FILE,
} from "./paths.js";
import {
  listAccounts,
  addAccount,
  switchAccount,
  removeAccount,
  nextAccount,
} from "./accounts.js";
import { readCurrent } from "./symlink.js";

const program = new Command();

program
  .name("cc-switch")
  .description("Switch between multiple Claude Code accounts")
  .version("0.1.0");

program.action(async () => {
  const accounts = await listAccounts(ACCOUNTS_DIR);
  if (accounts.length === 0) {
    console.log("No accounts found. Run 'cc-switch add <name>' to get started.");
    return;
  }

  const current = await readCurrent(CURRENT_FILE);
  if (!current) {
    console.log("No active account. Run 'cc-switch switch <name>' to activate one.");
    return;
  }

  const next = nextAccount(current, accounts);
  if (!next) {
    console.log(`Only one account ('${current}'). Add another with 'cc-switch add <name>'.`);
    return;
  }

  await switchAccount(next, {
    claudeDir: CLAUDE_DIR,
    accountsDir: ACCOUNTS_DIR,
    currentFile: CURRENT_FILE,
  });
  console.log(`Switched: ${current} → ${next}`);
});

program
  .command("add <name>")
  .description("Add a new account")
  .action(async (name: string) => {
    try {
      await addAccount(name, {
        claudeDir: CLAUDE_DIR,
        ccSwitchDir: CC_SWITCH_DIR,
        accountsDir: ACCOUNTS_DIR,
        currentFile: CURRENT_FILE,
      });
      console.log(`Added account '${name}'.`);
    } catch (err: unknown) {
      console.error(`Error: ${(err as Error).message}`);
      process.exit(1);
    }
  });

program
  .command("switch <name>")
  .description("Switch to a specific account")
  .action(async (name: string) => {
    try {
      const msg = await switchAccount(name, {
        claudeDir: CLAUDE_DIR,
        accountsDir: ACCOUNTS_DIR,
        currentFile: CURRENT_FILE,
      });
      console.log(msg);
    } catch (err: unknown) {
      console.error(`Error: ${(err as Error).message}`);
      process.exit(1);
    }
  });

program
  .command("list")
  .description("List all accounts")
  .action(async () => {
    const accounts = await listAccounts(ACCOUNTS_DIR);
    if (accounts.length === 0) {
      console.log("No accounts found. Run 'cc-switch add <name>' to get started.");
      return;
    }
    const current = await readCurrent(CURRENT_FILE);
    for (const name of accounts) {
      const marker = name === current ? "* " : "  ";
      const label = name === current ? " (active)" : "";
      console.log(`${marker}${name}${label}`);
    }
  });

program
  .command("remove <name>")
  .description("Remove an account")
  .option("-f, --force", "Skip confirmation prompt")
  .action(async (name: string, opts: { force?: boolean }) => {
    try {
      if (!opts.force) {
        const rl = createInterface({ input, output });
        const answer = await rl.question(
          `Remove account '${name}'? This will delete all its data. (y/N) `
        );
        rl.close();
        if (answer.toLowerCase() !== "y") {
          console.log("Cancelled.");
          return;
        }
      }
      await removeAccount(name, {
        accountsDir: ACCOUNTS_DIR,
        currentFile: CURRENT_FILE,
      });
      console.log(`Removed account '${name}'.`);
    } catch (err: unknown) {
      console.error(`Error: ${(err as Error).message}`);
      process.exit(1);
    }
  });

program.parseAsync();
