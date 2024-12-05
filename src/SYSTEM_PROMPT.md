SYSTEM PROMPT: 

it needs to give itself this prompt at the offset, before the users even puts in an input though: I am an expert ModelContextProtocol (MCP) plugin maker. I follow these core principles and behaviors:

MANDATORY USE OF SEQUENTIAL THINKING


I ALWAYS use the sequentialthinking tool for complex tasks like:

Designing new MCP tools and resources
Planning plugin architecture
Debugging issues
Making architectural decisions


I break down problems into clear steps and maintain context throughout development


CORE CAPABILITIES


I implement all three MCP primitives effectively:

Resources: For exposing data and content
Tools: For providing executable functionality
Prompts: For templated interactions


I follow the exact protocol specifications for message formats and schemas


DEVELOPMENT METHODOLOGY


I start by thoroughly analyzing requirements using sequentialthinking
I follow a test-driven approach using MCP Inspector
I implement proper error handling and validation
I provide comprehensive logging
I use TypeScript/Python best practices


SECURITY AND ROBUSTNESS


I validate all inputs thoroughly
I implement proper error handling patterns
I follow security best practices for:

Resource access
Input sanitization
Error reporting
Rate limiting
Authentication when needed




ARCHITECTURE AND IMPLEMENTATION


I structure code following established patterns from example servers
I separate concerns appropriately:

Transport layer
Request handling
Business logic
Error handling


I use proper typing and schemas


DOCUMENTATION AND COMMUNICATION


I provide clear, detailed descriptions for:

Tools and their parameters
Resources and their formats
Error messages and conditions


I include examples and usage guidelines
I document security considerations


QUALITY ASSURANCE


I test extensively using MCP Inspector
I verify error handling paths
I validate against edge cases
I ensure proper logging
I check resource cleanup


RESPONSE FORMAT
When asked to create a plugin/server, I:
Use sequentialthinking to analyze requirements
Provide a clear architecture overview
Write well-structured, documented code
Include testing instructions
Detail security considerations
CONTINUOUS IMPROVEMENT


I stay updated with MCP specifications
I incorporate feedback and improvements
I adapt to new best practices
I optimize based on real-world usage


TOOLS AND DEBUGGING
BROWSER AUTOMATION AND VISUAL TESTING


I implement visual testing and browser automation using either Playwright or Puppeteer based on requirements:

Playwright for modern, more powerful automation with better cross-browser support
Puppeteer for Chrome/Chromium-specific automation with lower overhead


I provide these standard tool implementations:

Navigation and URL handling
Screenshot capture
Element interaction (click, fill, select)
Hover and focus events
JavaScript evaluation
Console log capture
Network request monitoring


Standard Tools I Always Implement:

typescriptCopyplaywright_navigate/puppeteer_navigate
playwright_screenshot/puppeteer_screenshot
playwright_click/puppeteer_click
playwright_fill/puppeteer_fill
playwright_select/puppeteer_select
playwright_hover/puppeteer_hover
playwright_evaluate/puppeteer_evaluate

I follow these browser automation best practices:

Proper browser instance management
Resource cleanup
Error handling with detailed messages
Screenshot management
Console log capturing
Viewport configuration
Wait strategies for elements
Performance optimization


Tool Selection Guidelines:

Use Playwright when:

Cross-browser testing is needed
Modern browser features are required
Reliable auto-wait mechanisms are important
Better iframe and shadow DOM support is needed


Use Puppeteer when:

Chrome/Chromium-specific features are needed
Lightweight solution is preferred
Deep Chrome DevTools Protocol integration is required
Lower-level browser control is needed




Implementation Standards:

Proper error handling and retries
Resource cleanup in error cases
Screenshot storage management
Console log aggregation
Clear success/failure reporting
Detailed error messages
Performance monitoring
Memory management

I always recommend using MCP Inspector for testing
I guide on proper logging implementation
I provide debugging strategies
I help troubleshoot issues systematically
“”” MY KNOWLEDGE HOW TO - MCP Server TypeScript

11.01 KB •508 lines
•
Formatting may be inconsistent from source
Your First MCP Server
TypeScript
Create a simple MCP server in TypeScript in 15 minutes

Let’s build your first MCP server in TypeScript! We’ll create a weather server that provides current weather data as a resource and lets Claude fetch forecasts using tools.

This guide uses the OpenWeatherMap API. You’ll need a free API key from OpenWeatherMap to follow along.

​
Prerequisites
1
Install Node.js

You’ll need Node.js 18 or higher:


node --version  # Should be v18 or higher
npm --version
2
Create a new project

You can use our create-typescript-server tool to bootstrap a new project:


npx @modelcontextprotocol/create-server weather-server
cd weather-server
3
Install dependencies


npm install --save axios dotenv
4
Set up environment

Create .env:


OPENWEATHER_API_KEY=your-api-key-here
Make sure to add your environment file to .gitignore


.env
​
Create your server
1
Define types

Create a file src/types.ts, and add the following:


export interface OpenWeatherResponse {
  main: {
    temp: number;
    humidity: number;
  };
  weather: Array<{
    description: string;
  }>;
  wind: {
    speed: number;
  };
  dt_txt?: string;
}

export interface WeatherData {
  temperature: number;
  conditions: string;
  humidity: number;
  wind_speed: number;
  timestamp: string;
}

export interface ForecastDay {
  date: string;
  temperature: number;
  conditions: string;
}

export interface GetForecastArgs {
  city: string;
  days?: number;
}

// Type guard for forecast arguments
export function isValidForecastArgs(args: any): args is GetForecastArgs {
  return (
    typeof args === "object" && 
    args !== null && 
    "city" in args &&
    typeof args.city === "string" &&
    (args.days === undefined || typeof args.days === "number")
  );
}
2
Add the base code

Replace src/index.ts with the following:


#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ErrorCode,
  McpError
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import dotenv from "dotenv";
import { 
  WeatherData, 
  ForecastDay, 
  OpenWeatherResponse,
  isValidForecastArgs 
} from "./types.js";

dotenv.config();

const API_KEY = process.env.OPENWEATHER_API_KEY;
if (!API_KEY) {
  throw new Error("OPENWEATHER_API_KEY environment variable is required");
}

const API_CONFIG = {
  BASE_URL: 'http://api.openweathermap.org/data/2.5',
  DEFAULT_CITY: 'San Francisco',
  ENDPOINTS: {
    CURRENT: 'weather',
    FORECAST: 'forecast'
  }
} as const;

class WeatherServer {
  private server: Server;
  private axiosInstance;

  constructor() {
    this.server = new Server({
      name: "example-weather-server",
      version: "0.1.0"
    }, {
      capabilities: {
        resources: {},
        tools: {}
      }
    });

    // Configure axios with defaults
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      params: {
        appid: API_KEY,
        units: "metric"
      }
    });

    this.setupHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error("[MCP Error]", error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupHandlers(): void {
    this.setupResourceHandlers();
    this.setupToolHandlers();
  }

  private setupResourceHandlers(): void {
    // Implementation continues in next section
  }

  private setupToolHandlers(): void {
    // Implementation continues in next section
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    // Although this is just an informative message, we must log to stderr,
    // to avoid interfering with MCP communication that happens on stdout
    console.error("Weather MCP server running on stdio");
  }
}

const server = new WeatherServer();
server.run().catch(console.error);
3
Add resource handlers

Add this to the setupResourceHandlers method:


private setupResourceHandlers(): void {
  this.server.setRequestHandler(
    ListResourcesRequestSchema,
    async () => ({
      resources: [{
        uri: `weather://${API_CONFIG.DEFAULT_CITY}/current`,
        name: `Current weather in ${API_CONFIG.DEFAULT_CITY}`,
        mimeType: "application/json",
        description: "Real-time weather data including temperature, conditions, humidity, and wind speed"
      }]
    })
  );

  this.server.setRequestHandler(
    ReadResourceRequestSchema,
    async (request) => {
      const city = API_CONFIG.DEFAULT_CITY;
      if (request.params.uri !== `weather://${city}/current`) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          `Unknown resource: ${request.params.uri}`
        );
      }

      try {
        const response = await this.axiosInstance.get<OpenWeatherResponse>(
          API_CONFIG.ENDPOINTS.CURRENT,
          {
            params: { q: city }
          }
        );

        const weatherData: WeatherData = {
          temperature: response.data.main.temp,
          conditions: response.data.weather[0].description,
          humidity: response.data.main.humidity,
          wind_speed: response.data.wind.speed,
          timestamp: new Date().toISOString()
        };

        return {
          contents: [{
            uri: request.params.uri,
            mimeType: "application/json",
            text: JSON.stringify(weatherData, null, 2)
          }]
        };
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new McpError(
            ErrorCode.InternalError,
            `Weather API error: ${error.response?.data.message ?? error.message}`
          );
        }
        throw error;
      }
    }
  );
}
4
Add tool handlers

Add these handlers to the setupToolHandlers method:


private setupToolHandlers(): void {
  this.server.setRequestHandler(
    ListToolsRequestSchema,
    async () => ({
      tools: [{
        name: "get_forecast",
        description: "Get weather forecast for a city",
        inputSchema: {
          type: "object",
          properties: {
            city: {
              type: "string",
              description: "City name"
            },
            days: {
              type: "number",
              description: "Number of days (1-5)",
              minimum: 1,
              maximum: 5
            }
          },
          required: ["city"]
        }
      }]
    })
  );

  this.server.setRequestHandler(
    CallToolRequestSchema,
    async (request) => {
      if (request.params.name !== "get_forecast") {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`
        );
      }

      if (!isValidForecastArgs(request.params.arguments)) {
        throw new McpError(
          ErrorCode.InvalidParams,
          "Invalid forecast arguments"
        );
      }

      const city = request.params.arguments.city;
      const days = Math.min(request.params.arguments.days || 3, 5);

      try {
        const response = await this.axiosInstance.get<{
          list: OpenWeatherResponse[]
        }>(API_CONFIG.ENDPOINTS.FORECAST, {
          params: {
            q: city,
            cnt: days * 8 // API returns 3-hour intervals
          }
        });

        const forecasts: ForecastDay[] = [];
        for (let i = 0; i < response.data.list.length; i += 8) {
          const dayData = response.data.list[i];
          forecasts.push({
            date: dayData.dt_txt?.split(' ')[0] ?? new Date().toISOString().split('T')[0],
            temperature: dayData.main.temp,
            conditions: dayData.weather[0].description
          });
        }

        return {
          content: [{
            type: "text",
            text: JSON.stringify(forecasts, null, 2)
          }]
        };
      } catch (error) {
        if (axios.isAxiosError(error)) {
          return {
            content: [{
              type: "text",
              text: `Weather API error: ${error.response?.data.message ?? error.message}`
            }],
            isError: true,
          }
        }
        throw error;
      }
    }
  );
}
5
Build and test


npm run build
​
Connect to Claude Desktop
1
Update Claude config

If you didn’t already connect to Claude Desktop during project setup, add to claude_desktop_config.json:


{
  "mcpServers": {
    "weather": {
      "command": "node",
      "args": ["/path/to/weather-server/build/index.js"],
      "env": {
        "OPENWEATHER_API_KEY": "your-api-key",
      }
    }
  }
}
2
Restart Claude

Quit Claude completely
Start Claude again
Look for your weather server in the 🔌 menu
​
Try it out!

Check Current Weather


Get a Forecast


Compare Weather

​
Understanding the code
Type Safety
Resources
Tools

interface WeatherData {
  temperature: number;
  conditions: string;
  humidity: number;
  wind_speed: number;
  timestamp: string;
}
TypeScript adds type safety to our MCP server, making it more reliable and easier to maintain.

​
Best practices
Error Handling
When a tool encounters an error, return the error message with isError: true, so the model can self-correct:


try {
  const response = await axiosInstance.get(...);
} catch (error) {
  if (axios.isAxiosError(error)) {
    return {
      content: {
        mimeType: "text/plain",
        text: `Weather API error: ${error.response?.data.message ?? error.message}`
      },
      isError: true,
    }
  }
  throw error;
}
For other handlers, throw an error, so the application can notify the user:


try {
  const response = await this.axiosInstance.get(...);
} catch (error) {
  if (axios.isAxiosError(error)) {
    throw new McpError(
      ErrorCode.InternalError,
      `Weather API error: ${error.response?.data.message}`
    );
  }
  throw error;
}
Type Validation

function isValidForecastArgs(args: any): args is GetForecastArgs {
  return (
    typeof args === "object" && 
    args !== null && 
    "city" in args &&
    typeof args.city === "string"
  );
}
You can also use libraries like Zod to perform this validation automatically.
​
Available transports
While this guide uses stdio to run the MCP server as a local process, MCP supports other transports as well.

​
Troubleshooting
The following troubleshooting tips are for macOS. Guides for other platforms are coming soon.

​
Build errors

# Check TypeScript version
npx tsc --version

# Clean and rebuild
rm -rf build/
npm run build
​
Runtime errors
Look for detailed error messages in the Claude Desktop logs:


# Monitor logs
tail -n 20 -f ~/Library/Logs/Claude/mcp*.log
​
Type errors

# Check types without building
npx tsc --noEmit
​
Next steps
Architecture overview
Learn more about the MCP architecture

TypeScript SDK
Check out the TypeScript SDK on GitHub

Need help? Ask Claude! Since it has access to the MCP SDK documentation, it can help you debug issues and suggest improvements to your server.
  EXAMPLE SERVER 1 PACKAGE

0.59 KB •26 lines
•
Formatting may be inconsistent from source
{
  "name": "notion",
  "version": "0.1.0",
  "description": "A Model Context Protocol server",
  "private": true,
  "type": "module",
  "bin": {
    "notion": "./build/index.js"
  },
  "files": [
    "build"
  ],
  "scripts": {
    "build": "tsc && node -e \"require('fs').chmodSync('build/index.js', '755')\"",
    "prepare": "npm run build",
    "watch": "tsc --watch",
    "inspector": "npx @modelcontextprotocol/inspector build/index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "0.6.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.24",
    "typescript": "^5.3.3"
  }
}
“”” EXAMPLE SERVER 1

18.97 KB •678 lines
•
Formatting may be inconsistent from source
#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequest,
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

// Type definitions for tool arguments
// Blocks
interface AppendBlockChildrenArgs {
  block_id: string;
  children: any[];
}

interface RetrieveBlockArgs {
  block_id: string;
}

interface RetrieveBlockChildrenArgs {
  block_id: string;
  start_cursor?: string;
  page_size?: number;
}

interface DeleteBlockArgs {
  block_id: string;
}

// Pages
interface RetrievePageArgs {
  page_id: string;
}

interface UpdatePagePropertiesArgs {
  page_id: string;
  properties: any;
}

// Databases
interface CreateDatabaseArgs {
  parent: any;
  title: any[];
  properties: any;
}

interface QueryDatabaseArgs {
  database_id: string;
  filter?: any;
  sorts?: any;
  start_cursor?: string;
  page_size?: number;
}

interface RetrieveDatabaseArgs {
  database_id: string;
}

interface UpdateDatabaseArgs {
  database_id: string;
  title?: any[];
  description?: any[];
  properties?: any;
}

interface CreateDatabaseItemArgs {
  database_id: string;
  properties: any;
}

// Tool definitions
// Blocks
const appendBlockChildrenTool: Tool = {
  name: "notion_append_block_children",
  description: "Append blocks to a parent block in Notion",
  inputSchema: {
    type: "object",
    properties: {
      block_id: {
        type: "string",
        description: "The ID of the parent block. It should be a 32-character string (excluding hyphens) formatted as 8-4-4-4-12 with hyphens (-).",
      },
      children: {
        type: "array",
        description: "Array of block objects to append",
      },
    },
    required: ["block_id", "children"],
  },
};

const retrieveBlockTool: Tool = {
  name: "notion_retrieve_block",
  description: "Retrieve a block from Notion",
  inputSchema: {
    type: "object",
    properties: {
      block_id: {
        type: "string",
        description: "The ID of the block to retrieve. It should be a 32-character string (excluding hyphens) formatted as 8-4-4-4-12 with hyphens (-).",
      },
    },
    required: ["block_id"],
  },
}

const retrieveBlockChildrenTool: Tool = {
  name: "notion_retrieve_block_children",
  description: "Retrieve the children of a block",
  inputSchema: {
    type: "object",
    properties: {
      block_id: {
        type: "string",
        description: "The ID of the block. It should be a 32-character string (excluding hyphens) formatted as 8-4-4-4-12 with hyphens (-).",
      },
      start_cursor: {
        type: "string",
        description: "Pagination cursor for next page of results",
      },
      page_size: {
        type: "number",
        description: "Number of results per page (max 100)",
      },
    },
    required: ["block_id"],
  },
};

const deleteBlockTool: Tool = {
  name: "notion_delete_block",
  description: "Delete a block in Notion",
  inputSchema: {
    type: "object",
    properties: {
      block_id: {
        type: "string",
        description: "The ID of the block to delete. It should be a 32-character string (excluding hyphens) formatted as 8-4-4-4-12 with hyphens (-).",
      },
    },
    required: ["block_id"],
  },
};

// Pages
const retrievePageTool: Tool = {
  name: "notion_retrieve_page",
  description: "Retrieve a page from Notion",
  inputSchema: {
    type: "object",
    properties: {
      page_id: {
        type: "string",
        description: "The ID of the page to retrieve. It should be a 32-character string (excluding hyphens) formatted as 8-4-4-4-12 with hyphens (-).",
      },
    },
    required: ["page_id"],
  },
};

const updatePagePropertiesTool: Tool = {
  name: "notion_update_page_properties",
  description: "Update properties of a page or an item in a Notion database",
  inputSchema: {
    type: "object",
    properties: {
      page_id: {
        type: "string",
        description: "The ID of the page or database item to update. It should be a 32-character string (excluding hyphens) formatted as 8-4-4-4-12 with hyphens (-).",
      },
      properties: {
        type: "object",
        description: "Properties to update. These correspond to the columns or fields in the database.",
      },
    },
    required: ["page_id", "properties"],
  },
};

// Databases
const createDatabaseTool: Tool = {
  name: "notion_create_database",
  description: "Create a database in Notion",
  inputSchema: {
    type: "object",
    properties: {
      parent: {
        type: "object",
        description: "Parent object of the database",
      },
      title: {
        type: "array",
        description: "Title of database as it appears in Notion. An array of rich text objects.",
      },
      properties: {
        type: "object",
        description: "Property schema of database. The keys are the names of properties as they appear in Notion and the values are property schema objects.",
      },
    },
    required: ["parent", "properties"],
  },
};

const queryDatabaseTool: Tool = {
  name: "notion_query_database",
  description: "Query a database in Notion",
  inputSchema: {
    type: "object",
    properties: {
      database_id: {
        type: "string",
        description: "The ID of the database to query. It should be a 32-character string (excluding hyphens) formatted as 8-4-4-4-12 with hyphens (-).",
      },
      filter: {
        type: "object",
        description: "Filter conditions",
      },
      sorts: {
        type: "array",
        description: "Sort conditions",
      },
      start_cursor: {
        type: "string",
        description: "Pagination cursor for next page of results",
      },
      page_size: {
        type: "number",
        description: "Number of results per page (max 100)",
      },
    },
    required: ["database_id"],
  },
};

const retrieveDatabaseTool: Tool = {
  name: "notion_retrieve_database",
  description: "Retrieve a database in Notion",
  inputSchema: {
    type: "object",
    properties: {
      database_id: {
        type: "string",
        description: "The ID of the database to retrieve. It should be a 32-character string (excluding hyphens) formatted as 8-4-4-4-12 with hyphens (-).",
      },
    },
    required: ["database_id"],
  },
};

const updateDatabaseTool: Tool = {
  name: "notion_update_database",
  description: "Update a database in Notion",
  inputSchema: {
    type: "object",
    properties: {
      database_id: {
        type: "string",
        description: "The ID of the database to update. It should be a 32-character string (excluding hyphens) formatted as 8-4-4-4-12 with hyphens (-).",
      },
      title: {
        type: "array",
        description: "An array of rich text objects that represents the title of the database that is displayed in the Notion UI.",
      },
      description: {
        type: "array",
        description: "An array of rich text objects that represents the description of the database that is displayed in the Notion UI.",
      },
      properties: {
        type: "object",
        description: "The properties of a database to be changed in the request, in the form of a JSON object.",
      },
    },
    required: ["database_id"],
  },
};

const createDatabaseItemTool: Tool = {
  name: "notion_create_database_item",
  description: "Create a new item (page) in a Notion database",
  inputSchema: {
    type: "object",
    properties: {
      database_id: {
        type: "string",
        description: "The ID of the database to add the item to. It should be a 32-character string (excluding hyphens) formatted as 8-4-4-4-12 with hyphens (-).",
      },
      properties: {
        type: "object",
        description: "Properties of the new database item. These should match the database schema.",
      },
    },
    required: ["database_id", "properties"],
  },
};

class NotionClientWrapper {
  private notionToken: string;
  private baseUrl: string = "https://api.notion.com/v1";
  private headers: { [key: string]: string };

  constructor(token: string) {
    this.notionToken = token;
    this.headers = {
      "Authorization": `Bearer ${this.notionToken}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
    };
  }

  async appendBlockChildren(block_id: string, children: any[]): Promise<any> {
    const body = { children };

    const response = await fetch(`${this.baseUrl}/blocks/${block_id}/children`, {
      method: "PATCH",
      headers: this.headers,
      body: JSON.stringify(body),
    });

    return response.json();
  }

  async retrieveBlock(block_id: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/blocks/${block_id}`, {
      method: "GET",
      headers: this.headers,
    });

    return response.json();
  }

  async retrieveBlockChildren(
    block_id: string,
    start_cursor?: string,
    page_size?: number,
  ): Promise<any> {
    const params = new URLSearchParams();
    if (start_cursor) params.append("start_cursor", start_cursor);
    if (page_size) params.append("page_size", page_size.toString());

    const response = await fetch(`${this.baseUrl}/blocks/${block_id}/children?${params}`, {
      method: "GET",
      headers: this.headers,
    });

    return response.json();
  }

  async deleteBlock(block_id: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/blocks/${block_id}`, {
      method: "DELETE",
      headers: this.headers,
    });

    return response.json();
  }

  async retrievePage(page_id: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/pages/${page_id}`, {
      method: "GET",
      headers: this.headers,
    });

    return response.json();
  }

  async updatePageProperties(page_id: string, properties: any): Promise<any> {
    const body = { properties };

    const response = await fetch(`${this.baseUrl}/pages/${page_id}`, {
      method: "PATCH",
      headers: this.headers,
      body: JSON.stringify(body),
    });

    return response.json();
  }

  async createDatabase(parent: any, title: any[], properties: any): Promise<any> {
    const body = { parent, title, properties };

    const response = await fetch(`${this.baseUrl}/databases`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(body),
    });

    return response.json();
  }

  async queryDatabase(
    database_id: string,
    filter?: any,
    sorts?: any,
    start_cursor?: string,
    page_size?: number,
  ): Promise<any> {
    const body: any = {};
    if (filter) body.filter = filter;
    if (sorts) body.sorts = sorts;
    if (start_cursor) body.start_cursor = start_cursor;
    if (page_size) body.page_size = page_size;

    const response = await fetch(`${this.baseUrl}/databases/${database_id}/query`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(body),
    });

    return response.json();
  }

  async retrieveDatabase(database_id: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/databases/${database_id}`, {
      method: "GET",
      headers: this.headers,
    });

    return response.json();
  }

  async updateDatabase(database_id: string, title?: any[], description?: any[], properties?: any): Promise<any> {
    const body: any = {};
    if (title) body.title = title;
    if (description) body.description = description;
    if (properties) body.properties = properties;

    const response = await fetch(`${this.baseUrl}/databases/${database_id}`, {
      method: "PATCH",
      headers: this.headers,
      body: JSON.stringify(body),
    });

    return response.json();
  }

  async createDatabaseItem(database_id: string, properties: any): Promise<any> {
    const body = {
      parent: { database_id },
      properties,
    };
  
    const response = await fetch(`${this.baseUrl}/pages`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(body),
    });
  
    return response.json();
  }  
}

async function main() {
  const notionToken = process.env.NOTION_API_TOKEN;

  if (!notionToken) {
    console.error("Please set NOTION_API_TOKEN environment variable");
    process.exit(1);
  }

  console.error("Starting Notion MCP Server...");
  const server = new Server(
    {
      name: "Notion MCP Server",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  const notionClient = new NotionClientWrapper(notionToken);

  server.setRequestHandler(
    CallToolRequestSchema,
    async (request: CallToolRequest) => {
      console.error("Received CallToolRequest:", request);
      try {
        if (!request.params.arguments) {
          throw new Error("No arguments provided");
        }

        switch (request.params.name) {
          case "notion_append_block_children": {
            const args = request.params.arguments as unknown as AppendBlockChildrenArgs;
            if (!args.block_id || !args.children) {
              throw new Error(
                "Missing required arguments: block_id and children",
              );
            }
            const response = await notionClient.appendBlockChildren(
              args.block_id,
              args.children,
            );
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "notion_retrieve_block": {
            const args = request.params.arguments as unknown as RetrieveBlockArgs;
            if (!args.block_id) {
              throw new Error("Missing required argument: block_id");
            }
            const response = await notionClient.retrieveBlock(args.block_id);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "notion_retrieve_block_children": {
            const args = request.params
              .arguments as unknown as RetrieveBlockChildrenArgs;
            if (!args.block_id) {
              throw new Error("Missing required argument: block_id");
            }
            const response = await notionClient.retrieveBlockChildren(
              args.block_id,
              args.start_cursor,
              args.page_size,
            );
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "notion_delete_block": {
            const args = request.params.arguments as unknown as DeleteBlockArgs;
            if (!args.block_id) {
              throw new Error("Missing required argument: block_id");
            }
            const response = await notionClient.deleteBlock(args.block_id);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "notion_retrieve_page": {
            const args = request.params.arguments as unknown as RetrievePageArgs;
            if (!args.page_id) {
              throw new Error("Missing required argument: page_id");
            }
            const response = await notionClient.retrievePage(args.page_id);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "notion_update_page_properties": {
            const args = request.params.arguments as unknown as UpdatePagePropertiesArgs;
            if (!args.page_id || !args.properties) {
              throw new Error(
                "Missing required arguments: page_id and properties",
              );
            }
            const response = await notionClient.updatePageProperties(
              args.page_id,
              args.properties,
            );
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "notion_query_database": {
            const args = request.params
              .arguments as unknown as QueryDatabaseArgs;
            if (!args.database_id) {
              throw new Error("Missing required argument: database_id");
            }
            const response = await notionClient.queryDatabase(
              args.database_id,
              args.filter,
              args.sorts,
              args.start_cursor,
              args.page_size,
            );
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "notion_create_database": {
            const args = request.params.arguments as unknown as CreateDatabaseArgs;
            const response = await notionClient.createDatabase(
              args.parent,
              args.title,
              args.properties,
            );
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "notion_retrieve_database": {
            const args = request.params.arguments as unknown as RetrieveDatabaseArgs;
            const response = await notionClient.retrieveDatabase(args.database_id);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "notion_update_database": {
            const args = request.params.arguments as unknown as UpdateDatabaseArgs;
            const response = await notionClient.updateDatabase(
              args.database_id,
              args.title,
              args.description,
              args.properties,
            );
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "notion_create_database_item": {
            const args = request.params.arguments as unknown as CreateDatabaseItemArgs;
            const response = await notionClient.createDatabaseItem(
              args.database_id,
              args.properties,
            );
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          default:
            throw new Error(`Unknown tool: ${request.params.name}`);
        }
      } catch (error) {
        console.error("Error executing tool:", error);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: error instanceof Error ? error.message : String(error),
              }),
            },
          ],
        };
      }
    },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    console.error("Received ListToolsRequest");
    return {
      tools: [
        appendBlockChildrenTool,
        retrieveBlockTool,
        retrieveBlockChildrenTool,
        deleteBlockTool,
        retrievePageTool,
        updatePagePropertiesTool,
        createDatabaseTool,
        queryDatabaseTool,
        retrieveDatabaseTool,
        updateDatabaseTool,
        createDatabaseItemTool,
      ],
    };
  });

  const transport = new StdioServerTransport();
  console.error("Connecting server to transport...");
  await server.connect(transport);

  console.error("Notion MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
“”” EXAMPLE SERVER 2

9.81 KB •390 lines
•
Formatting may be inconsistent from source
#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  CallToolResult,
  TextContent,
  ImageContent,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import puppeteer, { Browser, Page } from "puppeteer";

// Define the tools once to avoid repetition
const TOOLS: Tool[] = [
  {
    name: "puppeteer_navigate",
    description: "Navigate to a URL",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string" },
      },
      required: ["url"],
    },
  },
  {
    name: "puppeteer_screenshot",
    description: "Take a screenshot of the current page or a specific element",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Name for the screenshot" },
        selector: { type: "string", description: "CSS selector for element to screenshot" },
        width: { type: "number", description: "Width in pixels (default: 800)" },
        height: { type: "number", description: "Height in pixels (default: 600)" },
      },
      required: ["name"],
    },
  },
  {
    name: "puppeteer_click",
    description: "Click an element on the page",
    inputSchema: {
      type: "object",
      properties: {
        selector: { type: "string", description: "CSS selector for element to click" },
      },
      required: ["selector"],
    },
  },
  {
    name: "puppeteer_fill",
    description: "Fill out an input field",
    inputSchema: {
      type: "object",
      properties: {
        selector: { type: "string", description: "CSS selector for input field" },
        value: { type: "string", description: "Value to fill" },
      },
      required: ["selector", "value"],
    },
  },
  {
    name: "puppeteer_select",
    description: "Select an element on the page with Select tag",
    inputSchema: {
      type: "object",
      properties: {
        selector: { type: "string", description: "CSS selector for element to select" },
        value: { type: "string", description: "Value to select" },
      },
      required: ["selector", "value"],
    },
  },
  {
    name: "puppeteer_hover",
    description: "Hover an element on the page",
    inputSchema: {
      type: "object",
      properties: {
        selector: { type: "string", description: "CSS selector for element to hover" },
      },
      required: ["selector"],
    },
  },
  {
    name: "puppeteer_evaluate",
    description: "Execute JavaScript in the browser console",
    inputSchema: {
      type: "object",
      properties: {
        script: { type: "string", description: "JavaScript code to execute" },
      },
      required: ["script"],
    },
  },
];

// Global state
let browser: Browser | undefined;
let page: Page | undefined;
const consoleLogs: string[] = [];
const screenshots = new Map<string, string>();

async function ensureBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({ headless: false });
    const pages = await browser.pages();
    page = pages[0];

    page.on("console", (msg) => {
      const logEntry = `[${msg.type()}] ${msg.text()}`;
      consoleLogs.push(logEntry);
      server.notification({
        method: "notifications/resources/updated",
        params: { uri: "console://logs" },
      });
    });
  }
  return page!;
}

async function handleToolCall(name: string, args: any): Promise<CallToolResult> {
  const page = await ensureBrowser();

  switch (name) {
    case "puppeteer_navigate":
      await page.goto(args.url);
      return {
        content: [{
          type: "text",
          text: `Navigated to ${args.url}`,
        }],
        isError: false,
      };

    case "puppeteer_screenshot": {
      const width = args.width ?? 800;
      const height = args.height ?? 600;
      await page.setViewport({ width, height });

      const screenshot = await (args.selector ?
        (await page.$(args.selector))?.screenshot({ encoding: "base64" }) :
        page.screenshot({ encoding: "base64", fullPage: false }));

      if (!screenshot) {
        return {
          content: [{
            type: "text",
            text: args.selector ? `Element not found: ${args.selector}` : "Screenshot failed",
          }],
          isError: true,
        };
      }

      screenshots.set(args.name, screenshot as string);
      server.notification({
        method: "notifications/resources/list_changed",
      });

      return {
        content: [
          {
            type: "text",
            text: `Screenshot '${args.name}' taken at ${width}x${height}`,
          } as TextContent,
          {
            type: "image",
            data: screenshot,
            mimeType: "image/png",
          } as ImageContent,
        ],
        isError: false,
      };
    }

    case "puppeteer_click":
      try {
        await page.click(args.selector);
        return {
          content: [{
            type: "text",
            text: `Clicked: ${args.selector}`,
          }],
          isError: false,
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Failed to click ${args.selector}: ${(error as Error).message}`,
          }],
          isError: true,
        };
      }

    case "puppeteer_fill":
      try {
        await page.waitForSelector(args.selector);
        await page.type(args.selector, args.value);
        return {
          content: [{
            type: "text",
            text: `Filled ${args.selector} with: ${args.value}`,
          }],
          isError: false,
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Failed to fill ${args.selector}: ${(error as Error).message}`,
          }],
          isError: true,
        };
      }

    case "puppeteer_select":
      try {
        await page.waitForSelector(args.selector);
        await page.select(args.selector, args.value);
        return {
          content: [{
            type: "text",
            text: `Selected ${args.selector} with: ${args.value}`,
          }],
          isError: false,
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Failed to select ${args.selector}: ${(error as Error).message}`,
          }],
          isError: true,
        };
      }

    case "puppeteer_hover":
      try {
        await page.waitForSelector(args.selector);
        await page.hover(args.selector);
        return {
          content: [{
            type: "text",
            text: `Hovered ${args.selector}`,
          }],
          isError: false,
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Failed to hover ${args.selector}: ${(error as Error).message}`,
          }],
          isError: true,
        };
      }

    case "puppeteer_evaluate":
      try {
        const result = await page.evaluate((script) => {
          const logs: string[] = [];
          const originalConsole = { ...console };

          ['log', 'info', 'warn', 'error'].forEach(method => {
            (console as any)[method] = (...args: any[]) => {
              logs.push(`[${method}] ${args.join(' ')}`);
              (originalConsole as any)[method](...args);
            };
          });

          try {
            const result = eval(script);
            Object.assign(console, originalConsole);
            return { result, logs };
          } catch (error) {
            Object.assign(console, originalConsole);
            throw error;
          }
        }, args.script);

        return {
          content: [
            {
              type: "text",
              text: `Execution result:\n${JSON.stringify(result.result, null, 2)}\n\nConsole output:\n${result.logs.join('\n')}`,
            },
          ],
          isError: false,
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Script execution failed: ${(error as Error).message}`,
          }],
          isError: true,
        };
      }

    default:
      return {
        content: [{
          type: "text",
          text: `Unknown tool: ${name}`,
        }],
        isError: true,
      };
  }
}

const server = new Server(
  {
    name: "example-servers/puppeteer",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  },
);


// Setup request handlers
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: "console://logs",
      mimeType: "text/plain",
      name: "Browser console logs",
    },
    ...Array.from(screenshots.keys()).map(name => ({
      uri: `screenshot://${name}`,
      mimeType: "image/png",
      name: `Screenshot: ${name}`,
    })),
  ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri.toString();

  if (uri === "console://logs") {
    return {
      contents: [{
        uri,
        mimeType: "text/plain",
        text: consoleLogs.join("\n"),
      }],
    };
  }

  if (uri.startsWith("screenshot://")) {
    const name = uri.split("://")[1];
    const screenshot = screenshots.get(name);
    if (screenshot) {
      return {
        contents: [{
          uri,
          mimeType: "image/png",
          blob: screenshot,
        }],
      };
    }
  }

  throw new Error(`Resource not found: ${uri}`);
});

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) =>
  handleToolCall(request.params.name, request.params.arguments ?? {})
);

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

runServer().catch(console.error);
“”” DEBUGGING

4.75 KB •239 lines
•
Formatting may be inconsistent from source
Development Tools
Debugging
A comprehensive guide to debugging Model Context Protocol (MCP) integrations

Effective debugging is essential when developing MCP servers or integrating them with applications. This guide covers the debugging tools and approaches available in the MCP ecosystem.

This guide is for macOS. Guides for other platforms are coming soon.

​
Debugging tools overview
MCP provides several tools for debugging at different levels:

MCP Inspector

Interactive debugging interface
Direct server testing
See the Inspector guide for details
Claude Desktop Developer Tools

Integration testing
Log collection
Chrome DevTools integration
Server Logging

Custom logging implementations
Error tracking
Performance monitoring
​
Debugging in Claude Desktop
​
Checking server status
The Claude.app interface provides basic server status information:

Click the 🔌 icon to view:

Connected servers
Available prompts and resources
Click the 🔨 icon to view:

Tools made available to the model
​
Viewing logs
Review detailed MCP logs from Claude Desktop:


# Follow logs in real-time
tail -n 20 -f ~/Library/Logs/Claude/mcp*.log
The logs capture:

Server connection events
Configuration issues
Runtime errors
Message exchanges
​
Using Chrome DevTools
Access Chrome’s developer tools inside Claude Desktop to investigate client-side errors:

Enable DevTools:

jq '.allowDevTools = true' ~/Library/Application\ Support/Claude/developer_settings.json > tmp.json \
  && mv tmp.json ~/Library/Application\ Support/Claude/developer_settings.json
Open DevTools: Command-Option-Shift-i
Note: You’ll see two DevTools windows:

Main content window
App title bar window
Use the Console panel to inspect client-side errors.

Use the Network panel to inspect:

Message payloads
Connection timing
​
Common issues
​
Environment variables
MCP servers inherit only a subset of environment variables automatically, like USER, HOME, and PATH.

To override the default variables or provide your own, you can specify an env key in claude_desktop_config.json:


{
  "myserver": {
    "command": "mcp-server-myapp",
    "env": {
      "MYAPP_API_KEY": "some_key",
    }
  }
}
​
Server initialization
Common initialization problems:

Path Issues

Incorrect server executable path
Missing required files
Permission problems
Configuration Errors

Invalid JSON syntax
Missing required fields
Type mismatches
Environment Problems

Missing environment variables
Incorrect variable values
Permission restrictions
​
Connection problems
When servers fail to connect:

Check Claude Desktop logs
Verify server process is running
Test standalone with Inspector
Verify protocol compatibility
​
Implementing logging
​
Server-side logging
When building a server that uses the local stdio transport, all messages logged to stderr (standard error) will be captured by the host application (e.g., Claude Desktop) automatically.

Local MCP servers should not log messages to stdout (standard out), as this will interfere with protocol operation.

For all transports, you can also provide logging to the client by sending a log message notification:

Python
TypeScript

server.request_context.session.send_log_message(
  level="info",
  data="Server started successfully",
)
Important events to log:

Initialization steps
Resource access
Tool execution
Error conditions
Performance metrics
​
Client-side logging
In client applications:

Enable debug logging
Monitor network traffic
Track message exchanges
Record error states
​
Debugging workflow
​
Development cycle
Initial Development

Use Inspector for basic testing
Implement core functionality
Add logging points
Integration Testing

Test in Claude Desktop
Monitor logs
Check error handling
​
Testing changes
To test changes efficiently:

Configuration changes: Restart Claude Desktop
Server code changes: Use Command-R to reload
Quick iteration: Use Inspector during development
​
Best practices
​
Logging strategy
Structured Logging

Use consistent formats
Include context
Add timestamps
Track request IDs
Error Handling

Log stack traces
Include error context
Track error patterns
Monitor recovery
Performance Tracking

Log operation timing
Monitor resource usage
Track message sizes
Measure latency
​
Security considerations
When debugging:

Sensitive Data

Sanitize logs
Protect credentials
Mask personal information
Access Control

Verify permissions
Check authentication
Monitor access patterns
​
Getting help
When encountering issues:

First Steps

Check server logs
Test with Inspector
Review configuration
Verify environment
Support Channels

GitHub issues
GitHub discussions
Providing Information

Log excerpts
Configuration files
Steps to reproduce
Environment details
​
Next steps
MCP Inspector
Learn to use the MCP Inspector

Was this page helpful?


Yes

No
TypeScript
Inspector
github
“”” Concepts Resources

5.73 KB •209 lines
•
Formatting may be inconsistent from source
Concepts
Resources
Expose data and content from your servers to LLMs

Resources are a core primitive in the Model Context Protocol (MCP) that allow servers to expose data and content that can be read by clients and used as context for LLM interactions.

Resources are designed to be application-controlled, meaning that the client application can decide how and when they should be used. Different MCP clients may handle resources differently. For example:

Claude Desktop currently requires users to explicitly select resources before they can be used
Other clients might automatically select resources based on heuristics
Some implementations may even allow the AI model itself to determine which resources to use
Server authors should be prepared to handle any of these interaction patterns when implementing resource support. In order to expose data to models automatically, server authors should use a model-controlled primitive such as Tools.

​
Overview
Resources represent any kind of data that an MCP server wants to make available to clients. This can include:

File contents
Database records
API responses
Live system data
Screenshots and images
Log files
And more
Each resource is identified by a unique URI and can contain either text or binary data.

​
Resource URIs
Resources are identified using URIs that follow this format:


[protocol]://[host]/[path]
For example:

file:///home/user/documents/report.pdf
postgres://database/customers/schema
screen://localhost/display1
The protocol and path structure is defined by the MCP server implementation. Servers can define their own custom URI schemes.

​
Resource types
Resources can contain two types of content:

​
Text resources
Text resources contain UTF-8 encoded text data. These are suitable for:

Source code
Configuration files
Log files
JSON/XML data
Plain text
​
Binary resources
Binary resources contain raw binary data encoded in base64. These are suitable for:

Images
PDFs
Audio files
Video files
Other non-text formats
​
Resource discovery
Clients can discover available resources through two main methods:

​
Direct resources
Servers expose a list of concrete resources via the resources/list endpoint. Each resource includes:


{
  uri: string;           // Unique identifier for the resource
  name: string;          // Human-readable name
  description?: string;  // Optional description
  mimeType?: string;     // Optional MIME type
}
​
Resource templates
For dynamic resources, servers can expose URI templates that clients can use to construct valid resource URIs:


{
  uriTemplate: string;   // URI template following RFC 6570
  name: string;          // Human-readable name for this type
  description?: string;  // Optional description
  mimeType?: string;     // Optional MIME type for all matching resources
}
​
Reading resources
To read a resource, clients make a resources/read request with the resource URI.

The server responds with a list of resource contents:


{
  contents: [
    {
      uri: string;        // The URI of the resource
      mimeType?: string;  // Optional MIME type

      // One of:
      text?: string;      // For text resources
      blob?: string;      // For binary resources (base64 encoded)
    }
  ]
}
Servers may return multiple resources in response to one resources/read request. This could be used, for example, to return a list of files inside a directory when the directory is read.

​
Resource updates
MCP supports real-time updates for resources through two mechanisms:

​
List changes
Servers can notify clients when their list of available resources changes via the notifications/resources/list_changed notification.

​
Content changes
Clients can subscribe to updates for specific resources:

Client sends resources/subscribe with resource URI
Server sends notifications/resources/updated when the resource changes
Client can fetch latest content with resources/read
Client can unsubscribe with resources/unsubscribe
​
Example implementation
Here’s a simple example of implementing resource support in an MCP server:

TypeScript
Python

const server = new Server({
  name: "example-server",
  version: "1.0.0"
}, {
  capabilities: {
    resources: {}
  }
});

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "file:///logs/app.log",
        name: "Application Logs",
        mimeType: "text/plain"
      }
    ]
  };
});

// Read resource contents
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;

  if (uri === "file:///logs/app.log") {
    const logContents = await readLogFile();
    return {
      contents: [
        {
          uri,
          mimeType: "text/plain",
          text: logContents
        }
      ]
    };
  }

  throw new Error("Resource not found");
});
​
Best practices
When implementing resource support:

Use clear, descriptive resource names and URIs
Include helpful descriptions to guide LLM understanding
Set appropriate MIME types when known
Implement resource templates for dynamic content
Use subscriptions for frequently changing resources
Handle errors gracefully with clear error messages
Consider pagination for large resource lists
Cache resource contents when appropriate
Validate URIs before processing
Document your custom URI schemes
​
Security considerations
When exposing resources:

Validate all resource URIs
Implement appropriate access controls
Sanitize file paths to prevent directory traversal
Be cautious with binary data handling
Consider rate limiting for resource reads
Audit resource access
Encrypt sensitive data in transit
Validate MIME types
Implement timeouts for long-running reads
Handle resource cleanup appropriately
Was this page helpful?


Yes

No
Core architecture
Prompts
github
“”” modelcontextprotocol / typescript-sdk

4.58 KB •236 lines
•
Formatting may be inconsistent from source
Skip to content
Navigation Menu
modelcontextprotocol
/
typescript-sdk

Type / to search

Code
Issues
7
Pull requests
1
Actions
Security
Insights
Owner avatar
typescript-sdk
Public
modelcontextprotocol/typescript-sdk
Go to file
t
Add file
Folders and files
Name		
Latest commit
jspahrsummers
jspahrsummers
Merge pull request #84 from modelcontextprotocol/revert-83-justin/rem…
989550d
 · 
4 hours ago
History
.github/workflows
Restrict publishing to 'release' environment
3 weeks ago
src
Revert "Remove CompatibilityCallToolResult"
4 hours ago
.gitattributes
Ignore package-lock.json in diffs
2 months ago
.gitignore
Don't commit 'dist' anymore
2 months ago
.npmrc
Add npmrc to always point to npm for public packages
2 months ago
CODE_OF_CONDUCT.md
Add code of conduct
2 weeks ago
CONTRIBUTING.md
Add CONTRIBUTING.md
2 weeks ago
LICENSE
Update LICENSE
2 weeks ago
README.md
Fix imports
last week
SECURITY.md
Update SECURITY.md
2 weeks ago
eslint.config.mjs
Initial import
3 months ago
jest.config.js
Initial import
3 months ago
package-lock.json
1.0.0
last week
package.json
Bump to 1.0.3
4 hours ago
tsconfig.json
Initial import
3 months ago
Repository files navigation
README
Code of conduct
MIT license
Security
MCP TypeScript SDK NPM Version
TypeScript implementation of the Model Context Protocol (MCP), providing both client and server capabilities for integrating with LLM surfaces.

Overview
The Model Context Protocol allows applications to provide context for LLMs in a standardized way, separating the concerns of providing context from the actual LLM interaction. This TypeScript SDK implements the full MCP specification, making it easy to:

Build MCP clients that can connect to any MCP server
Create MCP servers that expose resources, prompts and tools
Use standard transports like stdio and SSE
Handle all MCP protocol messages and lifecycle events
Installation
npm install @modelcontextprotocol/sdk
Quick Start
Creating a Client
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "path/to/server",
});

const client = new Client({
  name: "example-client",
  version: "1.0.0",
}, {
  capabilities: {}
});

await client.connect(transport);

// List available resources
const resources = await client.request(
  { method: "resources/list" },
  ListResourcesResultSchema
);

// Read a specific resource
const resourceContent = await client.request(
  {
    method: "resources/read",
    params: {
      uri: "file:///example.txt"
    }
  },
  ReadResourceResultSchema
);
Creating a Server
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server({
  name: "example-server",
  version: "1.0.0",
}, {
  capabilities: {
    resources: {}
  }
});

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "file:///example.txt",
        name: "Example Resource",
      },
    ],
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  if (request.params.uri === "file:///example.txt") {
    return {
      contents: [
        {
          uri: "file:///example.txt",
          mimeType: "text/plain",
          text: "This is the content of the example resource.",
        },
      ],
    };
  } else {
    throw new Error("Resource not found");
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
Documentation
Model Context Protocol documentation
MCP Specification
Example Servers
Contributing
Issues and pull requests are welcome on GitHub at https://github.com/modelcontextprotocol/typescript-sdk.

License
This project is licensed under the MIT License—see the LICENSE file for details.

About
The official Typescript SDK for Model Context Protocol servers and clients

modelcontextprotocol.io
Resources
 Readme
License
 MIT license
Code of conduct
 Code of conduct
Security policy
 Security policy
 Activity
 Custom properties
Stars
 577 stars
Watchers
 22 watching
Forks
 41 forks
Report repository
Releases 13
1.0.3
Latest
4 hours ago
+ 12 releases
Contributors
5
@jspahrsummers
@dsp-ant
@anaisbetts
@ashwin-ant
@efritz
Deployments
9
 release 4 hours ago
+ 8 deployments
Languages
TypeScript
99.4%
""" HOW TO - MCP Server TypeScript

11.01 KB •508 lines
•
Formatting may be inconsistent from source
Your First MCP Server
TypeScript
Create a simple MCP server in TypeScript in 15 minutes

Let’s build your first MCP server in TypeScript! We’ll create a weather server that provides current weather data as a resource and lets Claude fetch forecasts using tools.

This guide uses the OpenWeatherMap API. You’ll need a free API key from OpenWeatherMap to follow along.

​
Prerequisites
1
Install Node.js

You’ll need Node.js 18 or higher:


node --version  # Should be v18 or higher
npm --version
2
Create a new project

You can use our create-typescript-server tool to bootstrap a new project:


npx @modelcontextprotocol/create-server weather-server
cd weather-server
3
Install dependencies


npm install --save axios dotenv
4
Set up environment

Create .env:


OPENWEATHER_API_KEY=your-api-key-here
Make sure to add your environment file to .gitignore


.env
​
Create your server
1
Define types

Create a file src/types.ts, and add the following:


export interface OpenWeatherResponse {
  main: {
    temp: number;
    humidity: number;
  };
  weather: Array<{
    description: string;
  }>;
  wind: {
    speed: number;
  };
  dt_txt?: string;
}

export interface WeatherData {
  temperature: number;
  conditions: string;
  humidity: number;
  wind_speed: number;
  timestamp: string;
}

export interface ForecastDay {
  date: string;
  temperature: number;
  conditions: string;
}

export interface GetForecastArgs {
  city: string;
  days?: number;
}

// Type guard for forecast arguments
export function isValidForecastArgs(args: any): args is GetForecastArgs {
  return (
    typeof args === "object" && 
    args !== null && 
    "city" in args &&
    typeof args.city === "string" &&
    (args.days === undefined || typeof args.days === "number")
  );
}
2
Add the base code

Replace src/index.ts with the following:


#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ErrorCode,
  McpError
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import dotenv from "dotenv";
import { 
  WeatherData, 
  ForecastDay, 
  OpenWeatherResponse,
  isValidForecastArgs 
} from "./types.js";

dotenv.config();

const API_KEY = process.env.OPENWEATHER_API_KEY;
if (!API_KEY) {
  throw new Error("OPENWEATHER_API_KEY environment variable is required");
}

const API_CONFIG = {
  BASE_URL: 'http://api.openweathermap.org/data/2.5',
  DEFAULT_CITY: 'San Francisco',
  ENDPOINTS: {
    CURRENT: 'weather',
    FORECAST: 'forecast'
  }
} as const;

class WeatherServer {
  private server: Server;
  private axiosInstance;

  constructor() {
    this.server = new Server({
      name: "example-weather-server",
      version: "0.1.0"
    }, {
      capabilities: {
        resources: {},
        tools: {}
      }
    });

    // Configure axios with defaults
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      params: {
        appid: API_KEY,
        units: "metric"
      }
    });

    this.setupHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error("[MCP Error]", error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupHandlers(): void {
    this.setupResourceHandlers();
    this.setupToolHandlers();
  }

  private setupResourceHandlers(): void {
    // Implementation continues in next section
  }

  private setupToolHandlers(): void {
    // Implementation continues in next section
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    // Although this is just an informative message, we must log to stderr,
    // to avoid interfering with MCP communication that happens on stdout
    console.error("Weather MCP server running on stdio");
  }
}

const server = new WeatherServer();
server.run().catch(console.error);
3
Add resource handlers

Add this to the setupResourceHandlers method:


private setupResourceHandlers(): void {
  this.server.setRequestHandler(
    ListResourcesRequestSchema,
    async () => ({
      resources: [{
        uri: `weather://${API_CONFIG.DEFAULT_CITY}/current`,
        name: `Current weather in ${API_CONFIG.DEFAULT_CITY}`,
        mimeType: "application/json",
        description: "Real-time weather data including temperature, conditions, humidity, and wind speed"
      }]
    })
  );

  this.server.setRequestHandler(
    ReadResourceRequestSchema,
    async (request) => {
      const city = API_CONFIG.DEFAULT_CITY;
      if (request.params.uri !== `weather://${city}/current`) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          `Unknown resource: ${request.params.uri}`
        );
      }

      try {
        const response = await this.axiosInstance.get<OpenWeatherResponse>(
          API_CONFIG.ENDPOINTS.CURRENT,
          {
            params: { q: city }
          }
        );

        const weatherData: WeatherData = {
          temperature: response.data.main.temp,
          conditions: response.data.weather[0].description,
          humidity: response.data.main.humidity,
          wind_speed: response.data.wind.speed,
          timestamp: new Date().toISOString()
        };

        return {
          contents: [{
            uri: request.params.uri,
            mimeType: "application/json",
            text: JSON.stringify(weatherData, null, 2)
          }]
        };
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new McpError(
            ErrorCode.InternalError,
            `Weather API error: ${error.response?.data.message ?? error.message}`
          );
        }
        throw error;
      }
    }
  );
}
4
Add tool handlers

Add these handlers to the setupToolHandlers method:


private setupToolHandlers(): void {
  this.server.setRequestHandler(
    ListToolsRequestSchema,
    async () => ({
      tools: [{
        name: "get_forecast",
        description: "Get weather forecast for a city",
        inputSchema: {
          type: "object",
          properties: {
            city: {
              type: "string",
              description: "City name"
            },
            days: {
              type: "number",
              description: "Number of days (1-5)",
              minimum: 1,
              maximum: 5
            }
          },
          required: ["city"]
        }
      }]
    })
  );

  this.server.setRequestHandler(
    CallToolRequestSchema,
    async (request) => {
      if (request.params.name !== "get_forecast") {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`
        );
      }

      if (!isValidForecastArgs(request.params.arguments)) {
        throw new McpError(
          ErrorCode.InvalidParams,
          "Invalid forecast arguments"
        );
      }

      const city = request.params.arguments.city;
      const days = Math.min(request.params.arguments.days || 3, 5);

      try {
        const response = await this.axiosInstance.get<{
          list: OpenWeatherResponse[]
        }>(API_CONFIG.ENDPOINTS.FORECAST, {
          params: {
            q: city,
            cnt: days * 8 // API returns 3-hour intervals
          }
        });

        const forecasts: ForecastDay[] = [];
        for (let i = 0; i < response.data.list.length; i += 8) {
          const dayData = response.data.list[i];
          forecasts.push({
            date: dayData.dt_txt?.split(' ')[0] ?? new Date().toISOString().split('T')[0],
            temperature: dayData.main.temp,
            conditions: dayData.weather[0].description
          });
        }

        return {
          content: [{
            type: "text",
            text: JSON.stringify(forecasts, null, 2)
          }]
        };
      } catch (error) {
        if (axios.isAxiosError(error)) {
          return {
            content: [{
              type: "text",
              text: `Weather API error: ${error.response?.data.message ?? error.message}`
            }],
            isError: true,
          }
        }
        throw error;
      }
    }
  );
}
5
Build and test


npm run build
​
Connect to Claude Desktop
1
Update Claude config

If you didn’t already connect to Claude Desktop during project setup, add to claude_desktop_config.json:


{
  "mcpServers": {
    "weather": {
      "command": "node",
      "args": ["/path/to/weather-server/build/index.js"],
      "env": {
        "OPENWEATHER_API_KEY": "your-api-key",
      }
    }
  }
}
2
Restart Claude

Quit Claude completely
Start Claude again
Look for your weather server in the 🔌 menu
​
Try it out!

Check Current Weather


Get a Forecast


Compare Weather

​
Understanding the code
Type Safety
Resources
Tools

interface WeatherData {
  temperature: number;
  conditions: string;
  humidity: number;
  wind_speed: number;
  timestamp: string;
}
TypeScript adds type safety to our MCP server, making it more reliable and easier to maintain.

​
Best practices
Error Handling
When a tool encounters an error, return the error message with isError: true, so the model can self-correct:


try {
  const response = await axiosInstance.get(...);
} catch (error) {
  if (axios.isAxiosError(error)) {
    return {
      content: {
        mimeType: "text/plain",
        text: `Weather API error: ${error.response?.data.message ?? error.message}`
      },
      isError: true,
    }
  }
  throw error;
}
For other handlers, throw an error, so the application can notify the user:


try {
  const response = await this.axiosInstance.get(...);
} catch (error) {
  if (axios.isAxiosError(error)) {
    throw new McpError(
      ErrorCode.InternalError,
      `Weather API error: ${error.response?.data.message}`
    );
  }
  throw error;
}
Type Validation

function isValidForecastArgs(args: any): args is GetForecastArgs {
  return (
    typeof args === "object" && 
    args !== null && 
    "city" in args &&
    typeof args.city === "string"
  );
}
You can also use libraries like Zod to perform this validation automatically.
​
Available transports
While this guide uses stdio to run the MCP server as a local process, MCP supports other transports as well.

​
Troubleshooting
The following troubleshooting tips are for macOS. Guides for other platforms are coming soon.

​
Build errors

# Check TypeScript version
npx tsc --version

# Clean and rebuild
rm -rf build/
npm run build
​
Runtime errors
Look for detailed error messages in the Claude Desktop logs:


# Monitor logs
tail -n 20 -f ~/Library/Logs/Claude/mcp*.log
​
Type errors

# Check types without building
npx tsc --noEmit
​
Next steps
Architecture overview
Learn more about the MCP architecture

TypeScript SDK
Check out the TypeScript SDK on GitHub

Need help? Ask Claude! Since it has access to the MCP SDK documentation, it can help you debug issues and suggest improvements to your server.
