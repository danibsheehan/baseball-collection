@AGENTS.md

The above is the canonical, tool-agnostic reference (install/run/test, conventions map,
constraints, definition of done) — also read by Cursor and any other agent. Everything below is
Claude Code–specific session mechanics.

## Always-apply rule

@.cursor/rules/baseball-collection.mdc

## Skills

`.claude/skills` is a directory symlink to `.cursor/skills` — same files, no copies. Claude Code
auto-discovers and invokes them by task the same way Cursor does.
