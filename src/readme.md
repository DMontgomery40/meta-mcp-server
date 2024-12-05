{
  "name": "meta-mcp-server",
  "version": "1.0.0",
  "type": "module",
  "main": "build/main.js",        // Change this
  "bin": {
    "meta-mcp-server": "build/main.js"  // Add this
  },
  "scripts": {
    "build": "tsc",
    "start": "node build/main.js"  // Change this
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "0.6.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.24",
    "typescript": "^5.3.3"
  }
}