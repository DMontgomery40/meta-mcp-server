#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { mkdir, writeFile, readFile } from "fs/promises";
import path from 'path';
import { fileURLToPath } from 'url';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CREATE_MCP_TOOL = {
    name: "write_mcp_server",
    description: "Write files for an MCP server based on our discussion with the user",
    inputSchema: {
        type: "object",
        properties: {
            outputDir: {
                type: "string",
                description: "Directory where server files should be created"
            },
            files: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        path: { type: "string" },
                        content: { type: "string" }
                    },
                    required: ["path", "content"]
                }
            }
        },
        required: ["outputDir", "files"]
    }
};

class MetaServer {
    private server: Server;

    constructor() {
        this.server = new Server(
            {
                name: "meta-mcp-server",
                version: "1.0.0",
            },
            {
                capabilities: {
                    tools: {}
                }
            }
        );

        this.setupHandlers();
    }

    private setupHandlers(): void {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [CREATE_MCP_TOOL]
        }));

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            if (request.params.name !== "write_mcp_server") {
                throw new Error(`Unknown tool: ${request.params.name}`);
            }

            const args = request.params.arguments as {
                outputDir: string;
                files: Array<{
                    path: string;
                    content: string;
                }>;
            };

            try {
                await mkdir(args.outputDir, { recursive: true });
                const createdFiles = [];

                for (const file of args.files) {
                    const fullPath = `${args.outputDir}/${file.path}`;
                    await mkdir(fullPath.substring(0, fullPath.lastIndexOf('/')), { recursive: true });
                    await writeFile(fullPath, file.content);
                    createdFiles.push(file.path);
                }
                return {
                    content: [{
                        type: "text",
                        text: `Successfully created MCP server:\n${createdFiles.map(f => `- ${f}`).join('\n')}`
                    }]
                };

            } catch (error) {
                console.error("Error creating server:", error);
                return {
                    content: [{
                        type: "text",
                        text: `Failed to create server: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    isError: true
                };
            }
        });
    }

    async run(): Promise<void> {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);

        try {
            // Load and output the system prompt
            const promptPath = path.join(__dirname, '..', 'src', 'SYSTEM_PROMPT.md');
            const systemPrompt = await readFile(promptPath, 'utf8');
            
            // Output it to stderr so it doesn't interfere with MCP communication
            console.error(`
=================================================================
LOADING META MCP SERVER SYSTEM PROMPT - CRITICAL INSTRUCTIONS
=================================================================

${systemPrompt}

=================================================================
END SYSTEM PROMPT - PROCEEDING WITH SERVER INITIALIZATION
=================================================================`);

            // Remind about knowledge persistence
            console.error(`
CRITICAL REMINDER: 
- Create new knowledge graph
- Parse and store system prompt in graph
- Set up SQL persistence
- Auto-save every ~5k tokens
`);

        } catch (error) {
            console.error("Failed to load system prompt:", error);
            process.exit(1);
        }
    }
}

// Start the server
const server = new MetaServer();
server.run().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});