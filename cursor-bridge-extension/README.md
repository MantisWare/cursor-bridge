# 🦸‍♂️ CursorBridge Chrome Extension

> Turn your AI into a browser-savvy superhero! 🦸‍♂️

The CursorBridge Chrome Extension is the magical bridge between your browser and AI code editors! It's like giving your AI a pair of super-powered glasses to see everything happening in your browser! 👓✨

## 🎯 What This Extension Does

This Chrome extension is the **browser whisperer** that captures and sends data to your AI code editor, making debugging and development a breeze! It's the secret sauce that makes your AI understand what's happening in your browser! 🕵️‍♀️

### ✨ Key Features

- **👀 Console Log Monitoring** - See what's happening behind the scenes!
- **🐛 Error Tracking** - Catch those sneaky console errors that are causing trouble!
- **🌐 Network Traffic Spy** - Monitor all network requests and responses!
- **📸 Screenshot Magic** - Capture perfect screenshots with optional auto-paste into Cursor!
- **🎯 Element Inspector** - Inspect the element that caught your eye!
- **🧹 Log Management** - Clean slate time! Wipe all those browser logs and start fresh!
- **⚡ Real-time Communication** - WebSocket connection for instant data transfer!

## 🚀 How It Works

The extension works like a digital detective, constantly monitoring your browser and sending information to the CursorBridge server:

1. **🔍 Monitoring Phase** - Watches console logs, network requests, and user interactions
2. **📡 Communication Phase** - Sends data to the CursorBridge server via WebSocket
3. **🤖 AI Integration Phase** - Your AI code editor receives the data and can help debug!

## 🛠️ Installation

### Prerequisites

- 🌐 **Google Chrome or Chromium-based Browser** (required for extension functionality!)
- 🖥️ **CursorBridge Server** running (the brain of the operation!)
- 🤖 **MCP Client Application** (Cursor, Windsurf, RooCode, etc.)

### Quick Setup

1. **📥 Download the Extension**
   ```bash
   git clone https://github.com/MantisWare/cursor-bridge.git
   ```

2. **🔧 Install in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (top right toggle)
   - Click "Load unpacked" and select the `cursor-bridge-extension` folder
   - You should see **CursorBridge MCP** in your extensions list! 🎉

3. **⚙️ Configure the Extension**
   - Open Chrome DevTools (F12 or right-click → Inspect)
   - Look for the "CursorBridge" panel
   - Configure screenshot paths and logging settings

4. **🚀 Start the Server**
   ```bash
   npx @mantisware/cursor-bridge-server@latest
   ```

5. **🎯 Connect Your AI**
   - Set up the MCP server in your AI code editor
   - Start debugging with superpowers! ✨

## 🎮 Usage

### Basic Usage

1. **🔍 Open DevTools** - Right-click on any page and select "Inspect"
2. **📱 Navigate to CursorBridge Panel** - Look for the "CursorBridge" tab
3. **⚙️ Configure Settings** - Set screenshot paths, log limits, etc.
4. **🚀 Start Monitoring** - The extension automatically starts capturing data!

### Advanced Features

- **📸 Manual Screenshots** - Click the screenshot button in the panel
- **🧹 Log Management** - Wipe logs when they get too cluttered
- **⚙️ Settings Tuning** - Adjust log limits and screenshot preferences
- **🔗 Connection Status** - See if you're connected to the server

## 🔧 Configuration

### Screenshot Settings

- **📁 Default Path** - Screenshots save to `./screenshots` in your project root
- **🔄 Auto-paste** - Automatically paste screenshots into Cursor (macOS only)
- **📸 Manual Capture** - Take screenshots on demand

### Logging Settings

- **📊 Log Limits** - Control how many logs to keep in memory
- **🔍 Filter Options** - Choose which types of logs to capture
- **🧹 Auto-cleanup** - Automatic log rotation and cleanup

## 🆘 Troubleshooting

### Common Issues

**🔌 Extension Not Connecting**
- Make sure the CursorBridge server is running
- Check that the WebSocket connection is established
- Verify the extension is enabled in Chrome

**📸 Screenshots Not Working**
- Check the screenshot path in the extension panel
- Ensure the directory exists and is writable
- Try taking a manual screenshot first

**📝 Logs Not Appearing**
- Make sure DevTools is open in the tab you want to monitor
- Check the extension panel for connection status
- Try refreshing the page

**🌐 Network Issues**
- Verify the server is running on the correct port
- Check firewall settings
- Ensure the extension has proper permissions

### Debug Mode

1. **🔍 Open Chrome DevTools** (F12)
2. **📱 Go to Console Tab**
3. **👀 Look for CursorBridge Messages** - Should see connection status
4. **🔧 Check Extension Panel** - Verify settings and connection

## 🐛 Debugging Chrome Extensions

> Become a debugging detective! 🕵️‍♀️ Here's how to debug your CursorBridge extension like a pro!

Debugging Chrome extensions is like being a digital detective - you need the right tools and know where to look! 🕵️‍♀️✨

### 🚀 Loading the Extension for Debugging

1. **🔧 Enable Developer Mode**
   - Navigate to `chrome://extensions` in your browser
   - Toggle "Developer mode" in the top right corner (it's like turning on your detective mode! 🕵️‍♀️)
   - Click "Load unpacked" and select the `cursor-bridge-extension` folder
   - You should see **CursorBridge MCP** in your extensions list! 🎉

### 🔍 Debugging Background Service Workers

**The Brain of Your Extension! 🧠**

1. **📍 Find Your Extension**
   - Go to `chrome://extensions`
   - Locate your CursorBridge extension
   - Click on the "Service Worker" link (or "background page") to open a dedicated Developer Tools window

2. **🛠️ Debug Like a Pro**
   - Set breakpoints in your background script
   - Inspect variables and view console logs
   - Watch the magic happen in real-time! ✨

3. **⚡ Test Service Worker Behavior**
   - Go to `chrome://serviceworker-internals`
   - Manually terminate the service worker to test wake-up behavior
   - It's like testing if your detective can wake up from a nap! 😴

### 🎯 Debugging Content Scripts

**The Spies in Your Web Pages! 🕵️‍♀️**

1. **🌐 Open the Target Page**
   - Navigate to the webpage where your content script is injected
   - Open Developer Tools (F12 or right-click → "Inspect")

2. **🔍 Find Your Content Scripts**
   - Go to the **Sources** tab
   - Look for the "Content Scripts" section in the left pane
   - Your content script files will be listed there (like finding your spies in the field! 🕵️‍♀️)

3. **🎯 Set Breakpoints and Test**
   - Set breakpoints within your content script code
   - Interact with the webpage to trigger them
   - Watch your spies in action! 🕵️‍♀️

### 🎪 Debugging Popups and Extension Pages

**The User Interface Components! 🎨**

1. **📱 Debugging Popups**
   - Right-click on the extension's icon in the toolbar
   - Select "Inspect popup" (it's like peeking behind the curtain! 🎭)
   - This opens Developer Tools specifically for the popup's context

2. **🔧 Debugging Other Extension Pages**
   - Navigate directly to the page's URL (e.g., `chrome-extension://YOUR_EXTENSION_ID/options.html`)
   - Open Developer Tools as you would for any webpage
   - It's like debugging a mini-website! 🌐

### 🛠️ General Debugging Tips

**Become a Debugging Master! 🎓**

1. **📝 Console Logging**
   - Use `console.log()` statements throughout your code
   - Output information to the Developer Tools console
   - It's like leaving breadcrumbs for your detective work! 🍞

2. **⏸️ Breakpoints**
   - Set breakpoints in the Sources tab
   - Pause execution at specific lines of code
   - Inspect the state of your application
   - It's like freezing time to examine the evidence! ⏰

3. **🔄 Reloading**
   - After making changes, click the "Reload" button for your extension
   - Apply changes without restarting Chrome
   - It's like refreshing your detective's memory! 🧠

4. **📊 Task Manager**
   - Use Chrome's Task Manager (Shift+Esc)
   - Monitor your extension's resource usage (memory, CPU, network)
   - It's like checking your detective's health stats! 💪

### 🎯 CursorBridge-Specific Debugging

**Debugging Your Browser Whisperer! 🦸‍♂️**

1. **🔌 WebSocket Connection Issues**
   - Check the console for WebSocket connection errors
   - Verify the server is running on the correct port
   - Look for "Chrome extension connected via WebSocket" messages

2. **📸 Screenshot Debugging**
   - Check the extension panel for screenshot settings
   - Verify the screenshot path is correct
   - Look for "Screenshot saved successfully" messages

3. **📝 Log Capture Issues**
   - Ensure DevTools is open in the target tab
   - Check the extension panel for log limits
   - Look for "Received Extension Log" messages in the server console

4. **🌐 Network Monitoring**
   - Check if network requests are being captured
   - Verify the extension has proper permissions
   - Look for "Adding network request" messages

### 🚨 Common Debugging Scenarios

**When Things Go Wrong! 😅**

**🔌 "Extension Not Connecting"**
- Check the server console for connection attempts
- Verify the WebSocket URL is correct
- Look for "Chrome extension connected" messages

**📸 "Screenshots Not Saving"**
- Check the screenshot path in the extension panel
- Verify the directory exists and is writable
- Look for "Screenshot saved successfully" messages

**📝 "Logs Not Appearing"**
- Ensure DevTools is open in the target tab
- Check the extension panel for connection status
- Look for "Received Extension Log" messages

**🌐 "Network Data Missing"**
- Verify the extension has network permissions
- Check the extension panel for network settings
- Look for "Adding network request" messages

### 🎉 Debugging Success Tips

**Become a Debugging Superhero! 🦸‍♂️**

1. **🔍 Use the Right Tools** - Chrome DevTools is your best friend!
2. **📝 Log Everything** - Console logs are your breadcrumbs!
3. **⏸️ Use Breakpoints** - Freeze time to examine the evidence!
4. **🔄 Test Incrementally** - Make small changes and test often!
5. **📊 Monitor Resources** - Keep an eye on performance!
6. **🤝 Ask for Help** - The community is here to help! 🆘

Remember: Debugging is like being a digital detective - you need patience, the right tools, and a keen eye for detail! 🕵️‍♀️✨

## 🏗️ Architecture

### Components

- **🔌 Background Script** - Handles extension lifecycle and communication
- **🛠️ DevTools Panel** - User interface for configuration and monitoring
- **📡 Content Scripts** - Inject into web pages to capture data
- **🌐 WebSocket Client** - Real-time communication with the server

### Data Flow

```
Browser Page → Content Script → Background Script → WebSocket → Server → AI Editor
```

## 🔒 Permissions

The extension requires these permissions:

- **🔍 `activeTab`** - Access to the current tab for data capture
- **🐛 `debugger`** - Access to DevTools for advanced debugging
- **🌐 `storage`** - Store configuration and settings
- **📡 `webRequest`** - Monitor network traffic

## 🚀 Development

### Building from Source

1. **📥 Clone the Repository**
   ```bash
   git clone https://github.com/MantisWare/cursor-bridge.git
   cd cursor-bridge/cursor-bridge-extension
   ```

2. **🔧 Install Dependencies**
   ```bash
   npm install
   ```

3. **🏗️ Build the Extension**
   ```bash
   npm run build
   ```

4. **📦 Load in Chrome**
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the extension folder

### Contributing

We welcome contributions! 🎉

1. **🍴 Fork the Repository**
2. **🌿 Create a Feature Branch**
3. **💻 Make Your Changes**
4. **🧪 Test Thoroughly**
5. **📝 Submit a Pull Request**

## 📚 API Reference

### WebSocket Messages

**📤 Outgoing (Extension → Server)**
- `console-log` - Console log entries
- `console-error` - Console error entries
- `network-request` - Network request data
- `screenshot-data` - Screenshot capture data
- `page-navigated` - Page navigation events

**📥 Incoming (Server → Extension)**
- `take-screenshot` - Request to capture screenshot
- `wipe-logs` - Clear all stored logs
- `update-settings` - Update extension settings

### Configuration Options

```javascript
{
  logLimit: 50,           // Maximum logs to keep
  screenshotPath: "./screenshots",  // Screenshot save path
  autoPaste: true,        // Auto-paste screenshots (macOS)
  showRequestHeaders: false,  // Include request headers
  showResponseHeaders: false  // Include response headers
}
```

## 🎉 Success Stories

> "This extension turned my debugging from a nightmare into a dream! My AI now understands exactly what's happening in my browser!" - Happy Developer 🎉

> "The screenshot feature is magical! I can show my AI exactly what I'm seeing and get instant help!" - Another Happy Developer ✨

## 🤝 Support

Having issues? We're here to help! 🆘

- **📧 Contact** - [@tedx_ai on X](https://x.com/tedx_ai)
- **🐛 Issues** - [GitHub Issues](https://github.com/MantisWare/cursor-bridge/issues)
- **💬 Discussions** - [GitHub Discussions](https://github.com/MantisWare/cursor-bridge/discussions)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Built with ❤️ by [@tedx_ai](https://x.com/tedx_ai) - because debugging should be fun! 🎉*

**Remember**: This extension is the bridge between your browser and AI - it's like having a digital assistant that can see everything happening in your web development! 🦸‍♂️✨
