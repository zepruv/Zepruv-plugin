# Zepruv plugin for Claude Code

Connect Claude Code to your Zepruv Workspace. One install gives it two things:

- **The connection**: an MCP server that lets Claude read and edit your scribes, slates, atlases, packs, collections and READMEs, and read your interview and practice stats.
- **Skills**: short guides that teach Claude the right workflow for each job (building a system-design pack, editing a note, organising collections, turning interview feedback into a study plan).

The plugin adds no permissions of its own. What Claude may do, and in which collections, is decided by you on the Zepruv consent screen.

## Install

In Claude Code:

```
/plugin marketplace add zepruv/zepruv-plugin
/plugin install zepruv@zepruv
```

Then connect your account:

1. Run `/mcp` and pick **zepruv**.
2. Choose **Authenticate**. Your browser opens Zepruv.
3. Sign in, choose which collections Claude may use, and review the permissions. Write permissions are off until you turn them on.
4. Back in Claude Code the server shows as connected. Try: *"List my Zepruv collections"*.

To disconnect, open Zepruv, go to **Settings > Connected apps**, and revoke it.

## What you can ask for

| Skill | Ask things like |
|---|---|
| `zepruv-workspace-basics` | Used at the start of every Zepruv session. Covers what changed, undoing an edit, restoring an older version, and what to do when a tool returns an error. |
| `zepruv-system-design-pack` | "Design a rate limiter", "build me a pack on chat systems". Creates an atlas (architecture), a slate (request flow) and a scribe that shows both. |
| `zepruv-scribe-editing` | "Tighten section 2", "add a table of trade-offs", "show the atlas inside this note", "undo that". |
| `zepruv-collection-readme` | "Group these by topic", "add a README to my DSA collection", "move these two notes". |
| `zepruv-interview-feedback-loop` | "Why do I keep failing system-design rounds?", "plan my next 4 weeks". Reads your interview and practice data. Saves a plan to your Workspace only if you agree. |

Claude loads the right skill by itself; you do not have to name it.

## Safety

- Every edit Claude makes is saved as a version. "Undo that" restores the previous one.
- Claude has no tools to delete anything, share, publish, change your profile, or run a live interview.
- If you limit the connection to one collection, Claude cannot see or touch anything else.
- Text inside your documents is treated as data, never as instructions to Claude.

## Pointing at another server

The plugin connects to `https://mcp.zepruv.me/mcp`. To use staging or a local server, set `ZEPRUV_MCP_URL` before starting Claude Code:

```
export ZEPRUV_MCP_URL=https://staging-mcp.zepruv.me/mcp
claude
```

The address must be `https`.

## Other AI clients

The plugin format is Claude Code only. Cursor, VS Code and other MCP clients can use the same server without the skills: add it with the URL `https://mcp.zepruv.me/mcp` and sign in when asked. See the `zepruv-mcp` repository for the config for each client.

## For maintainers

```
.claude-plugin/plugin.json        name, version, description
.claude-plugin/marketplace.json   makes this repo its own marketplace
.mcp.json                         the remote MCP server (ZEPRUV_MCP_URL, default https://mcp.zepruv.me/mcp)
skills/<name>/SKILL.md            one folder per skill; the folder name must equal `name` in the front matter
scripts/check-plugin.mjs          validates all of the above
```

- Check before you push: `node scripts/check-plugin.mjs`. The PR workflow runs the same check plus the shared security scans (gitleaks, Trivy, Semgrep).
- Test locally without publishing: `/plugin marketplace add /path/to/zepruv-plugin`, then install as above.
- Release: bump `version` in `.claude-plugin/plugin.json`, merge to `main`, then tag it (`git tag v0.3.0 && git push --tags`). Users install straight from GitHub, so the repository must be public. Nothing needs to be published to a store, and the repository holds no secrets.
- A new skill is useful only if its `description` says when to use it, since that is what Claude matches against. Keep each one to a single workflow.
- When a tool is added or renamed in `zepruv-mcp`, update the skills that mention it, and bump the version.
