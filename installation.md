# 🚀 CursorBridge MCP Installation Guide

> Turn your AI into a browser-savvy superhero! 🦸‍♂️

CursorBridge MCP embeds AI code editors and agents directly into your web browser, giving them the ability to monitor and interact with your web browser for highly effective debugging and a more seamless developer experience - all in a safe and secure manner! It's like giving your AI a pair of super-powered glasses! 👓✨

## 🎯 What You'll Get

With this MCP server tool, you can enable AI code editors and agents to have access to:

- 👀 **Console logs and errors** - See what's happening behind the scenes!
- 🌐 **XHR network requests/responses** - Spy on all the network traffic!
- 📸 **Screenshot capabilities** with optional auto-paste into Cursor
- 🎯 **Currently selected DOM elements** - What's the user really clicking on?
- ♿ **Run SEO, Performance & Code Quality Scans** via Lighthouse
- ⚛️ **Run a NextJS-specific SEO audit** - Special NextJS powers activated!
- 🕵️‍♀️ **Enter into "Debugger Mode"** which uses many tools + prompts to fix bugs
- 🎯 **Enter into "Audit Mode"** to perform a comprehensive web app audit

That way, you can simply tell Cursor or any AI code editor with MCP integrations:

- "This isn't working… enter debugger mode!"
- "Can you edit the currently selected element to do x, y and z?"
- "I need to improve SEO and performance… enter audit mode"
- "Can you check console and network logs to see what went wrong?"
- "Something doesn't look right in the UI. Can you take a screenshot?"

## 📋 Requirements

Before we start this adventure, make sure you have:

- 🟢 **NodeJS installed** on your machine (the foundation of everything!)
- 🌐 **Google Chrome or a Chromium-based Browser** (required for audit functionality!)
- 🤖 **MCP Client Application** (Cursor, Windsurf, RooCode, Cline, Continue, Zed, Claude Desktop)

**Note**: Model Context Protocol (MCP) is specific to Anthropic models. When using an editor like Cursor, make sure to enable composer agent with Claude 3.5 Sonnet selected as the model.

## 🛠️ Installation (Let's Get This Party Started!)

### 1. 📥 Download & Install the Chrome Extension

The official chrome extension is pending approval on the Google extension marketplace. For now, you can:

**Option A**: Download from our repository
- Clone the repo and find the extension within the `cursor-bridge-extension` directory:

```bash
git clone https://github.com/MantisWare/cursor-bridge.git
```

**Option B**: Download the extension directly
- Click here to download the extension (link coming soon!)

**Installation Steps:**

**1a.** Open 'Manage Extensions' 🎛️
- Open the Manage Extensions Screen

**1b.** Enable 'Developer Mode' and click 'Load unpacked' 🔧
- Manage & Load Chrome Extensions

**1c.** Navigate to the chrome extension folder downloaded earlier, make sure it's unzipped and click 'Select'. You should see **CursorBridge MCP** in your list of extensions now! 🎉

### 2. ⚙️ Setup CursorBridge MCP Tool in Your IDE

Setup CursorBridge MCP server in your favorite MCP client. Here's how to set this up inside of Cursor:

**2a.** Go to your 'Cursor Settings' ⚙️
- Open Cursor Settings

**2b.** Go to Features, scroll down to MCP Servers and click on 'Add new MCP server' 🆕
- Go to Cursor Features

**2c.** Give it a unique name (cursor-bridge), set type to 'command' and set command to:

**MacOS:**
```bash
npx @mantisware/cursor-bridge-mcp@latest
```

**Windows:**
```bash
npx @mantisware/cursor-bridge-mcp@latest
```

If using NPX on Windows, use this command to find the path to NPX:
```bash
which npx
```

**2d.** Confirm that the MCP server has been connected. You should see all the tools listed and a green circle next to the tool name. 🟢
- Wait a few seconds or click on the refresh button a few times if it does not register. If it still won't register make sure you entered the right command.

For more on this, check out the docs for these MCP clients:
- [Cursor](https://cursor.sh/)
- [Windsurf](https://codeium.com/windsurf)
- [Zed](https://zed.dev/)
- [RooCode](https://roocode.com/)
- [Cline](https://cline.ai/)
- [Claude Desktop](https://claude.ai/desktop)
- [LibreChat](https://librechat.ai/)

### 3. 🖥️ Run the CursorBridge Server

Aggregates logs from the chrome extension and sets up websockets for screenshot capture. Run this from your terminal within any directory:

```bash
npx @mantisware/cursor-bridge-server@latest
```

**Note**: The cursor-bridge-server runs on port 3035. Make sure to terminate any processes running on this port. In a future release, we will handle this gracefully.

### 4. 🔍 Open the Chrome Developer Console

Right click on any web page and click 'Inspect' to open the Chrome dev tools. Once open, logs will be accessible to the MCP client.

You can navigate to the CursorBridge panel to:
- 📸 Manually capture a screenshot
- 📁 Define a path to save screenshots to (defaults to: `./screenshots` in your project root)
- 🧹 Wipe all saved logs
- ⚙️ Modify logging size limits / truncation

**Note**: Logs will be wiped from the server everytime you refresh the page. You can manually wipe the logs by clicking the 'Wipe Logs' button in the CursorBridge panel.

## 🎉 Congratulations!

**You've successfully installed and configured CursorBridge MCP!** 🎉

After these steps, open Chrome DevTools and look for the CursorBridgeMCP panel. It's like finding a hidden treasure! 🏴‍☠️

## ⚙️ Cursor IDE Configuration (The Setup Magic!)

Ready to configure Cursor IDE? Here's exactly what your MCP configuration should look like! 🎯

### 📝 Cursor MCP Configuration

Add this configuration to your Cursor IDE settings. You can find the MCP settings in Cursor's preferences:

**For NPX (Recommended - Always Latest):**
```json
{
  "mcpServers": {
    "cursor-bridge-mcp": {
      "command": "npx",
      "args": ["@mantisware/cursor-bridge-mcp@latest"],
      "env": {}
    }
  }
}
```

**For Local Development:**
```json
{
  "mcpServers": {
    "cursor-bridge-mcp": {
      "command": "node",
      "args": ["/path/to/your/cursor-bridge-mcp/dist/mcp-server.js"],
      "env": {}
    }
  }
}
```

### 🔧 Alternative Configuration Options

**With Custom Environment Variables:**
```json
{
  "mcpServers": {
    "cursor-bridge-mcp": {
      "command": "npx",
      "args": ["@mantisware/cursor-bridge-mcp@latest"],
      "env": {
        "DEBUG": "cursor-bridge:*",
        "PORT": "3001"
      }
    }
  }
}
```

**For Development with Local Files:**
```json
{
  "mcpServers": {
    "cursor-bridge-mcp": {
      "command": "npx",
      "args": ["tsx", "/path/to/your/cursor-bridge-mcp/mcp-server.ts"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
```

### 🎯 Pro Tips for Configuration! 

- 🚀 **Use NPX**: The `npx` approach automatically gets the latest version - no manual updates needed!
- 🔄 **Restart Cursor**: After adding the MCP configuration, restart Cursor IDE to activate the connection
- 🐛 **Debug Mode**: Add `"DEBUG": "cursor-bridge:*"` to the env section for detailed logging
- 📁 **Local Path**: Replace `/path/to/your/cursor-bridge-mcp/` with your actual project path

### ✅ **Verification Step (Test Your Setup!)**

Once you've configured everything, test that your MCP connection is working! 🧪

**Test Command:**
```
Can you check if you can access my console logs with the cursor bridge tool?
```

If everything is set up correctly, your AI should be able to access the CursorBridge MCP tools and respond with something like this:

<div align="center">
  <img src="mcp_demo.png" alt="MCP Demo - AI accessing CursorBridge tools" width="80%" height="auto">
</div>

**What to Expect:**
- 🤖 Your AI should recognize and use the CursorBridge MCP tools
- 📊 You should see tool calls being made to access browser data
- 🎯 The AI should be able to retrieve console logs, network data, or take screenshots
- ✨ If successful, you'll see the MCP tools in action!

**If It's Not Working:**
- 🔄 Make sure both servers are running (`cursor-bridge-server` and `cursor-bridge-mcp`)
- 🌐 Ensure you have an active browser tab with the CursorBridge extension enabled
- 🔌 Check that the Chrome extension is connected (look for the CursorBridgeMCP panel in DevTools)
- 🚀 Try restarting Cursor IDE after adding the MCP configuration

## 🆘 Troubleshooting (AKA "Help, It's Not Working!")

Sometimes things go sideways, but we're here to help! Here are few common gotchas and steps you can take to get CursorBridge up and running:

1. ✅ Check to see if you've installed the MCP server into Cursor correctly
2. ✅ Make sure you're running the **@mantisware/cursor-bridge-server@latest** command in a new terminal
3. ✅ Make sure you've installed the chrome extension and opened chrome dev tools in the tab you want to capture logs from
4. ✅ If none of this works double-check the common gotchas below

And if you're STILL stuck... 🤔

1. Run this command in a new terminal to monitor the Cursor MCP logs:

```bash
tail -n 20 -F ~/Library/Application\ Support/Cursor/**/*MCP.log
```

2. Take a screenshot of those logs, a screenshot of the node server logs from cursor-bridge-server and if possible - go into the manage extensions window in chrome and click on an error button if present in the extension we installed earlier to capture a screenshot of that too

3. Contact us through GitHub issues with all the requested details and we'll get back to you as soon as possible!

### 🐛 Common Issues & Errors

#### Error: Screenshot tool is failing 📸

Cursor and some other MCP clients may not always fetch the correct version of the MCP server. Make sure to use `npx @mantisware/cursor-bridge-mcp@latest` instead to explicitly use the latest working version.

#### Issue: Cannot see my screenshots 📁

Screenshots will be default be saved to a `screenshots` folder in your project root directory. The folder will be created automatically if it doesn't exist! Make sure to check there for the screenshots. Otherwise, you can add a custom path to save screenshots to in the CursorBridge dev tools panel. We suggest creating a screenshots folder in your current project, right click on the folder and click on 'copy path'. Then paste that into the dev tools panel and press enter.

#### Issue: Not seeing any logs 📝

Make sure to open the chrome dev tools console in the browser tab that you want to capture logs from.

#### Issue: Seeing too many logs 📊

Close down any other tabs that have the chrome dev tools open. CursorBridge will capture logs across many tabs.

#### Issue: Logs keep disappearing! 🧹

Anytime you refresh the page or restart the node process running the cursor-bridge-server, your logs will be wiped.

#### Failed to send log to browser-connector? 🔌

You might have chrome dev tools / the inspector window open in other tabs! Closing those panels in each tab, then refreshing the tab of the project you're working on should fix this!

#### Issue: Encountering an unknown error ❓

Contact us through GitHub issues or add an issue to the Github repo.

## 🔧 Advanced Troubleshooting: Dependency Issues

If you're experiencing issues with the MCP server not showing tools or getting dependency-related errors, follow these steps:

### 🚨 Common Error: "Cannot find module 'uri-js'" or "Cannot find module 'ajv'"

This error typically occurs when NPX is using a cached version of the package with outdated dependencies. Here's how to fix it:

#### Step 1: Clear NPX Cache 🧹

**On macOS/Linux:**
```bash
rm -rf ~/.npm/_npx
```

**On Windows:**
```bash
rmdir /s "%USERPROFILE%\.npm\_npx"
```

#### Step 2: Verify the Fix ✅

Test that the MCP server is working correctly:

```bash
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}' | npx @mantisware/cursor-bridge-mcp@latest
```

**Expected Output:** You should see a JSON response with all 14 tools listed, including:
- `getConsoleLogs`, `getConsoleErrors`, `getNetworkErrors`, `getNetworkLogs`
- `takeScreenshot`, `getSelectedElement`, `wipeLogs`
- `runAccessibilityAudit`, `runPerformanceAudit`, `runSEOAudit`, `runNextJSAudit`
- `runDebuggerMode`, `runAuditMode`, `runBestPracticesAudit`

#### Step 3: Restart Your MCP Client 🔄

After clearing the cache and verifying the server works:

1. **Close Cursor completely**
2. **Reopen Cursor**
3. **Check the MCP panel** - you should now see all tools available

#### Step 4: Verify Both Servers Are Running 🖥️

Make sure both required servers are running:

**Terminal 1 - Browser Server:**
```bash
npx @mantisware/cursor-bridge-server@latest
```

**Terminal 2 - Test MCP Server (optional):**
```bash
npx @mantisware/cursor-bridge-mcp@latest
```

#### Step 5: Check Server Discovery 🔍

The MCP server should automatically discover the browser server. Look for these messages in the terminal:

```
Starting server discovery process
Successfully found server at 127.0.0.1:3035
Successfully discovered server at 127.0.0.1:3035
```

### 🛠️ Alternative Solutions

If the above steps don't work, try these alternatives:

#### Option A: Use Local Installation
Instead of using NPX, install the package locally:

```bash
npm install -g @mantisware/cursor-bridge-mcp@latest
```

Then update your Cursor MCP configuration to:
```json
{
  "mcpServers": {
    "cursor-bridge-mcp": {
      "command": "cursor-bridge-mcp",
      "args": [],
      "env": {}
    }
  }
}
```

#### Option B: Use MCP Inspector for Testing
Test your MCP server using the official inspector:

```bash
npx @modelcontextprotocol/inspector npx -- @mantisware/cursor-bridge-mcp@latest
```

This will open a web interface at `http://localhost:6274` where you can test all tools.

#### Option C: Force Latest Version
If you're still having issues, force NPX to use the latest version:

```bash
npx --yes @mantisware/cursor-bridge-mcp@latest
```

### 🎯 Success Indicators

You'll know everything is working when:

- ✅ MCP server shows "Successfully discovered server at 127.0.0.1:3035"
- ✅ All 14 tools are listed in your MCP client
- ✅ Tools can be called and return data (not just "No tools, prompts, or resources")
- ✅ Browser server is running and accessible on port 3035

### 🆘 Still Having Issues?

If you're still experiencing problems after following these steps:

1. **Check the logs** in both terminal windows for any error messages
2. **Verify your Cursor MCP configuration** matches the examples in this guide
3. **Make sure Chrome DevTools is open** in the tab you want to monitor
4. **Contact us** through GitHub issues with:
   - Screenshots of any error messages
   - Your operating system and Node.js version
   - The exact steps you followed

---

*Built with ❤️ by MantisWare - because debugging should be fun! 🎉*
