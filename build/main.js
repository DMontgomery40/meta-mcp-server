#!/usr/bin/env node
/**
 * meta-mcp-server -- the original MCP server that creates other MCP servers.
 *
 * Built before Anthropic shipped their own mcp-builder skill.
 * Now modernized to align with MCP spec 2025-11-25 and SDK v1.27+.
 *
 * Supports both stdio and streamable-HTTP transports.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { mkdir, writeFile, readFile, access } from "node:fs/promises";
import path from "node:path";
// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------
const FileEntrySchema = z.object({
    path: z.string()
        .min(1, "File path must not be empty")
        .describe("Relative path within the output directory (e.g. 'src/index.ts', 'package.json')"),
    content: z.string()
        .describe("Full text content to write to the file"),
});
const WriteMcpServerInputSchema = z.object({
    outputDir: z.string()
        .min(1, "Output directory must not be empty")
        .describe("Absolute or relative directory path where server files will be created"),
    files: z.array(FileEntrySchema)
        .min(1, "At least one file is required")
        .describe("Array of file entries to write. Each entry needs a relative path and content string."),
});
const ValidateMcpServerInputSchema = z.object({
    outputDir: z.string()
        .min(1, "Output directory must not be empty")
        .describe("Directory path of the MCP server project to validate"),
});
const ListTemplatesInputSchema = z.object({}).strict();
function getTemplates() {
    return [
        {
            name: "minimal-stdio",
            description: "Minimal MCP server with one tool, stdio transport, TypeScript + Zod",
            files: [
                {
                    path: "package.json",
                    content: JSON.stringify({
                        name: "my-mcp-server",
                        version: "1.0.0",
                        type: "module",
                        scripts: { build: "tsc", start: "node build/index.js" },
                        dependencies: { "@modelcontextprotocol/sdk": "^1.27.1", zod: "^3.25.0" },
                        devDependencies: { "@types/node": "^22.10.0", typescript: "^5.7.2" },
                    }, null, 2),
                },
                {
                    path: "tsconfig.json",
                    content: JSON.stringify({
                        compilerOptions: {
                            target: "ES2022", module: "Node16", moduleResolution: "Node16",
                            outDir: "./build", rootDir: "./src", strict: true,
                            esModuleInterop: true, skipLibCheck: true,
                        },
                        include: ["src/**/*"],
                    }, null, 2),
                },
                {
                    path: "src/index.ts",
                    content: `#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({ name: "my-mcp-server", version: "1.0.0" });

server.registerTool("hello", {
  title: "Hello World",
  description: "Returns a greeting. Use this to verify the server is working.",
  inputSchema: z.object({
    name: z.string().default("world").describe("Name to greet"),
  }),
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
}, async ({ name }) => ({
  content: [{ type: "text", text: \`Hello, \${name}!\` }],
}));

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP server running on stdio");
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
`,
                },
            ],
        },
        {
            name: "http-dual-transport",
            description: "MCP server supporting both stdio and streamable-HTTP transports",
            files: [
                {
                    path: "package.json",
                    content: JSON.stringify({
                        name: "my-http-mcp-server",
                        version: "1.0.0",
                        type: "module",
                        scripts: {
                            build: "tsc",
                            start: "node build/index.js",
                            "start:http": "node build/index.js --http",
                        },
                        dependencies: { "@modelcontextprotocol/sdk": "^1.27.1", zod: "^3.25.0" },
                        devDependencies: { "@types/node": "^22.10.0", typescript: "^5.7.2" },
                    }, null, 2),
                },
                {
                    path: "tsconfig.json",
                    content: JSON.stringify({
                        compilerOptions: {
                            target: "ES2022", module: "Node16", moduleResolution: "Node16",
                            outDir: "./build", rootDir: "./src", strict: true,
                            esModuleInterop: true, skipLibCheck: true,
                        },
                        include: ["src/**/*"],
                    }, null, 2),
                },
                {
                    path: "src/index.ts",
                    content: `#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { z } from "zod";

const server = new McpServer({ name: "my-http-mcp-server", version: "1.0.0" });

// Register your tools here
server.registerTool("hello", {
  title: "Hello World",
  description: "Returns a greeting.",
  inputSchema: z.object({ name: z.string().default("world") }),
  annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
}, async ({ name }) => ({
  content: [{ type: "text", text: \`Hello, \${name}!\` }],
}));

async function main() {
  const useHttp = process.argv.includes("--http");
  if (useHttp) {
    const port = parseInt(process.env.PORT || "3000", 10);
    createServer(async (req, res) => {
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: () => randomUUID() });
      await server.connect(transport);
      await transport.handleRequest(req, res);
    }).listen(port, () => {
      console.error(\`MCP server listening on http://localhost:\${port}\`);
    });
  } else {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("MCP server running on stdio");
  }
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
`,
                },
            ],
        },
    ];
}
// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------
async function validateServerProject(outputDir) {
    const issues = [];
    // Check package.json exists
    try {
        const pkgRaw = await readFile(path.join(outputDir, "package.json"), "utf8");
        const pkg = JSON.parse(pkgRaw);
        if (!pkg.dependencies?.["@modelcontextprotocol/sdk"]) {
            issues.push("package.json is missing @modelcontextprotocol/sdk dependency");
        }
        if (!pkg.scripts?.build) {
            issues.push("package.json is missing a 'build' script");
        }
    }
    catch {
        issues.push("package.json not found or not valid JSON");
    }
    // Check tsconfig.json exists
    try {
        await access(path.join(outputDir, "tsconfig.json"));
    }
    catch {
        issues.push("tsconfig.json not found");
    }
    // Check for at least one source file
    try {
        await access(path.join(outputDir, "src"));
    }
    catch {
        issues.push("src/ directory not found");
    }
    return issues;
}
// ---------------------------------------------------------------------------
// Server setup
// ---------------------------------------------------------------------------
const server = new McpServer({ name: "meta-mcp-server", version: "2.0.0" }, { capabilities: { logging: {} } });
// Tool 1: write_mcp_server
server.registerTool("meta_write_mcp_server", {
    title: "Write MCP Server Files",
    description: `Create a new MCP server project by writing files to disk.

Generates the directory structure and all specified files for a new MCP server.
Directories are created recursively as needed.

Args:
  - outputDir (string): Absolute or relative path for the new server project
  - files (array): File entries, each with a relative path and content string

Returns:
  List of created files on success, or a structured error with guidance.

Example:
  outputDir: "/tmp/my-mcp-server"
  files: [
    { path: "package.json", content: "{...}" },
    { path: "src/index.ts", content: "..." }
  ]

IMPORTANT: After generating an MCP server, consider using code-mode or
code-execution workflows to USE it efficiently. Naive tool-calling floods
context with schemas. See: https://blog.cloudflare.com/code-mode/`,
    inputSchema: WriteMcpServerInputSchema,
    annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
    },
}, async (args) => {
    try {
        await mkdir(args.outputDir, { recursive: true });
        const createdFiles = [];
        for (const file of args.files) {
            const fullPath = path.join(args.outputDir, file.path);
            const dir = path.dirname(fullPath);
            await mkdir(dir, { recursive: true });
            await writeFile(fullPath, file.content, "utf8");
            createdFiles.push(file.path);
        }
        return {
            content: [{
                    type: "text",
                    text: [
                        `Successfully created MCP server in ${args.outputDir}:`,
                        ...createdFiles.map(f => `  - ${f}`),
                        "",
                        "Next steps:",
                        "  1. cd " + args.outputDir,
                        "  2. npm install",
                        "  3. npm run build",
                        "  4. npm start",
                        "",
                        "Tip: For efficient usage, consider code-execution workflows",
                        "instead of naive tool-calling. See the README appendix.",
                    ].join("\n"),
                }],
        };
    }
    catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
            content: [{
                    type: "text",
                    text: `Error creating server: ${msg}\n\nTry checking:\n  - Output directory permissions\n  - Disk space availability\n  - Path validity (no illegal characters)`,
                }],
            isError: true,
        };
    }
});
// Tool 2: meta_list_templates
server.registerTool("meta_list_templates", {
    title: "List MCP Server Templates",
    description: `List available MCP server project templates.

Returns a list of ready-to-use templates that can be written with meta_write_mcp_server.
Each template includes a name, description, and the file list.

Use this to explore what templates are available before creating a server.`,
    inputSchema: ListTemplatesInputSchema,
    annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
    },
}, async () => {
    const templates = getTemplates();
    const lines = ["# Available MCP Server Templates\n"];
    for (const t of templates) {
        lines.push(`## ${t.name}`);
        lines.push(t.description);
        lines.push("Files:");
        for (const f of t.files) {
            lines.push(`  - ${f.path}`);
        }
        lines.push("");
    }
    lines.push("To use a template, call meta_write_mcp_server with the template's files.", "Or customize the files before writing.");
    return {
        content: [{ type: "text", text: lines.join("\n") }],
    };
});
// Tool 3: meta_validate_server
server.registerTool("meta_validate_server", {
    title: "Validate MCP Server Project",
    description: `Validate that a directory contains a well-formed MCP server project.

Checks for:
  - package.json with @modelcontextprotocol/sdk dependency
  - tsconfig.json presence
  - src/ directory presence
  - build script in package.json

Args:
  - outputDir (string): Path to the MCP server project directory

Returns:
  Validation result with any issues found, or confirmation that the project looks good.`,
    inputSchema: ValidateMcpServerInputSchema,
    annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
    },
}, async (args) => {
    try {
        const issues = await validateServerProject(args.outputDir);
        if (issues.length === 0) {
            return {
                content: [{
                        type: "text",
                        text: `Project at ${args.outputDir} looks good. No issues found.\n\nNext: run 'npm install && npm run build' to verify it compiles.`,
                    }],
            };
        }
        return {
            content: [{
                    type: "text",
                    text: [
                        `Validation issues in ${args.outputDir}:`,
                        ...issues.map(i => `  - ${i}`),
                        "",
                        "Fix these issues and re-validate.",
                    ].join("\n"),
                }],
            isError: true,
        };
    }
    catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
            content: [{
                    type: "text",
                    text: `Error validating project: ${msg}\n\nCheck that the directory exists and is readable.`,
                }],
            isError: true,
        };
    }
});
// Tool 4: meta_get_template
server.registerTool("meta_get_template", {
    title: "Get MCP Server Template",
    description: `Get the full file contents for a named template.

Returns the complete files array for the specified template, ready to pass
to meta_write_mcp_server or to customize first.

Args:
  - templateName (string): Name of the template (use meta_list_templates to see available names)

Returns:
  JSON with the template's files array, or an error if the template is not found.`,
    inputSchema: z.object({
        templateName: z.string()
            .min(1, "Template name must not be empty")
            .describe("Name of the template to retrieve (e.g. 'minimal-stdio', 'http-dual-transport')"),
    }),
    annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
    },
}, async ({ templateName }) => {
    const templates = getTemplates();
    const template = templates.find(t => t.name === templateName);
    if (!template) {
        const available = templates.map(t => t.name).join(", ");
        return {
            content: [{
                    type: "text",
                    text: `Template '${templateName}' not found.\n\nAvailable templates: ${available}\n\nUse meta_list_templates to see descriptions.`,
                }],
            isError: true,
        };
    }
    return {
        content: [{
                type: "text",
                text: JSON.stringify({
                    name: template.name,
                    description: template.description,
                    files: template.files,
                }, null, 2),
            }],
    };
});
// ---------------------------------------------------------------------------
// Transport startup
// ---------------------------------------------------------------------------
async function main() {
    const useHttp = process.argv.includes("--http");
    if (useHttp) {
        const port = parseInt(process.env.PORT || "3000", 10);
        const httpServer = createServer(async (req, res) => {
            try {
                const transport = new StreamableHTTPServerTransport({
                    sessionIdGenerator: () => randomUUID(),
                });
                await server.connect(transport);
                await transport.handleRequest(req, res);
            }
            catch (error) {
                console.error("HTTP handler error:", error);
                if (!res.headersSent) {
                    res.writeHead(500, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: "Internal server error" }));
                }
            }
        });
        httpServer.listen(port, () => {
            console.error(`meta-mcp-server v2.0.0 listening on http://localhost:${port} (streamable-HTTP)`);
        });
    }
    else {
        const transport = new StdioServerTransport();
        await server.connect(transport);
        console.error("meta-mcp-server v2.0.0 running on stdio");
    }
}
main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map