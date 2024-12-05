# Meta MCP Server

A tool for generating Model Context Protocol (MCP) servers based on templates.

## Usage

### Installation

```bash
npm install
npm run build
```

### Running

You can run the server directly:
```bash
node build/main.js
```

Or use MCP Inspector to test:
```bash
npm run inspector
```

## Features

The meta-server provides:

1. Different server templates:
   - `basic`: Basic MCP server with no capabilities
   - `resource-only`: Server with resource capabilities
   - `tool-only`: Server with tool capabilities 
   - `full`: Server with both resource and tool capabilities

2. Resources:
   - All templates are exposed as resources
   - Access template code via the template:// URI scheme

3. Tools:
   - `create_mcp_server`: Generate a new MCP server based on a template

## Generating Servers

To generate a new server, use the `create_mcp_server` tool with:

- `name`: Package name for your server (e.g., "my-mcp-server")
- `version`: Initial version (e.g., "1.0.0")
- `template`: Which template to use ("basic", "resource-only", "tool-only", or "full")
- `outputDir`: Where to generate the server

## Generated Server Structure

Each generated server includes:

- `src/index.ts`: Main server implementation
- `package.json`: NPM configuration
- `tsconfig.json`: TypeScript configuration
- `README.md`: Usage instructions
- `.gitignore`: Git ignore rules

## Development

All templates include:

- Proper error handling
- Process cleanup
- Logging setup
- Basic examples
- Inspector integration
