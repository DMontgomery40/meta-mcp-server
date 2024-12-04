import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { mkdir, writeFile } from "fs/promises";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { TEMPLATES, PACKAGE_JSON_TEMPLATE, TSCONFIG_TEMPLATE } from "./templates.js";

interface Template {
  name: string;
  description: string;
  code: string;
}

interface ServerArgs {
  name: string;
  version: string;
  template: string;
  outputDir: string;
}

const META_SERVER_TOOL: Tool = {
  name: "create_mcp_server",
  description: "Create a new MCP server from template",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Name of the server (package name format)",
      },
      version: {
        type: "string",
        description: "Server version (semver format)",
      },
      template: {
        type: "string",
        description: "Template to use (basic, resource-only, tool-only, or full)",
        enum: ["basic", "resource-only", "tool-only", "full"],
      },
      outputDir: {
        type: "string",
        description: "Directory where the server should be generated",
      },
    },
    required: ["name", "version", "template", "outputDir"],
  },
};

class MetaMCPServer {
  private server: Server;
  constructor() {
    this.server = new Server({
      name: "meta-mcp-server",
      version: "1.0.0",
    }, {
      capabilities: {
        resources: {},
        tools: {},
      },
    });
    this.setupHandlers();
  }
  setupHandlers() {
    // List available templates as resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: Object.values(TEMPLATES).map((template: Template) => ({
        uri: `template://${template.name}`,
        name: `Template: ${template.name}`,
        description: template.description,
        mimeType: "text/plain",
      })),
    }));
    // Read template contents
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const uri = request.params.uri;
      const match = uri.match(/^template:\/\/(.+)$/);
      if (!match) {
        throw new Error(`Invalid resource URI: ${uri}`);
      }
      const templateName = match[1];
      const template = TEMPLATES[templateName];
      if (!template) {
        throw new Error(`Template not found: ${templateName}`);
      }
      return {
        contents: [{
          uri,
          mimeType: "text/plain",
          text: template.code,
        }],
      };
    });
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [META_SERVER_TOOL],
    }));
    // Handle server creation
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name !== "create_mcp_server") {
        throw new Error(`Unknown tool: ${request.params.name}`);
      }
      const args = request.params.arguments;
      try {
        await this.generateServer(args);
        return {
          content: [{
            type: "text",
            text: `Successfully generated MCP server in ${args.outputDir}`,
          }],
        };
      }
      catch (error) {
        return {
          content: [{
            type: "text",
            text: `Failed to generate server: ${error instanceof Error ? error.message : String(error)}`,
          }],
          isError: true,
        };
      }
    });
  }
  async generateServer(args: ServerArgs): Promise<void> {
    // Create directory structure
    await mkdir(args.outputDir, { recursive: true });
    await mkdir(`${args.outputDir}/src`, { recursive: true });
    // Get template
    const template = TEMPLATES[args.template];
    if (!template) {
      throw new Error(`Invalid template: ${args.template}`);
    }
    // Generate server code from template
    const serverCode = template.code
      .replace(/{{serverName}}/g, args.name)
      .replace(/{{version}}/g, args.version);
    // Generate package.json
    const packageJson = JSON.stringify(Object.assign(Object.assign({}, PACKAGE_JSON_TEMPLATE), { name: args.name, version: args.version, bin: {
      [args.name]: "./build/index.js"
    } }), null, 2);
    // Generate tsconfig.json
    const tsconfig = JSON.stringify(TSCONFIG_TEMPLATE, null, 2);
    // Write files
    await writeFile(`${args.outputDir}/src/index.ts`, serverCode);
    await writeFile(`${args.outputDir}/package.json`, packageJson);
    await writeFile(`${args.outputDir}/tsconfig.json`, tsconfig);
    // Create basic README.md
    const readme = `# ${args.name}
    
A Model Context Protocol server generated using meta-mcp-server.

## Installation

\`\`\`bash
npm install
npm run build
\`\`\`

## Usage

Run directly:
\`\`\`bash
node build/index.js
\`\`\`

Test with MCP Inspector:
\`\`\`bash
npm run inspector
\`\`\`
`;
    await writeFile(`${args.outputDir}/README.md`, readme);
    // Create .gitignore
    const gitignore = `node_modules/
  build/
  *.log
  `;
    await writeFile(`${args.outputDir}/.gitignore`, gitignore);
  }
  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Meta MCP Server running on stdio");
  }
}
// Start the server
const server = new MetaMCPServer();
server.run().catch(console.error);
