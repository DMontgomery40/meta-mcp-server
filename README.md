# create-mcp-server

Interactive CLI tool to create Model Context Protocol (MCP) servers. This tool guides you through creating a customized MCP server and sets up a working development environment.

## Quick Start

Create a new MCP server:
\`\`\`bash
# Using npx (recommended)
npx create-mcp-server

# Or install globally
npm install -g create-mcp-server
create-mcp-server
\`\`\`

Follow the interactive prompts to customize your server.

## Features

- Interactive CLI with guided prompts
- Multiple server templates:
  - **Basic**: Simple server with no capabilities (for learning)
  - **Resources**: Server that exposes data to Claude
  - **Tools**: Server that lets Claude perform actions
  - **Full**: Complete server with both resources and tools
- Proper TypeScript setup
- Development workflow with watch mode
- Built-in MCP Inspector integration
- Example implementations

## Usage

When you run the tool, it will guide you through:

1. Server name (package name format)
2. Initial version 
3. Template selection
4. Output directory

The tool will create a complete server project with:
- TypeScript configuration
- Build scripts
- Development tools
- Example implementations
- Testing setup

## Development Workflow

After creating your server:

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start development mode:
   \`\`\`bash
   npm run dev
   \`\`\`

3. Test with MCP Inspector:
   \`\`\`bash
   npm run inspector
   \`\`\`

## Server Templates

### Basic Server
- Minimal implementation
- No capabilities
- Good for learning MCP

### Resource Server
- Exposes data to Claude
- Example resource implementation
- Resource listing and reading

### Tool Server
- Lets Claude perform actions
- Example tool implementation
- Tool listing and execution

### Full Server
- Both resources and tools
- Complete example setup
- Ready for real-world use

## Contributing

1. Clone the repository
2. Install dependencies: \`npm install\`
3. Build: \`npm run build\`
4. Test your changes: \`npm start\`

## Resources

- [MCP Documentation](https://docs.modelcontextprotocol.ai)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector)