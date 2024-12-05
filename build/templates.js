export const TEMPLATES = {
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
await server.connect(transport);`
    },
    "resource-only": {
        name: "resource-only",
        description: "MCP server with resource capabilities",
        code: `#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server(
  {
    name: "{{serverName}}",
    version: "{{version}}",
  },
  {
    capabilities: {
      resource: true
    },
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);`
    },
    "tool-only": {
        name: "tool-only",
        description: "MCP server with tool capabilities",
        code: `#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server(
  {
    name: "{{serverName}}",
    version: "{{version}}",
  },
  {
    capabilities: {
      tool: true
    },
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);`
    },
    full: {
        name: "full",
        description: "MCP server with all capabilities",
        code: `#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server(
  {
    name: "{{serverName}}",
    version: "{{version}}",
  },
  {
    capabilities: {
      resource: true,
      tool: true
    },
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);`
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
//# sourceMappingURL=templates.js.map