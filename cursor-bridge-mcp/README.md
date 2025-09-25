# 🤖 CursorBridge MCP Server

> The brain of the operation! Your AI's gateway to browser superpowers! 🧠✨

**Version: 1.0.0** 🚀

Meet the CursorBridge MCP Server - the Model Context Protocol (MCP) server that turns your AI into a browser debugging wizard! This server works hand-in-hand with the CursorBridge Server to give your AI the ability to see, analyze, and interact with everything happening in your browser. It's like giving your AI a pair of super-powered glasses! 👓🎯

## 🚀 Superpowers (AKA Features)

- 🧠 **MCP Protocol Implementation**: The brain that makes everything work together!
- 👀 **Browser Console Log Access**: See what's happening behind the scenes
- 🌐 **Network Request Analysis**: Track every data flow like a detective
- 📸 **Screenshot Capture Capabilities**: Snap the perfect moment every time
- 🎯 **Element Selection and Inspection**: Dive deep into what users are clicking on
- ⚡ **Real-time Browser State Monitoring**: Never miss a beat of what's happening
- 🔍 **Comprehensive Audits**: Accessibility, performance, SEO, and best practices audits that actually help!

## 📋 Prerequisites (What You Need!)

- 🟢 **Node.js 14 or higher** (the foundation of everything!)
- 🖥️ **CursorBridge Server running** (the middleman that makes it all work!)
- 🌐 **Chrome or Chromium browser installed** (required for audit functionality - because we need to see what you're seeing!)

## 📦 Installation (Let's Get This Party Started!)

Ready to give your AI some browser superpowers? Here's how! 🎉

```bash
npx @mantisware/cursor-bridge-mcp
```

Or if you want to install it globally (like a true power user!):

```bash
npm install -g @mantisware/cursor-bridge-mcp
```

## 🎮 Usage (The Fun Part!)

1. **Fire Up the Server**: First, make sure the CursorBridge Server is running:

```bash
npx @mantisware/cursor-bridge-server
```

2. **Start the MCP Magic**: Then start the MCP server:

```bash
npx @mantisware/cursor-bridge-mcp
```

3. **Watch the Magic Happen**: The MCP server will connect to the CursorBridge Server and provide these amazing capabilities:

- 📝 **Console Log Retrieval**: Get all the juicy console details
- 🌐 **Network Request Monitoring**: Track every network call
- 📸 **Screenshot Capture**: Snap perfect screenshots
- 🎯 **Element Selection**: See what users are focusing on
- 🔍 **Browser State Analysis**: Understand what's happening in real-time
- ♿ **Accessibility and Performance Audits**: Make your site better for everyone!

## 🛠️ MCP Functions (The Tools in Your Arsenal!)

The server provides these powerful MCP functions for your AI to use:

- 📝 `mcp_getConsoleLogs` - Retrieve browser console logs (all the details!)
- ❌ `mcp_getConsoleErrors` - Get browser console errors (the oops moments!)
- 🌐 `mcp_getNetworkErrors` - Get network error logs (when things go wrong!)
- ✅ `mcp_getNetworkSuccess` - Get successful network requests (the wins!)
- 🔄 `mcp_getNetworkLogs` - Get all network logs (the complete picture!)
- 🎯 `mcp_getSelectedElement` - Get the currently selected DOM element (what caught your eye!)
- ♿ `mcp_runAccessibilityAudit` - Run a WCAG-compliant accessibility audit (making the web inclusive!)
- ⚡ `mcp_runPerformanceAudit` - Run a performance audit (speed optimization time!)
- 🔍 `mcp_runSEOAudit` - Run an SEO audit (Google will love you!)
- ✅ `mcp_runBestPracticesAudit` - Run a best practices audit (following the rules!)

## 🤝 Integration (Playing Well with Others!)

This server is designed to work with AI tools and platforms that support the Model Context Protocol (MCP). It provides a standardized interface for AI models to interact with browser state and debugging information. It's like having a universal translator for browser data! 🌍✨

## 📄 License

MIT (because we believe in open source magic! ✨)
