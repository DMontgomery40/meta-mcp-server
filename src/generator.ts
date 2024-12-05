interface GeneratorOptions {
    description: string;
    outputPath: string;
    name?: string;
    version: string;
}

interface GeneratedFiles {
    [path: string]: string;
    capabilities: string;  // Description of implemented capabilities
}

// Default package.json template
const BASE_PACKAGE_JSON = {
    type: "module",
    private: true,
    scripts: {
        build: "tsc",
        dev: "tsc --watch"
    },
    dependencies: {
        "@modelcontextprotocol/sdk": "0.6.0"
    },
    devDependencies: {
        "@types/node": "^20.11.24",
        "typescript": "^5.3.3"
    }
};

// Default tsconfig.json
const TSCONFIG = {
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

/**
 * Analyzes a natural language description to determine what capabilities the server needs
 */
function analyzeDescription(description: string) {
    const needsResources = (
        description.toLowerCase().includes("resource") ||
        description.toLowerCase().includes("expose data") ||
        description.toLowerCase().includes("provide data") ||
        description.toLowerCase().includes("share data") ||
        description.toLowerCase().includes("serve files") ||
        description.toLowerCase().includes("serve content")
    );

    const needsTools = (
        description.toLowerCase().includes("tool") ||
        description.toLowerCase().includes("action") ||
        description.toLowerCase().includes("perform") ||
        description.toLowerCase().includes("execute") ||
        description.toLowerCase().includes("run") ||
        description.toLowerCase().includes("do something") ||
        description.toLowerCase().includes("function")
    );

    const capabilities = [];
    const imports = ['Server', 'StdioServerTransport'];

    if (needsResources) {
        capabilities.push('resources: {}');
        imports.push('ListResourcesRequestSchema', 'ReadResourceRequestSchema');
    }

    if (needsTools) {
        capabilities.push('tools: {}');
        imports.push('ListToolsRequestSchema', 'CallToolRequestSchema', 'Tool');
    }

    return {
        needsResources,
        needsTools,
        capabilities: capabilities.length ? `{\n    ${capabilities.join(',\n    ')}\n}` : "{}",
        imports: imports.join(', ')
    };
}

/**
 * Generates example resource implementations based on the description
 */
function generateResources(description: string): string {
    return `
        // Example resource implementations
        server.setRequestHandler(ListResourcesRequestSchema, async () => ({
            resources: [
                {
                    uri: "example://resource",
                    name: "Example Resource",
                    description: "Example resource - customize this implementation",
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
                    text: "Example resource content - implement your resource here"
                }]
            };
        });`;
}

/**
 * Generates example tool implementations based on the description
 */
function generateTools(description: string): string {
    // TODO: Use better NLP to generate more specific tools
    return `
    const EXAMPLE_TOOL: Tool = {
        name: "example_tool",
        description: "Example tool - customize this implementation",
        inputSchema: {
            type: "object",
            properties: {
                input: {
                    type: "string",
                    description: "Input parameter",
                }
            },
            required: ["input"]
        }
    };

    // Example tool implementations
    server.setRequestHandler(ListToolsRequestSchema, async () => ({
        tools: [EXAMPLE_TOOL]
    }));

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        if (request.params.name !== "example_tool") {
            throw new Error(\`Unknown tool: \${request.params.name}\`);
        }

        const args = request.params.arguments as { input: string };
        return {
            content: [{
                type: "text",
                text: \`Tool executed with input: \${args.input}\`
            }]
        };
    });`;
}
