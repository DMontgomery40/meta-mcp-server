"use strict";
const CREATE_SERVER_TOOL = {
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
    server;
    constructor() {
        this.server = new index.js.Server({
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
        this.server.setRequestHandler(types_js_1.ListResourcesRequestSchema, () => __awaiter(this, void 0, void 0, function* () {
            return ({
                resources: Object.values(TEMPLATES).map(template => ({
                    uri: `template://${template.name}`,
                    name: `Template: ${template.name}`,
                    description: template.description,
                    mimeType: "text/plain",
                })),
            });
        }));
        // Read template contents
        this.server.setRequestHandler(types_js_1.ReadResourceRequestSchema, (request) => __awaiter(this, void 0, void 0, function* () {
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
        }));
        // List available tools
        this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, () => __awaiter(this, void 0, void 0, function* () {
            return ({
                tools: [CREATE_SERVER_TOOL],
            });
        }));
        // Handle server creation
        this.server.setRequestHandler(types_js_1.CallToolRequestSchema, (request) => __awaiter(this, void 0, void 0, function* () {
            if (request.params.name !== "create_mcp_server") {
                throw new Error(`Unknown tool: ${request.params.name}`);
            }
            const args = request.params.arguments;
            try {
                yield this.generateServer(args);
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
        }));
    }
    generateServer(args) {
        return __awaiter(this, void 0, void 0, function* () {
            // Create directory structure
            yield (0, promises_1.mkdir)(args.outputDir, { recursive: true });
            yield (0, promises_1.mkdir)(`${args.outputDir}/src`, { recursive: true });
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
            yield (0, promises_1.writeFile)(`${args.outputDir}/src/index.ts`, serverCode);
            yield (0, promises_1.writeFile)(`${args.outputDir}/package.json`, packageJson);
            yield (0, promises_1.writeFile)(`${args.outputDir}/tsconfig.json`, tsconfig);
            // Create basic README.md
            yield (0, promises_1.writeFile)(`${args.outputDir}/README.md`, readme);
            // Create .gitignore
            const gitignore = `node_modules/
  build/
  *.log
  `;
            yield (0, promises_1.writeFile)(`${args.outputDir}/.gitignore`, gitignore);
        });
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const transport = new stdio_js_1.StdioServerTransport();
            yield this.server.connect(transport);
            console.error("Meta MCP Server running on stdio");
        });
    }
}
// Start the server
const server = new MetaMCPServer();
server.run().catch(console.error);
//# sourceMappingURL=main.js.map