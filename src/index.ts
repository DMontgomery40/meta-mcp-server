import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { mkdir, writeFile } from "fs/promises";

// Template definitions - these will be exposed as resources
const TEMPLATES = {
  basic: {
    name: "basic",
    description: "Basic MCP server with no capabilities",
    code: `#!/usr/bin/env node
  import { Server } from "@modelcontextprotocol/sdk/server/index.js";
  import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
  
  const server = new Server(
    {
      name: "{{serverName}}",
      version: "{{version}}",
    },
    {
      capabilities: {},
    }
  );
  
  const transport = new StdioServerTransport();
  await server.connect(transport);`,
  },
  
  resourceOnly: {
    name: "resource-only",
    description: "MCP server with resource capabilities",
    code: `#!/usr/bin/env node
  import { Server } from "@modelcontextprotocol/sdk/server/index.js";
  import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
  import {
    ListResourcesRequestSchema,
    ReadResourceRequestSchema,
  } from "@modelcontextprotocol/sdk/types.js";
  
  const server = new Server(
    {
      name: "{{serverName}}",
      version: "{{version}}",
    },
    {
      capabilities: {
        resources: {},
      },
    }
  );
  
  // Example resource
  const exampleResource = {
    uri: "example://resource",
    name: "Example Resource",
    description: "An example resource",
    mimeType: "text/plain",
  };
  
  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: [exampleResource],
  }));
  
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    if (request.params.uri === exampleResource.uri) {
      return {
        contents: [{
          uri: request.params.uri,
          mimeType: "text/plain",
          text: "Example resource content",
        }],
      };
    }
    throw new Error(\`Resource not found: \${request.params.uri}\`);
  });
  
  const transport = new StdioServerTransport();
  await server.connect(transport);`,
  },
  
  toolOnly: {
    name: "tool-only",
    description: "MCP server with tool capabilities",
    code: `#!/usr/bin/env node
  import { Server } from "@modelcontextprotocol/sdk/server/index.js";
  import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
  import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
  } from "@modelcontextprotocol/sdk/types.js";
  
  const server = new Server(
    {
      name: "{{serverName}}",
      version: "{{version}}",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );
  
  // Example tool
  const exampleTool = {
    name: "example_tool",
    description: "An example tool",
    inputSchema: {
      type: "object",
      properties: {
        input: {
          type: "string",
          description: "Input string",
        },
      },
      required: ["input"],
    },
  };
  
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [exampleTool],
  }));
  
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "example_tool") {
      const input = request.params.arguments?.input;
      return {
        content: [{
          type: "text",
          text: \`Processed: \${input}\`,
        }],
      };
    }
    throw new Error(\`Tool not found: \${request.params.name}\`);
  });
  
  const transport = new StdioServerTransport();
  await server.connect(transport);`,
  },
  
  full: {
    name: "full",
    description: "Full MCP server with both resource and tool capabilities",
    code: `#!/usr/bin/env node
  import { Server } from "@modelcontextprotocol/sdk/server/index.js";
  import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
  import {
    CallToolRequestSchema,
    ListResourcesRequestSchema,
    ListToolsRequestSchema,
    ReadResourceRequestSchema,
  } from "@modelcontextprotocol/sdk/types.js";
  
  const server = new Server(
    {
      name: "{{serverName}}",
      version: "{{version}}",
    },
    {
      capabilities: {
        resources: {},
        tools: {},
      },
    }
  );
  
  // Example resource
  const exampleResource = {
    uri: "example://resource",
    name: "Example Resource",
    description: "An example resource",
    mimeType: "text/plain",
  };
  
  // Example tool
  const exampleTool = {
    name: "example_tool",
    description: "An example tool",
    inputSchema: {
      type: "object",
      properties: {
        input: {
          type: "string",
          description: "Input string",
        },
      },
      required: ["input"],
    },
  };
  
  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: [exampleResource],
  }));
  
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    if (request.params.uri === exampleResource.uri) {
      return {
        contents: [{
          uri: request.params.uri,
          mimeType: "text/plain",
          text: "Example resource content",
        }],
      };
    }
    throw new Error(\`Resource not found: \${request.params.uri}\`);
  });
  
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [exampleTool],
  }));
  
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "example_tool") {
      const input = request.params.arguments?.input;
      return {
        content: [{
          type: "text",
          text: \`Processed: \${input}\`,
        }],
      };
    }
    throw new Error(\`Tool not found: \${request.params.name}\`);
  });
  
  const transport = new StdioServerTransport();
  await server.connect(transport);`,
  },
};
  
// Package.json template
const PACKAGE_JSON_TEMPLATE = {
  name: "{{serverName}}",
  version: "{{version}}",
  description: "A Model Context Protocol server",
  private: true,
  type: "module",
  bin: {
    "{{serverName}}": "./build/index.js"
  },
  files: ["build"],
  scripts: {
    build: "tsc && node -e \\\"require('fs').chmodSync('build/index.js', '755')\\\"",
    prepare: "npm run build",
    watch: "tsc --watch",
    inspector: "npx @modelcontextprotocol/inspector build/index.js"
  },
  dependencies: {
    "@modelcontextprotocol/sdk": "0.6.0"
  },
  devDependencies: {
    "@types/node": "^20.11.24",
    "typescript": "^5.3.3"
  }
};
  
// TypeScript config template
const TSCONFIG_TEMPLATE = {
  compilerOptions: {
    target: "ES2022",
    module: "ES2022",
    moduleResolution: "bundler",
    esModuleInterop: true,
    outDir: "build",
    sourceMap: true,
    strict: true,
    skipLibCheck: true
  },
  include: ["src/**/*"]
};
  
// Main tool definition for creating MCP servers
const CREATE_SERVER_TOOL: Tool = {
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
    this.server = new Server(
      {
        name: "meta-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );
  
    this.setupHandlers();
  }
  
  private setupHandlers(): void {
    // List available templates as resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: Object.values(TEMPLATES).map(template => ({
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
      const template = TEMPLATES[templateName as keyof typeof TEMPLATES];
      
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
      tools: [CREATE_SERVER_TOOL],
    }));
  
    // Handle server creation
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name !== "create_mcp_server") {
        throw new Error(`Unknown tool: ${request.params.name}`);
      }
  
      const args = request.params.arguments as {
        name: string;
        version: string;
        template: string;
        outputDir: string;
      };
  
      try {
        await this.generateServer(args);
        return {
          content: [{
            type: "text",
            text: `Successfully generated MCP server in ${args.outputDir}`,
          }],
        };
      } catch (error) {
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
  
  private async generateServer(args: {
    name: string;
    version: string;
    template: string;
    outputDir: string;
  }): Promise<void> {
    // Create directory structure
    await mkdir(args.outputDir, { recursive: true });
    await mkdir(`${args.outputDir}/src`, { recursive: true });
  
    // Get template
    const template = TEMPLATES[args.template as keyof typeof TEMPLATES];
    if (!template) {
      throw new Error(`Invalid template: ${args.template}`);
    }
  
    // Generate server code from template
    const serverCode = template.code
      .replace(/{{serverName}}/g, args.name)
      .replace(/{{version}}/g, args.version);
  
    // Generate package.json
    const packageJson = JSON.stringify({
      ...PACKAGE_JSON_TEMPLATE,
      name: args.name,
      version: args.version,
      bin: {
        [args.name]: "./build/index.js"
      }
    }, null, 2);
  
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