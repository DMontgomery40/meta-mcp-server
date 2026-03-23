# Meta MCP Server

The original MCP server that creates other MCP servers. Built before Anthropic shipped their own [mcp-builder skill](https://github.com/anthropics/claude-code-templates) -- now modernized to align with MCP spec `2025-11-25` and SDK v1.27+.

## What It Does

meta-mcp-server exposes tools that let an LLM (or any MCP client) scaffold, write, validate, and template new MCP server projects. Instead of manually setting up `package.json`, `tsconfig.json`, and boilerplate tool registrations, you describe what you want and meta-mcp-server writes it.

## Tools

| Tool | Description |
|------|-------------|
| `meta_write_mcp_server` | Write files for a new MCP server to disk |
| `meta_list_templates` | List available project templates |
| `meta_get_template` | Get full file contents for a named template |
| `meta_validate_server` | Validate that a directory is a well-formed MCP server project |

All tools use explicit JSON Schema (via Zod), tool annotations (`readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint`), and structured error responses for model self-correction.

## Requirements

- Node.js >= 18
- npm

## Installation

```bash
git clone https://github.com/DMontgomery40/meta-mcp-server.git
cd meta-mcp-server
npm install
npm run build
```

## Usage

### stdio transport (default)

```bash
npm start
# or
node build/main.js
```

### Streamable HTTP transport

```bash
npm run start:http
# or
node build/main.js --http
# Listens on http://localhost:3000 (override with PORT env var)
```

### Docker

```bash
docker build -t meta-mcp-server .
docker run -p 3000:3000 meta-mcp-server
```

### Configure in Claude Desktop

Add to your Claude Desktop config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "meta-mcp-server": {
      "command": "node",
      "args": ["/path/to/meta-mcp-server/build/main.js"]
    }
  }
}
```

### Configure in Claude Code

```bash
claude mcp add meta-mcp-server node /path/to/meta-mcp-server/build/main.js
```

## Templates

meta-mcp-server ships with ready-to-use templates:

- **minimal-stdio** -- Minimal MCP server with one tool, stdio transport, TypeScript + Zod
- **http-dual-transport** -- MCP server supporting both stdio and streamable-HTTP transports

Use `meta_list_templates` to browse, `meta_get_template` to retrieve, and `meta_write_mcp_server` to write.

## Testing

```bash
npm run build
npm test
```

Tests use Node.js built-in test runner with the MCP SDK's `InMemoryTransport` for fast in-process testing.

## Project History

This was one of the earliest MCP servers ever built -- a meta-server that creates other MCP servers. Anthropic later released their own mcp-builder skill (Apache 2.0). David Montgomery's was first. This v2.0 modernization aligns with current MCP spec and best practices while preserving the original vision.

## License

MIT

---

# Appendix: MCP in Practice (Code Execution, Tool Scale, and Safety)

Last updated: 2026-03-23

## Why This Appendix Exists
Model Context Protocol (MCP) is still one of the most useful interoperability layers for tools and agents. The tradeoff is that large MCP servers can expose many tools, and naive tool-calling can flood context windows with schemas, tool chatter, and irrelevant call traces.

In practice, "more tools" is not always "better outcomes." Tool surface area must be paired with execution patterns that keep token use bounded and behavior predictable.

## The Shift to Code Execution / Code Mode
Recent workflows increasingly move complex orchestration out of chat context and into code execution loops. This reduces repetitive schema tokens and makes tool usage auditable and testable.

Core reading:
- [Cloudflare: Code Mode](https://blog.cloudflare.com/code-mode/)
- [Cloudflare: Code Execution with MCP](https://blog.cloudflare.com/code-execution-with-mcp/)
- [Anthropic: Code Execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp)

## Recommended Setup for Power Users
For users who want reproducible and lower-noise MCP usage, start with a codemode-oriented setup:
- [codemode-mcp (jx-codes)](https://github.com/jx-codes/codemode-mcp)
- [UTCP](https://www.utcp.io)

Practical caveat: even with strong setup, model behavior can still be inconsistent across providers and versions. Keep retries, guardrails, and deterministic fallbacks in place.

## Peter Steinberger-Style Wrapper Workflow
A high-leverage pattern is wrapping MCP servers into callable code interfaces and task-focused CLIs instead of exposing every raw tool to the model at all times.

Reference tooling:
- [MCPorter](https://github.com/steipete/mcporter)
- [OpenClaw](https://github.com/steipete/openclaw)

## Client Fit Guide (Short Version)
- Claude Code / Codex / Cursor: strong for direct MCP workflows, but still benefit from narrow tool surfaces.
- Code execution wrappers (TypeScript/Python CLIs): better when tool count is high or task chains are multi-step.
- Hosted chat clients with weaker MCP controls: often safer via pre-wrapped CLIs or gateway tools.

This space changes fast. If you are reading this now, parts of this guidance may already be stale.

## Prompt Injection: Risks, Impact, and Mitigations
Prompt injection remains an open security problem for tool-using agents. It is manageable, but not "solved."

Primary risks:
- Malicious instructions hidden in tool output or remote content.
- Secret exfiltration and unauthorized external calls.
- Unsafe state changes (destructive file/system/API actions).

Consequences:
- Data leakage, account compromise, financial loss, and integrity failures.

Mitigation baseline:
- Least privilege for credentials and tool scopes.
- Allowlist destinations and enforce egress controls.
- Strict input validation and schema enforcement.
- Human confirmation for destructive/high-risk actions.
- Sandboxed execution with resource/time limits.
- Structured logging, audit trails, and replayable runs.
- Output filtering/redaction before model re-ingestion.

Treat every tool output as untrusted input unless explicitly verified.
