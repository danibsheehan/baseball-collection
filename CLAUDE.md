@AGENTS.md

The above is the canonical, tool-agnostic reference (install/run/test, conventions map,
constraints, definition of done) — also read by Cursor and any other agent. Everything below is
Claude Code–specific session mechanics.

## Skills

`.claude/skills` is the canonical skills directory — add new skills here. `.cursor/skills` is a
symlink to it, kept only for compatibility with the legacy Cursor setup. Claude Code
auto-discovers and invokes skills by task the same way Cursor does.
