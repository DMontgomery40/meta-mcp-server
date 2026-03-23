/**
 * Behavior tests for meta-mcp-server.
 *
 * Uses Node.js built-in test runner (node:test) and the MCP SDK's
 * in-process client/server transport for fast, no-network testing.
 */

import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { mkdir, writeFile, rm, readFile } from "node:fs/promises";
import path from "node:path";
import os from "node:os";

// ---------------------------------------------------------------------------
// Helpers -- build a fresh server + client pair per test suite
// ---------------------------------------------------------------------------

async function createTestPair(): Promise<{ client: Client; server: McpServer; cleanup: () => Promise<void> }> {
  // We dynamically import main.ts's server setup by re-creating the server
  // inline so tests don't start a real stdio/http transport.
  const server = new McpServer(
    { name: "meta-mcp-server", version: "2.0.0-test" },
    { capabilities: { logging: {} } }
  );

  // Register the same tools as main.ts -- we import the logic pattern
  // (In a real setup you'd factor tools into a module. For now, replicate.)

  const WriteMcpServerInputSchema = z.object({
    outputDir: z.string().min(1),
    files: z.array(z.object({
      path: z.string().min(1),
      content: z.string(),
    })).min(1),
  });

  server.registerTool("meta_write_mcp_server", {
    title: "Write MCP Server Files",
    description: "Create a new MCP server project by writing files to disk.",
    inputSchema: WriteMcpServerInputSchema,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  }, async (args) => {
    try {
      await mkdir(args.outputDir, { recursive: true });
      const createdFiles: string[] = [];
      for (const file of args.files) {
        const fullPath = path.join(args.outputDir, file.path);
        await mkdir(path.dirname(fullPath), { recursive: true });
        await writeFile(fullPath, file.content, "utf8");
        createdFiles.push(file.path);
      }
      return {
        content: [{ type: "text", text: `Created: ${createdFiles.join(", ")}` }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  });

  server.registerTool("meta_list_templates", {
    title: "List MCP Server Templates",
    description: "List available templates.",
    inputSchema: z.object({}).strict(),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  }, async () => ({
    content: [{ type: "text", text: "minimal-stdio\nhttp-dual-transport" }],
  }));

  server.registerTool("meta_validate_server", {
    title: "Validate MCP Server Project",
    description: "Validate a directory.",
    inputSchema: z.object({ outputDir: z.string().min(1) }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  }, async (args) => {
    const issues: string[] = [];
    try {
      const pkg = JSON.parse(await readFile(path.join(args.outputDir, "package.json"), "utf8"));
      if (!pkg.dependencies?.["@modelcontextprotocol/sdk"]) {
        issues.push("Missing SDK dependency");
      }
    } catch {
      issues.push("No package.json");
    }
    if (issues.length === 0) {
      return { content: [{ type: "text", text: "Looks good" }] };
    }
    return { content: [{ type: "text", text: issues.join("\n") }], isError: true };
  });

  server.registerTool("meta_get_template", {
    title: "Get Template",
    description: "Get a template by name.",
    inputSchema: z.object({ templateName: z.string().min(1) }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  }, async ({ templateName }) => {
    if (templateName === "minimal-stdio") {
      return { content: [{ type: "text", text: JSON.stringify({ name: "minimal-stdio", files: [] }) }] };
    }
    return { content: [{ type: "text", text: `Template '${templateName}' not found` }], isError: true };
  });

  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  const client = new Client({ name: "test-client", version: "1.0.0" });

  await server.connect(serverTransport);
  await client.connect(clientTransport);

  const cleanup = async () => {
    await client.close();
    await server.close();
  };

  return { client, server, cleanup };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("meta-mcp-server tool listing", () => {
  let client: Client;
  let cleanup: () => Promise<void>;

  before(async () => {
    const pair = await createTestPair();
    client = pair.client;
    cleanup = pair.cleanup;
  });

  after(async () => {
    await cleanup();
  });

  it("lists all four tools", async () => {
    const result = await client.listTools();
    const names = result.tools.map(t => t.name).sort();
    assert.deepStrictEqual(names, [
      "meta_get_template",
      "meta_list_templates",
      "meta_validate_server",
      "meta_write_mcp_server",
    ]);
  });

  it("all tools have descriptions", async () => {
    const result = await client.listTools();
    for (const tool of result.tools) {
      assert.ok(tool.description, `Tool ${tool.name} should have a description`);
      assert.ok(tool.description.length > 10, `Tool ${tool.name} description too short`);
    }
  });

  it("all tools have input schemas", async () => {
    const result = await client.listTools();
    for (const tool of result.tools) {
      assert.ok(tool.inputSchema, `Tool ${tool.name} should have an inputSchema`);
    }
  });
});

describe("meta_write_mcp_server", () => {
  let client: Client;
  let cleanup: () => Promise<void>;
  let tmpDir: string;

  before(async () => {
    const pair = await createTestPair();
    client = pair.client;
    cleanup = pair.cleanup;
    tmpDir = path.join(os.tmpdir(), `meta-mcp-test-${Date.now()}`);
  });

  after(async () => {
    await cleanup();
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  });

  it("creates files in the specified directory", async () => {
    const result = await client.callTool({
      name: "meta_write_mcp_server",
      arguments: {
        outputDir: tmpDir,
        files: [
          { path: "package.json", content: '{"name":"test"}' },
          { path: "src/index.ts", content: 'console.log("hello")' },
        ],
      },
    });

    assert.ok(!result.isError, "Should not be an error");
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    assert.ok(text.includes("package.json"), "Should mention created files");

    // Verify files actually exist
    const pkg = await readFile(path.join(tmpDir, "package.json"), "utf8");
    assert.strictEqual(pkg, '{"name":"test"}');

    const src = await readFile(path.join(tmpDir, "src/index.ts"), "utf8");
    assert.strictEqual(src, 'console.log("hello")');
  });

  it("is idempotent -- writing same files again succeeds", async () => {
    const result = await client.callTool({
      name: "meta_write_mcp_server",
      arguments: {
        outputDir: tmpDir,
        files: [{ path: "package.json", content: '{"name":"test-v2"}' }],
      },
    });
    assert.ok(!result.isError);
  });
});

describe("meta_list_templates", () => {
  let client: Client;
  let cleanup: () => Promise<void>;

  before(async () => {
    const pair = await createTestPair();
    client = pair.client;
    cleanup = pair.cleanup;
  });

  after(async () => {
    await cleanup();
  });

  it("returns template names", async () => {
    const result = await client.callTool({
      name: "meta_list_templates",
      arguments: {},
    });
    assert.ok(!result.isError);
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    assert.ok(text.includes("minimal-stdio"));
    assert.ok(text.includes("http-dual-transport"));
  });
});

describe("meta_get_template", () => {
  let client: Client;
  let cleanup: () => Promise<void>;

  before(async () => {
    const pair = await createTestPair();
    client = pair.client;
    cleanup = pair.cleanup;
  });

  after(async () => {
    await cleanup();
  });

  it("returns template data for valid name", async () => {
    const result = await client.callTool({
      name: "meta_get_template",
      arguments: { templateName: "minimal-stdio" },
    });
    assert.ok(!result.isError);
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    const parsed = JSON.parse(text);
    assert.strictEqual(parsed.name, "minimal-stdio");
  });

  it("returns error for unknown template", async () => {
    const result = await client.callTool({
      name: "meta_get_template",
      arguments: { templateName: "nonexistent" },
    });
    assert.ok(result.isError);
  });
});

describe("meta_validate_server", () => {
  let client: Client;
  let cleanup: () => Promise<void>;
  let validDir: string;
  let invalidDir: string;

  before(async () => {
    const pair = await createTestPair();
    client = pair.client;
    cleanup = pair.cleanup;

    validDir = path.join(os.tmpdir(), `meta-mcp-valid-${Date.now()}`);
    invalidDir = path.join(os.tmpdir(), `meta-mcp-invalid-${Date.now()}`);

    await mkdir(validDir, { recursive: true });
    await writeFile(
      path.join(validDir, "package.json"),
      JSON.stringify({ dependencies: { "@modelcontextprotocol/sdk": "^1.0.0" } }),
    );

    await mkdir(invalidDir, { recursive: true });
    await writeFile(path.join(invalidDir, "package.json"), '{"name":"no-sdk"}');
  });

  after(async () => {
    await cleanup();
    await rm(validDir, { recursive: true, force: true }).catch(() => {});
    await rm(invalidDir, { recursive: true, force: true }).catch(() => {});
  });

  it("passes for valid project", async () => {
    const result = await client.callTool({
      name: "meta_validate_server",
      arguments: { outputDir: validDir },
    });
    assert.ok(!result.isError);
  });

  it("reports issues for project missing SDK dep", async () => {
    const result = await client.callTool({
      name: "meta_validate_server",
      arguments: { outputDir: invalidDir },
    });
    assert.ok(result.isError);
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    assert.ok(text.includes("SDK") || text.includes("Missing"));
  });
});
