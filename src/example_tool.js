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
                    text: `Processed: ${input}`
                }],
        };
    }
    throw new Error(`Tool not found: ${request.params.name}`);
});
const transport = new StdioServerTransport();
await server.connect(transport);
`,
    },
    full: {
        name: "full",
        description: "Full MCP server with both resource and tool capabilities",
        code: `;
!/usr/bin / env;
node;
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
const server = new Server({
    name: "{{serverName}}",
    version: "{{version}}",
}, {
    capabilities: {
        resources: {},
        tools: {},
    },
});
//# sourceMappingURL=example_tool.js.map