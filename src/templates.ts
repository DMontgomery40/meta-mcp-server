export type TemplateKey = 'basic' | 'resource-only' | 'tool-only' | 'full';

export const TEMPLATES: Record<TemplateKey, {
  name: string;
  description: string;
  code: string;
}> = {
  basic: {
    name: "basic",
    description: "Basic MCP server with no capabilities",
    code: `#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

async function main() {
  const server = new Server(
    {
      name: "{{serverName}}",
      version: "{{version}}",
    },
    {
      capabilities: {},
    }
  );

  // Setup error handling
  server.onerror = (error) => {
    console.error("[Server Error]", error);
  };

  process.on('SIGINT', async () => {
    await server.close();
    process.exit(0);
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error("{{serverName}} running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});`
  },
  "resource-only": {
    name: "resource-only",
    description: "MCP server with resource capabilities",
    code: `#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

async function main() {
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

  // Setup error handling
  server.onerror = (error) => {
    console.error("[Server Error]", error);
  };

  process.on('SIGINT', async () => {
    await server.close();
    process.exit(0);
  });

  // Example resource implementations
  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: [
      {
        uri: "example://resource",
        name: "Example Resource",
        description: "An example resource to demonstrate functionality",
        mimeType: "text/plain"
      }
    ]
  }));

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    if (request.params.uri !== "example://resource") {
      throw new Error(\`Unknown resource: \${request.params.uri}\`);
    }

    return {
      contents: [{
        uri: request.params.uri,
        mimeType: "text/plain",
        text: "This is an example resource content. Replace with your own implementation."
      }]
    };
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error("{{serverName}} running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});`
  },
  "tool-only": {
    name: "tool-only",
    description: "MCP server with tool capabilities",
    code: `#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

const EXAMPLE_TOOL: Tool = {
  name: "example_tool",
  description: "An example tool to demonstrate functionality",
  inputSchema: {
    type: "object",
    properties: {
      message: {
        type: "string",
        description: "Message to echo back",
      }
    },
    required: ["message"]
  }
};

async function main() {
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

  // Setup error handling
  server.onerror = (error) => {
    console.error("[Server Error]", error);
  };

  process.on('SIGINT', async () => {
    await server.close();
    process.exit(0);
  });

  // Example tool implementations
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [EXAMPLE_TOOL]
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name !== "example_tool") {
      throw new Error(\`Unknown tool: \${request.params.name}\`);
    }

    const args = request.params.arguments as { message: string };
    return {
      content: [{
        type: "text",
        text: \`Received message: \${args.message}\`
      }]
    };
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error("{{serverName}} running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});`
  },
  full: {
    name: "full",
    description: "MCP server with all capabilities",
    code: `#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

const EXAMPLE_TOOL: Tool = {
  name: "example_tool",
  description: "An example tool to demonstrate functionality",
  inputSchema: {
    type: "object",
    properties: {
      message: {
        type: "string",
        description: "Message to echo back",
      }
    },
    required: ["message"]
  }
};

async function main() {
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

  // Setup error handling
  server.onerror = (error) => {
    console.error("[Server Error]", error);
  };

  process.on('SIGINT', async () => {
    await server.close();
    process.exit(0);
  });

  // Example resource implementations
  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: [
      {
        uri: "example://resource",
        name: "Example Resource",
        description: "An example resource to demonstrate functionality",
        mimeType: "text/plain"
      }
    ]
  }));

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    if (request.params.uri !== "example://resource") {
      throw new Error(\`Unknown resource: \${request.params.uri}\`);
    }

    return {
      contents: [{
        uri: request.params.uri,
        mimeType: "text/plain",
        text: "This is an example resource content. Replace with your own implementation."
      }]
    };
  });

  // Example tool implementations
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [EXAMPLE_TOOL]
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name !== "example_tool") {
      throw new Error(\`Unknown tool: \${request.params.name}\`);
    }

    const args = request.params.arguments as { message: string };
    return {
      content: [{
        type: "text",
        text: \`Received message: \${args.message}\`
      }]
    };
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error("{{serverName}} running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});`
  }
};

export const PACKAGE_JSON_TEMPLATE = {
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
    build: "tsc && node -e \"require('fs').chmodSync('build/index.js', '755')\"",
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

export const TSCONFIG_TEMPLATE = {
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