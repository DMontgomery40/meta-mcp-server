# Meta MCP Server

The Meta MCP Server is a Model Context Protocol (MCP) based server designed to dynamically generate and manage MCP servers as per user specifications. This meta-server enables the creation of MCP server files and directories through automated processes, making it ideal for rapid development and testing environments.

## Features

- **Dynamic Server Generation**: Allows for the creation of customized MCP servers by specifying directories and files to be created.
- **Automated File Management**: Handles the creation of necessary directories and files for new servers automatically.
- **MCP Tool Integration**: Utilizes the Model Context Protocol SDK to manage tools and resources efficiently.
- **Error Handling**: Robust error management to ensure stability even when facing invalid inputs or system errors.
- **Debugging Support**: Detailed logging and system prompts to aid in debugging and operational transparency.

## Requirements

- Node.js (version 12.x or later)
- NPM (Node Package Manager)
- Access to a command-line interface (CLI) or terminal
- Basic understanding of JavaScript and server management

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/modelcontextprotocol/meta-mcp-server.git```
Navigate to the server directory:
```bash
cd meta-mcp-server
```
Install the required NPM packages:
```bash
npm install
```

## Usage

To start the server, run the following command in your terminal:
```bash
node index.js
```
This will initialize the meta-server, which will be ready to accept instructions for creating new MCP servers based on input parameters.

### Configure in Claude Desktop

```
{
  "outputDir": "path/to/output/directory",
  "files": [
    {
      "path": "relative/path/to/file.js",
      "content": "file content as a string"
    }
  ]
}
This JSON can be sent via a suitable MCP client that communicates with the meta-server through the MCP protocol.

Configuration
All configuration details, including paths and server settings, are managed within the config.json file. Modify this file to suit your environment and security requirements.

Security
This server does not implement advanced security measures and is intended for development purposes only. Ensure that it is operated in a secure environment, and consider implementing additional authentication and validation mechanisms for production use.

## Support
For support, feature requests, or to report bugs, please open an issue on the GitHub repository page.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

This README aims to provide clear instructions on the setup, usage, and customization of the meta-server, as well as important notes on security and support.