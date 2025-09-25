# 🚀 MCP TypeScript SDK ![NPM Version](mdc:https:/img.shields.io/npm/v/%40modelcontextprotocol%2Fsdk) ![MIT licensed](mdc:https:/img.shields.io/npm/l/%40modelcontextprotocol%2Fsdk)

> The magical toolkit for building AI-powered applications! ✨

## Table of Contents

- [Overview](mdc:#overview)
- [Installation](mdc:#installation)
- [Quickstart](mdc:#quickstart)
- [What is MCP?](mdc:#what-is-mcp)
- [Core Concepts](mdc:#core-concepts)
  - [Server](mdc:#server)
  - [Resources](mdc:#resources)
  - [Tools](mdc:#tools)
  - [Prompts](mdc:#prompts)
- [Running Your Server](mdc:#running-your-server)
  - [stdio](mdc:#stdio)
  - [HTTP with SSE](mdc:#http-with-sse)
  - [Testing and Debugging](mdc:#testing-and-debugging)
- [Examples](mdc:#examples)
  - [Echo Server](mdc:#echo-server)
  - [SQLite Explorer](mdc:#sqlite-explorer)
- [Advanced Usage](mdc:#advanced-usage)
  - [Low-Level Server](mdc:#low-level-server)
  - [Writing MCP Clients](mdc:#writing-mcp-clients)
  - [Server Capabilities](mdc:#server-capabilities)

## 🎯 Overview (The Big Picture!)

The Model Context Protocol is like the universal translator for AI applications! It allows applications to provide context for LLMs in a standardized way, separating the concerns of providing context from the actual LLM interaction. This TypeScript SDK implements the full MCP specification, making it super easy to:

- 🏗️ **Build MCP clients** that can connect to any MCP server (universal compatibility!)
- 🛠️ **Create MCP servers** that expose resources, prompts and tools (be the server everyone wants to connect to!)
- 🌐 **Use standard transports** like stdio and SSE (because standards are awesome!)
- ⚡ **Handle all MCP protocol messages** and lifecycle events (we've got you covered!)

## 📦 Installation (Let's Get Started!)

Ready to dive into the world of MCP? Here's how to get your hands on this amazing SDK! 🎉

```bash
npm install @modelcontextprotocol/sdk
```

## 🚀 Quick Start (The Fun Part!)

Let's create a simple MCP server that exposes a calculator tool and some data! It's like building your first robot, but for AI! 🤖

```typescript
import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create an MCP server (the magic begins here!)
const server = new McpServer({
  name: "Demo",
  version: "1.0.0", // 1.0.0 - we're in the future! 🚀
});

// Add an addition tool (math magic! 🧮)
server.tool("add", { a: z.number(), b: z.number() }, async ({ a, b }) => ({
  content: [{ type: "text", text: String(a + b) }],
}));

// Add a dynamic greeting resource (personalized greetings! 👋)
server.resource(
  "greeting",
  new ResourceTemplate("greeting://{name}", { list: undefined }),
  async (uri, { name }) => ({
    contents: [
      {
        uri: uri.href,
        text: `Hello, ${name}!`,
      },
    ],
  })
);

// Start receiving messages on stdin and sending messages on stdout (the communication begins!)
const transport = new StdioServerTransport();
await server.connect(transport);
```

## 🤔 What is MCP? (The Magic Explained!)

The [Model Context Protocol (MCP)](mdc:https:/modelcontextprotocol.io) is like the universal language for AI applications! It lets you build servers that expose data and functionality to LLM applications in a secure, standardized way. Think of it like a web API, but specifically designed for LLM interactions (because AIs deserve their own special protocols!). MCP servers can:

- 📚 **Expose data through Resources** (think of these sort of like GET endpoints; they are used to load information into the LLM's context - it's like giving your AI a library!)
- 🛠️ **Provide functionality through Tools** (sort of like POST endpoints; they are used to execute code or otherwise produce a side effect - your AI's personal toolkit!)
- 💬 **Define interaction patterns through Prompts** (reusable templates for LLM interactions - because consistency is key!)
- ✨ **And more!** (the possibilities are endless!)

## 🧠 Core Concepts (The Building Blocks!)

### 🖥️ Server

The McpServer is your core interface to the MCP protocol - it's like the conductor of an orchestra! It handles connection management, protocol compliance, and message routing (all the behind-the-scenes magic!):

```typescript
const server = new McpServer({
  name: "My App",
  version: "1.0.0",
});
```

### Resources

Resources are how you expose data to LLMs. They're similar to GET endpoints in a REST API - they provide data but shouldn't perform significant computation or have side effects:

```typescript
// Static resource
server.resource("config", "config://app", async (uri) => ({
  contents: [
    {
      uri: uri.href,
      text: "App configuration here",
    },
  ],
}));

// Dynamic resource with parameters
server.resource(
  "user-profile",
  new ResourceTemplate("users://{userId}/profile", { list: undefined }),
  async (uri, { userId }) => ({
    contents: [
      {
        uri: uri.href,
        text: `Profile data for user ${userId}`,
      },
    ],
  })
);
```

### Tools

Tools let LLMs take actions through your server. Unlike resources, tools are expected to perform computation and have side effects:

```typescript
// Simple tool with parameters
server.tool(
  "calculate-bmi",
  {
    weightKg: z.number(),
    heightM: z.number(),
  },
  async ({ weightKg, heightM }) => ({
    content: [
      {
        type: "text",
        text: String(weightKg / (heightM * heightM)),
      },
    ],
  })
);

// Async tool with external API call
server.tool("fetch-weather", { city: z.string() }, async ({ city }) => {
  const response = await fetch(`https://api.weather.com/${city}`);
  const data = await response.text();
  return {
    content: [{ type: "text", text: data }],
  };
});
```

### Prompts

Prompts are reusable templates that help LLMs interact with your server effectively:

```typescript
server.prompt("review-code", { code: z.string() }, ({ code }) => ({
  messages: [
    {
      role: "user",
      content: {
        type: "text",
        text: `Please review this code:\n\n${code}`,
      },
    },
  ],
}));
```

## Running Your Server

MCP servers in TypeScript need to be connected to a transport to communicate with clients. How you start the server depends on the choice of transport:

### stdio

For command-line tools and direct integrations:

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new McpServer({
  name: "example-server",
  version: "1.0.0",
});

// ... set up server resources, tools, and prompts ...

const transport = new StdioServerTransport();
await server.connect(transport);
```

### HTTP with SSE

For remote servers, start a web server with a Server-Sent Events (SSE) endpoint, and a separate endpoint for the client to send its messages to:

```typescript
import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

const server = new McpServer({
  name: "example-server",
  version: "1.0.0",
});

// ... set up server resources, tools, and prompts ...

const app = express();

app.get("/sse", async (req, res) => {
  const transport = new SSEServerTransport("/messages", res);
  await server.connect(transport);
});

app.post("/messages", async (req, res) => {
  // Note: to support multiple simultaneous connections, these messages will
  // need to be routed to a specific matching transport. (This logic isn't
  // implemented here, for simplicity.)
  await transport.handlePostMessage(req, res);
});

app.listen(3001);
```

### Testing and Debugging

To test your server, you can use the [MCP Inspector](mdc:https:/github.com/modelcontextprotocol/inspector). See its README for more information.

## Examples

### Echo Server

A simple server demonstrating resources, tools, and prompts:

```typescript
import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const server = new McpServer({
  name: "Echo",
  version: "1.0.0",
});

server.resource(
  "echo",
  new ResourceTemplate("echo://{message}", { list: undefined }),
  async (uri, { message }) => ({
    contents: [
      {
        uri: uri.href,
        text: `Resource echo: ${message}`,
      },
    ],
  })
);

server.tool("echo", { message: z.string() }, async ({ message }) => ({
  content: [{ type: "text", text: `Tool echo: ${message}` }],
}));

server.prompt("echo", { message: z.string() }, ({ message }) => ({
  messages: [
    {
      role: "user",
      content: {
        type: "text",
        text: `Please process this message: ${message}`,
      },
    },
  ],
}));
```

### SQLite Explorer

A more complex example showing database integration:

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import sqlite3 from "sqlite3";
import { promisify } from "util";
import { z } from "zod";

const server = new McpServer({
  name: "SQLite Explorer",
  version: "1.0.0",
});

// Helper to create DB connection
const getDb = () => {
  const db = new sqlite3.Database("database.db");
  return {
    all: promisify<string, any[]>(db.all.bind(db)),
    close: promisify(db.close.bind(db)),
  };
};

server.resource("schema", "schema://main", async (uri) => {
  const db = getDb();
  try {
    const tables = await db.all(
      "SELECT sql FROM sqlite_master WHERE type='table'"
    );
    return {
      contents: [
        {
          uri: uri.href,
          text: tables.map((t: { sql: string }) => t.sql).join("\n"),
        },
      ],
    };
  } finally {
    await db.close();
  }
});

server.tool("query", { sql: z.string() }, async ({ sql }) => {
  const db = getDb();
  try {
    const results = await db.all(sql);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(results, null, 2),
        },
      ],
    };
  } catch (err: unknown) {
    const error = err as Error;
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  } finally {
    await db.close();
  }
});
```

## Advanced Usage

### Low-Level Server

For more control, you can use the low-level Server class directly:

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  {
    name: "example-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      prompts: {},
    },
  }
);

server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: "example-prompt",
        description: "An example prompt template",
        arguments: [
          {
            name: "arg1",
            description: "Example argument",
            required: true,
          },
        ],
      },
    ],
  };
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  if (request.params.name !== "example-prompt") {
    throw new Error("Unknown prompt");
  }
  return {
    description: "Example prompt",
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: "Example prompt text",
        },
      },
    ],
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

### Writing MCP Clients

The SDK provides a high-level client interface:

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "node",
  args: ["server.js"],
});

const client = new Client(
  {
    name: "example-client",
    version: "1.0.0",
  },
  {
    capabilities: {
      prompts: {},
      resources: {},
      tools: {},
    },
  }
);

await client.connect(transport);

// List prompts
const prompts = await client.listPrompts();

// Get a prompt
const prompt = await client.getPrompt("example-prompt", {
  arg1: "value",
});

// List resources
const resources = await client.listResources();

// Read a resource
const resource = await client.readResource("file:///example.txt");

// Call a tool
const result = await client.callTool({
  name: "example-tool",
  arguments: {
    arg1: "value",
  },
});
```

## Documentation

- [Model Context Protocol documentation](mdc:https:/modelcontextprotocol.io)
- [MCP Specification](mdc:https:/spec.modelcontextprotocol.io)
- [Example Servers](mdc:https:/github.com/modelcontextprotocol/servers)

## Contributing

Issues and pull requests are welcome on GitHub at https://github.com/modelcontextprotocol/typescript-sdk.

## License

This project is licensed under the MIT License—see the [LICENSE](mdc:LICENSE) file for details.
