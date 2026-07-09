#!/usr/bin/env node
/**
 * PreToolUse hook: protects the main branch (main = live website synergie.cc).
 *
 * Blocks (exit code 2, message goes back to Claude):
 *  - any `git push` that targets main (publishing happens via PR, merged by Elias)
 *  - merging PRs via `gh pr merge` (that is Elias's job)
 *  - force pushes, `git reset --hard`, deleting the main branch
 *  - commits/merges/rebases while standing on main
 *  - file edits (Edit/Write) while standing on main
 *
 * Invoked with `--edit` for Edit/Write tools, without flags for Bash.
 */
const { execSync } = require("child_process");

let raw = "";
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  let input = {};
  try {
    input = JSON.parse(raw);
  } catch {
    process.exit(0); // fail open on malformed input, permissions still apply
  }

  const projectDir = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();

  let branch = "";
  try {
    branch = execSync("git branch --show-current", {
      cwd: projectDir,
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    process.exit(0); // not a git repo / git unavailable -> nothing to protect
  }

  const deny = (msg) => {
    console.error(msg);
    process.exit(2);
  };

  // --- Edit/Write tools ---------------------------------------------------
  if (process.argv.includes("--edit")) {
    const filePath = (input.tool_input && input.tool_input.file_path) || "";
    const insideProject = filePath.startsWith(projectDir);
    if (branch === "main" && insideProject) {
      deny(
        "BLOCKED: You are on the 'main' branch (= the live website). " +
          "Create a working branch first, then redo this edit:\n" +
          "  git pull --ff-only origin main && git switch -c michael/<kurzer-name>"
      );
    }
    process.exit(0);
  }

  // --- Bash tool ------------------------------------------------------------
  const cmd = (input.tool_input && input.tool_input.command) || "";
  if (!/\b(git|gh)\b/.test(cmd)) process.exit(0);

  if (/gh\s+pr\s+merge/.test(cmd))
    deny(
      "BLOCKED: Merging pull requests is Elias's job. Submit the branch for " +
        "review with `pnpm submit` and tell Michael that Elias will check and publish it."
    );

  if (/git\s+push/.test(cmd)) {
    if (/(\s|^)(--force|--force-with-lease|-f)(\s|$)/.test(cmd))
      deny("BLOCKED: Force pushes are not allowed in this repo.");
    if (/\bmain\b/.test(cmd))
      deny(
        "BLOCKED: Pushing to 'main' directly is not allowed (main = live website). " +
          "Push your working branch and open a PR with `pnpm submit`; Elias reviews and merges."
      );
    if (branch === "main")
      deny(
        "BLOCKED: You are on 'main'. Create a working branch and push that instead."
      );
  }

  if (
    branch === "main" &&
    /git\s+(commit|merge|rebase|cherry-pick|revert)\b/.test(cmd)
  ) {
    deny(
      "BLOCKED: No commits/merges directly on 'main' (= live website). " +
        "Create a working branch first: git switch -c michael/<kurzer-name>. " +
        "To publish a finished branch, use `pnpm submit` (PR for Elias)."
    );
  }

  if (/git\s+reset\s+(.*\s)?--hard/.test(cmd))
    deny("BLOCKED: `git reset --hard` is not allowed here (risk of losing work). Use `git stash` if changes need to be set aside.");

  if (/git\s+branch\s+(-D|-d|--delete)\s+(.*\s)?main\b/.test(cmd))
    deny("BLOCKED: The 'main' branch must never be deleted.");

  process.exit(0);
});
