// Store settings
let settings = {
  logLimit: 50,
  queryLimit: 30000,
  stringSizeLimit: 500,
  showRequestHeaders: false,
  showResponseHeaders: false,
  maxLogSize: 20000,
  screenshotPath: "",
  // Add server connection settings
  serverHost: "localhost",
  serverPort: 3035,
  allowAutoPaste: false, // Default auto-paste setting
};

// Track connection status
let serverConnected = false;
let reconnectAttemptTimeout = null;
// Add a flag to track ongoing discovery operations
let isDiscoveryInProgress = false;
// Add an AbortController to cancel fetch operations
let discoveryController = null;

// Helper function to safely send runtime messages
function safeSendMessage(message, callback) {
  try {
    // Check if the extension context is still valid
    if (chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          console.warn("Extension context may be invalidated:", chrome.runtime.lastError.message);
          return;
        }
        // Call the callback if provided and no error occurred
        if (callback && typeof callback === 'function') {
          callback(response);
        }
      });
    } else {
      console.warn("Extension context invalidated - cannot send message:", message.type);
    }
  } catch (error) {
    console.warn("Failed to send runtime message - extension context may be invalidated:", error.message);
  }
}

// Function to show the screenshot location
function showScreenshotLocation(path, copiedToClipboard = false) {
  const locationDiv = document.getElementById('last-screenshot-location');
  const pathDisplay = document.getElementById('screenshot-path-display');
  
  if (locationDiv && pathDisplay && path) {
    if (copiedToClipboard) {
      pathDisplay.innerHTML = `
        <div style="color: #60a5fa; margin-bottom: 8px; font-weight: 500;">
          Screenshot captured!
        </div>
        <div style="color: #9ca3af; font-size: 11px; margin-bottom: 4px;">
          ${settings.allowAutoPaste ? 'Auto-paste enabled - will paste to Cursor automatically' : 'Saved to:'}
        </div>
        <div style="font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; background: rgba(0, 0, 0, 0.2); padding: 4px 8px; border-radius: 4px; word-break: break-all; color: #60a5fa; font-size: 11px;">
          ${path}
        </div>
      `;
    } else {
      pathDisplay.textContent = path;
    }
    
    locationDiv.style.display = 'flex';
    
    // Hide the location after 10 seconds
    setTimeout(() => {
      locationDiv.style.display = 'none';
    }, 10000);
  }
}

// Function to show screenshot error messages
function showScreenshotError(errorMessage, isPermissionError = false) {
  const locationDiv = document.getElementById('last-screenshot-location');
  const pathDisplay = document.getElementById('screenshot-path-display');
  
  if (locationDiv && pathDisplay) {
    if (isPermissionError) {
      // Show permission-specific error message
      pathDisplay.innerHTML = `
        <div style="color: #f87171; margin-bottom: 8px;">
          <strong>Permission denied!</strong>
        </div>
        <div style="color: #e5e7eb; font-size: 11px; line-height: 1.4;">
          Please click on the extension icon in your browser toolbar and allow access to capture screenshots.
        </div>
      `;
    } else {
      // Show generic error message
      pathDisplay.innerHTML = `
        <div style="color: #f87171;">
          <strong>Error:</strong> ${errorMessage}
        </div>
      `;
    }
    
    locationDiv.style.display = 'flex';
    
    // Hide the error after 8 seconds
    setTimeout(() => {
      locationDiv.style.display = 'none';
    }, 8000);
  }
}

// Load saved settings on startup
chrome.storage.local.get(["browserConnectorSettings"], (result) => {
  if (result.browserConnectorSettings) {
    settings = { ...settings, ...result.browserConnectorSettings };
    updateUIFromSettings();
  }

  // Create connection status banner at the top
  createConnectionBanner();

  // Automatically discover server on panel load with quiet mode enabled
  discoverServer(true);
});

// Add listener for connection status updates from background script (page refresh events)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "CONNECTION_STATUS_UPDATE") {
    console.log(
      `Received connection status update: ${
        message.isConnected ? "Connected" : "Disconnected"
      }`
    );

    // Update UI based on connection status
    if (message.isConnected) {
      // If already connected, just maintain the current state
      if (!serverConnected) {
        // Connection was re-established, update UI
        serverConnected = true;
        updateConnectionBanner(true, {
          name: "Browser Tools Server",
          version: "reconnected",
          host: settings.serverHost,
          port: settings.serverPort,
        });
      }
    } else {
      // Connection lost, update UI to show disconnected
      serverConnected = false;
      updateConnectionBanner(false, null);
    }
  }

  if (message.type === "INITIATE_AUTO_DISCOVERY") {
    console.log(
      `Initiating auto-discovery after page refresh (reason: ${message.reason})`
    );

    // For page refreshes or if forceRestart is set to true, always cancel any ongoing discovery and restart
    if (message.reason === "page_refresh" || message.forceRestart === true) {
      // Cancel any ongoing discovery operation
      cancelOngoingDiscovery();

      // Update UI to indicate we're starting a fresh scan
      if (connectionStatusDiv) {
        connectionStatusDiv.style.display = "block";
        if (statusIcon) statusIcon.className = "status-indicator";
        if (statusText)
          statusText.textContent =
            "Page refreshed. Restarting server discovery...";
      }

      // Always update the connection banner when a page refresh occurs
      updateConnectionBanner(false, null);

      // Start a new discovery process with quiet mode
      console.log("Starting fresh discovery after page refresh");
      discoverServer(true);
    }
    // For other types of auto-discovery requests, only start if not already in progress
    else if (!isDiscoveryInProgress) {
      // Use quiet mode for auto-discovery to minimize UI changes
      discoverServer(true);
    }
  }

  // Handle successful server validation
  if (message.type === "SERVER_VALIDATION_SUCCESS") {
    console.log(
      `Server validation successful: ${message.serverHost}:${message.serverPort}`
    );

    // Update the connection status banner
    serverConnected = true;
    updateConnectionBanner(true, message.serverInfo);

    // If we were showing the connection status dialog, we can hide it now
    if (connectionStatusDiv && connectionStatusDiv.style.display === "block") {
      connectionStatusDiv.style.display = "none";
    }
  }

  // Handle failed server validation
  if (message.type === "SERVER_VALIDATION_FAILED") {
    console.log(
      `Server validation failed: ${message.reason} - ${message.serverHost}:${message.serverPort}`
    );

    // Update the connection status
    serverConnected = false;
    updateConnectionBanner(false, null);

    // Start auto-discovery if this was a page refresh validation
    if (
      message.reason === "connection_error" ||
      message.reason === "http_error"
    ) {
      // If we're not already trying to discover the server, start the process
      if (!isDiscoveryInProgress) {
        console.log("Starting auto-discovery after validation failure");
        discoverServer(true);
      }
    }
  }

  // Handle successful WebSocket connection
  if (message.type === "WEBSOCKET_CONNECTED") {
    console.log(
      `WebSocket connected to ${message.serverHost}:${message.serverPort}`
    );

    // Update connection status if it wasn't already connected
    if (!serverConnected) {
      serverConnected = true;
      updateConnectionBanner(true, {
        name: "Browser Tools Server",
        version: "connected via WebSocket",
        host: message.serverHost,
        port: message.serverPort,
      });
    }
  }
});

// Create connection status banner
function createConnectionBanner() {
  // Check if banner already exists
  if (document.getElementById("connection-banner")) {
    return;
  }

  // Create the banner
  const banner = document.createElement("div");
  banner.id = "connection-banner";
  banner.style.cssText = `
    padding: 6px 0px; 
    margin-bottom: 4px;
    width: 40%; 
    display: flex; 
    flex-direction: column;
    align-items: flex-start; 
    background-color:rgba(0,0,0,0);
    border-radius: 11px;
    font-size: 11px;
    font-weight: 500;
    color: #ffffff;
  `;

  // Create reconnect button (now placed at the top)
  const reconnectButton = document.createElement("button");
  reconnectButton.id = "banner-reconnect-btn";
  reconnectButton.textContent = "Reconnect";
  reconnectButton.style.cssText = `
    background-color: #333333;
    color: #ffffff;
    border: 1px solid #444444;
    border-radius: 3px;
    padding: 2px 8px;
    font-size: 10px;
    cursor: pointer;
    margin-bottom: 6px;
    align-self: flex-start;
    display: none;
    transition: background-color 0.2s;
  `;
  reconnectButton.addEventListener("mouseover", () => {
    reconnectButton.style.backgroundColor = "#444444";
  });
  reconnectButton.addEventListener("mouseout", () => {
    reconnectButton.style.backgroundColor = "#333333";
  });
  reconnectButton.addEventListener("click", () => {
    // Hide the button while reconnecting
    reconnectButton.style.display = "none";
    reconnectButton.textContent = "Reconnecting...";

    // Update UI to show searching state
    updateConnectionBanner(false, null);

    // Try to discover server
    discoverServer(false);
  });

  // Create a container for the status indicator and text
  const statusContainer = document.createElement("div");
  statusContainer.style.cssText = `
    display: flex;
    align-items: center;
    width: 100%;
  `;

  // Create status indicator
  const indicator = document.createElement("div");
  indicator.id = "banner-status-indicator";
  indicator.style.cssText = `
    width: 6px; 
    height: 6px; 
    position: relative;
    top: 1px;
    border-radius: 50%; 
    background-color: #ccc; 
    margin-right: 8px; 
    flex-shrink: 0;
    transition: background-color 0.3s ease;
  `;

  // Create status text
  const statusText = document.createElement("div");
  statusText.id = "banner-status-text";
  statusText.textContent = "Searching for server...";
  statusText.style.cssText =
    "flex-grow: 1; font-weight: 400; letter-spacing: 0.1px; font-size: 11px;";

  // Add elements to statusContainer
  statusContainer.appendChild(indicator);
  statusContainer.appendChild(statusText);

  // Add elements to banner - reconnect button first, then status container
  banner.appendChild(reconnectButton);
  banner.appendChild(statusContainer);

  // Add banner to the beginning of the document body
  // This ensures it's the very first element
  document.body.prepend(banner);

  // Set initial state
  updateConnectionBanner(false, null);
}

// Update the connection banner with current status
function updateConnectionBanner(connected, serverInfo) {
  const indicator = document.getElementById("banner-status-indicator");
  const statusText = document.getElementById("banner-status-text");
  const banner = document.getElementById("connection-banner");
  const reconnectButton = document.getElementById("banner-reconnect-btn");

  if (!indicator || !statusText || !banner || !reconnectButton) return;

  if (connected && serverInfo) {
    // Connected state with server info
    indicator.style.backgroundColor = "#4CAF50"; // Green indicator
    statusText.style.color = "#ffffff"; // White text for contrast on black
    statusText.textContent = `Connected to ${serverInfo.name} v${serverInfo.version} at ${settings.serverHost}:${settings.serverPort}`;

    // Hide reconnect button when connected
    reconnectButton.style.display = "none";
  } else if (connected) {
    // Connected without server info
    indicator.style.backgroundColor = "#4CAF50"; // Green indicator
    statusText.style.color = "#ffffff"; // White text for contrast on black
    statusText.textContent = `Connected to server at ${settings.serverHost}:${settings.serverPort}`;

    // Hide reconnect button when connected
    reconnectButton.style.display = "none";
  } else {
    // Disconnected state
    indicator.style.backgroundColor = "#F44336"; // Red indicator
    statusText.style.color = "#ffffff"; // White text for contrast on black

    // Only show "searching" message if discovery is in progress
    if (isDiscoveryInProgress) {
      statusText.textContent = "Not connected to server. Searching...";
      // Hide reconnect button while actively searching
      reconnectButton.style.display = "none";
    } else {
      statusText.textContent = "Not connected to server.";
      // Show reconnect button above status message when disconnected and not searching
      reconnectButton.style.display = "block";
      reconnectButton.textContent = "Reconnect";
    }
  }
}

// Initialize UI elements
const logLimitInput = document.getElementById("log-limit");
const queryLimitInput = document.getElementById("query-limit");
const stringSizeLimitInput = document.getElementById("string-size-limit");
const showRequestHeadersCheckbox = document.getElementById(
  "show-request-headers"
);
const showResponseHeadersCheckbox = document.getElementById(
  "show-response-headers"
);
const maxLogSizeInput = document.getElementById("max-log-size");
const screenshotPathInput = document.getElementById("screenshot-path");
const captureScreenshotButton = document.getElementById("capture-screenshot");

// Server connection UI elements
const serverHostInput = document.getElementById("server-host");
const serverPortInput = document.getElementById("server-port");
const discoverServerButton = document.getElementById("discover-server");
const testConnectionButton = document.getElementById("test-connection");
const connectionStatusDiv = document.getElementById("connection-status");
const statusIcon = document.getElementById("status-icon");
const statusText = document.getElementById("status-text");

// Initialize collapsible advanced settings
const advancedSettingsHeader = document.getElementById(
  "advanced-settings-header"
);
const advancedSettingsContent = document.getElementById(
  "advanced-settings-content"
);
const chevronIcon = advancedSettingsHeader.querySelector(".chevron");

advancedSettingsHeader.addEventListener("click", () => {
  advancedSettingsContent.classList.toggle("visible");
  chevronIcon.classList.toggle("open");
});

// Get all inputs by ID
const allowAutoPasteCheckbox = document.getElementById("allow-auto-paste");

// Update UI from settings
function updateUIFromSettings() {
  logLimitInput.value = settings.logLimit;
  queryLimitInput.value = settings.queryLimit;
  stringSizeLimitInput.value = settings.stringSizeLimit;
  showRequestHeadersCheckbox.checked = settings.showRequestHeaders;
  showResponseHeadersCheckbox.checked = settings.showResponseHeaders;
  maxLogSizeInput.value = settings.maxLogSize;
  screenshotPathInput.value = settings.screenshotPath;
  serverHostInput.value = settings.serverHost;
  serverPortInput.value = settings.serverPort;
  allowAutoPasteCheckbox.checked = settings.allowAutoPaste;
}

// Save settings
function saveSettings() {
  chrome.storage.local.set({ browserConnectorSettings: settings });
  // Notify devtools.js about settings change
  safeSendMessage({
    type: "SETTINGS_UPDATED",
    settings,
  });
}

// Add event listeners for all inputs
logLimitInput.addEventListener("change", (e) => {
  settings.logLimit = parseInt(e.target.value, 10);
  saveSettings();
});

queryLimitInput.addEventListener("change", (e) => {
  settings.queryLimit = parseInt(e.target.value, 10);
  saveSettings();
});

stringSizeLimitInput.addEventListener("change", (e) => {
  settings.stringSizeLimit = parseInt(e.target.value, 10);
  saveSettings();
});

showRequestHeadersCheckbox.addEventListener("change", (e) => {
  settings.showRequestHeaders = e.target.checked;
  saveSettings();
});

showResponseHeadersCheckbox.addEventListener("change", (e) => {
  settings.showResponseHeaders = e.target.checked;
  saveSettings();
});

maxLogSizeInput.addEventListener("change", (e) => {
  settings.maxLogSize = parseInt(e.target.value, 10);
  saveSettings();
});

screenshotPathInput.addEventListener("change", (e) => {
  settings.screenshotPath = e.target.value;
  saveSettings();
});

// Add event listeners for server settings
serverHostInput.addEventListener("change", (e) => {
  settings.serverHost = e.target.value;
  saveSettings();
  // Automatically test connection when host is changed
  testConnection(settings.serverHost, settings.serverPort);
});

serverPortInput.addEventListener("change", (e) => {
  settings.serverPort = parseInt(e.target.value, 10);
  saveSettings();
  // Automatically test connection when port is changed
  testConnection(settings.serverHost, settings.serverPort);
});

// Add event listener for auto-paste checkbox
allowAutoPasteCheckbox.addEventListener("change", (e) => {
  settings.allowAutoPaste = e.target.checked;
  saveSettings();
});

// Function to cancel any ongoing discovery operations
function cancelOngoingDiscovery() {
  if (isDiscoveryInProgress) {
    console.log("Cancelling ongoing discovery operation");

    // Abort any fetch requests in progress
    if (discoveryController) {
      try {
        discoveryController.abort();
      } catch (error) {
        console.error("Error aborting discovery controller:", error);
      }
      discoveryController = null;
    }

    // Reset the discovery status
    isDiscoveryInProgress = false;

    // Update UI to indicate the operation was cancelled
    if (
      statusText &&
      connectionStatusDiv &&
      connectionStatusDiv.style.display === "block"
    ) {
      statusText.textContent = "Server discovery operation cancelled";
    }

    // Clear any pending network timeouts that might be part of the discovery process
    clearTimeout(reconnectAttemptTimeout);
    reconnectAttemptTimeout = null;

    console.log("Discovery operation cancelled successfully");
  }
}

// Test server connection
testConnectionButton.addEventListener("click", async () => {
  // Cancel any ongoing discovery operations before testing
  cancelOngoingDiscovery();
  await testConnection(settings.serverHost, settings.serverPort);
});

// Function to test server connection
async function testConnection(host, port) {
  // Cancel any ongoing discovery operations
  cancelOngoingDiscovery();

  connectionStatusDiv.style.display = "block";
  statusIcon.className = "status-indicator";
  statusText.textContent = "Testing connection...";

  try {
    // Use the identity endpoint instead of .port for more reliable validation
    const response = await fetch(`http://${host}:${port}/.identity`, {
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (response.ok) {
      const identity = await response.json();

      // Verify this is actually our server by checking the signature
      if (identity.signature !== "mcp-browser-connector-24x7") {
        statusIcon.className = "status-indicator status-disconnected";
        statusText.textContent = `Connection failed: Found a server at ${host}:${port} but it's not the Browser Tools server`;
        serverConnected = false;
        updateConnectionBanner(false, null);
        scheduleReconnectAttempt();
        return false;
      }

      statusIcon.className = "status-indicator status-connected";
      statusText.textContent = `Connected successfully to ${identity.name} v${identity.version} at ${host}:${port}`;
      serverConnected = true;
      updateConnectionBanner(true, identity);

      // Clear any scheduled reconnect attempts
      if (reconnectAttemptTimeout) {
        clearTimeout(reconnectAttemptTimeout);
        reconnectAttemptTimeout = null;
      }

      // Update settings if different port was discovered
      if (parseInt(identity.port, 10) !== port) {
        console.log(`Detected different port: ${identity.port}`);
        settings.serverPort = parseInt(identity.port, 10);
        serverPortInput.value = settings.serverPort;
        saveSettings();
      }

      return true;
    } else {
      statusIcon.className = "status-indicator status-disconnected";
      statusText.textContent = `Connection failed: Server returned ${response.status}`;
      serverConnected = false;

      // Make sure isDiscoveryInProgress is false so the reconnect button will show
      isDiscoveryInProgress = false;

      // Now update the connection banner to show the reconnect button
      updateConnectionBanner(false, null);
      scheduleReconnectAttempt();
      return false;
    }
  } catch (error) {
    statusIcon.className = "status-indicator status-disconnected";
    statusText.textContent = `Connection failed: ${error.message}`;
    serverConnected = false;

    // Make sure isDiscoveryInProgress is false so the reconnect button will show
    isDiscoveryInProgress = false;

    // Now update the connection banner to show the reconnect button
    updateConnectionBanner(false, null);
    scheduleReconnectAttempt();
    return false;
  }
}

// Schedule a reconnect attempt if server isn't found
function scheduleReconnectAttempt() {
  // Clear any existing reconnect timeout
  if (reconnectAttemptTimeout) {
    clearTimeout(reconnectAttemptTimeout);
  }

  // Schedule a reconnect attempt in 30 seconds
  reconnectAttemptTimeout = setTimeout(() => {
    console.log("Attempting to reconnect to server...");
    // Only show minimal UI during auto-reconnect
    discoverServer(true);
  }, 30000); // 30 seconds
}

// Helper function to try connecting to a server
async function tryServerConnection(host, port) {
  try {
    // Check if the discovery process was cancelled
    if (!isDiscoveryInProgress) {
      return false;
    }

    // Create a local timeout that won't abort the entire discovery process
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 500); // 500ms timeout for each connection attempt

    try {
      // Use identity endpoint for validation
      const response = await fetch(`http://${host}:${port}/.identity`, {
        // Use a local controller for this specific request timeout
        // but also respect the global discovery cancellation
        signal: discoveryController
          ? AbortSignal.any([controller.signal, discoveryController.signal])
          : controller.signal,
      });

      clearTimeout(timeoutId);

      // Check again if discovery was cancelled during the fetch
      if (!isDiscoveryInProgress) {
        return false;
      }

      if (response.ok) {
        const identity = await response.json();

        // Verify this is actually our server by checking the signature
        if (identity.signature !== "mcp-browser-connector-24x7") {
          console.log(
            `Found a server at ${host}:${port} but it's not the Browser Tools server`
          );
          return false;
        }

        console.log(`Successfully found server at ${host}:${port}`);

        // Update settings with discovered server
        settings.serverHost = host;
        settings.serverPort = parseInt(identity.port, 10);
        serverHostInput.value = settings.serverHost;
        serverPortInput.value = settings.serverPort;
        saveSettings();

        statusIcon.className = "status-indicator status-connected";
        statusText.textContent = `Discovered ${identity.name} v${identity.version} at ${host}:${identity.port}`;

        // Update connection banner with server info
        updateConnectionBanner(true, identity);

        // Update connection status
        serverConnected = true;

        // Clear any scheduled reconnect attempts
        if (reconnectAttemptTimeout) {
          clearTimeout(reconnectAttemptTimeout);
          reconnectAttemptTimeout = null;
        }

        // End the discovery process
        isDiscoveryInProgress = false;

        // Successfully found server
        return true;
      }

      return false;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    // Ignore connection errors during discovery
    // But check if it was an abort (cancellation)
    if (error.name === "AbortError") {
      // Check if this was due to the global discovery cancellation
      if (discoveryController && discoveryController.signal.aborted) {
        console.log("Connection attempt aborted by global cancellation");
        return "aborted";
      }
      // Otherwise it was just a timeout for this specific connection attempt
      return false;
    }
    console.log(`Connection error for ${host}:${port}: ${error.message}`);
    return false;
  }
}

// Server discovery function (extracted to be reusable)
async function discoverServer(quietMode = false) {
  // Cancel any ongoing discovery operations before starting a new one
  cancelOngoingDiscovery();

  // Create a new AbortController for this discovery process
  discoveryController = new AbortController();
  isDiscoveryInProgress = true;

  // In quiet mode, we don't show the connection status until we either succeed or fail completely
  if (!quietMode) {
    connectionStatusDiv.style.display = "block";
    statusIcon.className = "status-indicator";
    statusText.textContent = "Discovering server...";
  }

  // Always update the connection banner
  updateConnectionBanner(false, null);

  try {
    console.log("Starting server discovery process");

    // Add an early cancellation listener that will respond to page navigation/refresh
    discoveryController.signal.addEventListener("abort", () => {
      console.log("Discovery aborted via AbortController signal");
      isDiscoveryInProgress = false;
    });

    // Common IPs to try (in order of likelihood)
    const hosts = ["localhost", "127.0.0.1"];

    // Add the current configured host if it's not already in the list
    if (
      !hosts.includes(settings.serverHost) &&
      settings.serverHost !== "0.0.0.0"
    ) {
      hosts.unshift(settings.serverHost); // Put at the beginning for priority
    }

    // Add common local network IPs
    const commonLocalIps = ["192.168.0.", "192.168.1.", "10.0.0.", "10.0.1."];
    for (const prefix of commonLocalIps) {
      for (let i = 1; i <= 5; i++) {
        // Reduced from 10 to 5 for efficiency
        hosts.push(`${prefix}${i}`);
      }
    }

    // Build port list in a smart order:
    // 1. Start with current configured port
    // 2. Add default port (3035)
    // 3. Add sequential ports around the default (for fallback detection)
    const ports = [];

    // Current configured port gets highest priority
    const configuredPort = parseInt(settings.serverPort, 10);
    ports.push(configuredPort);

    // Add default port if it's not the same as configured
    if (configuredPort !== 3035) {
      ports.push(3035);
    }

    // Add sequential fallback ports (from default up to default+10)
    for (let p = 3026; p <= 3035; p++) {
      if (p !== configuredPort) {
        // Avoid duplicates
        ports.push(p);
      }
    }

    // Remove duplicates
    const uniquePorts = [...new Set(ports)];
    console.log("Will check ports:", uniquePorts);

    // Create a progress indicator
    let progress = 0;
    let totalChecked = 0;

    // Phase 1: Try the most likely combinations first (current host:port and localhost variants)
    console.log("Starting Phase 1: Quick check of high-priority hosts/ports");
    const priorityHosts = hosts.slice(0, 2); // First two hosts are highest priority
    for (const host of priorityHosts) {
      // Check if discovery was cancelled
      if (!isDiscoveryInProgress) {
        console.log("Discovery process was cancelled during Phase 1");
        return false;
      }

      // Try configured port first
      totalChecked++;
      if (!quietMode) {
        statusText.textContent = `Checking ${host}:${uniquePorts[0]}...`;
      }
      console.log(`Checking ${host}:${uniquePorts[0]}...`);
      const result = await tryServerConnection(host, uniquePorts[0]);

      // Check for cancellation or success
      if (result === "aborted" || !isDiscoveryInProgress) {
        console.log("Discovery process was cancelled");
        return false;
      } else if (result === true) {
        console.log("Server found in priority check");
        if (quietMode) {
          // In quiet mode, only show the connection banner but hide the status box
          connectionStatusDiv.style.display = "none";
        }
        return true; // Successfully found server
      }

      // Then try default port if different
      if (uniquePorts.length > 1) {
        // Check if discovery was cancelled
        if (!isDiscoveryInProgress) {
          console.log("Discovery process was cancelled");
          return false;
        }

        totalChecked++;
        if (!quietMode) {
          statusText.textContent = `Checking ${host}:${uniquePorts[1]}...`;
        }
        console.log(`Checking ${host}:${uniquePorts[1]}...`);
        const result = await tryServerConnection(host, uniquePorts[1]);

        // Check for cancellation or success
        if (result === "aborted" || !isDiscoveryInProgress) {
          console.log("Discovery process was cancelled");
          return false;
        } else if (result === true) {
          console.log("Server found in priority check");
          if (quietMode) {
            // In quiet mode, only show the connection banner but hide the status box
            connectionStatusDiv.style.display = "none";
          }
          return true; // Successfully found server
        }
      }
    }

    // If we're in quiet mode and the quick checks failed, show the status now
    // as we move into more intensive scanning
    if (quietMode) {
      connectionStatusDiv.style.display = "block";
      statusIcon.className = "status-indicator";
      statusText.textContent = "Searching for server...";
    }

    // Phase 2: Systematic scan of all combinations
    const totalAttempts = hosts.length * uniquePorts.length;
    console.log(
      `Starting Phase 2: Full scan (${totalAttempts} total combinations)`
    );
    statusText.textContent = `Quick check failed. Starting full scan (${totalChecked}/${totalAttempts})...`;

    // First, scan through all ports on localhost/127.0.0.1 to find fallback ports quickly
    const localHosts = ["localhost", "127.0.0.1"];
    for (const host of localHosts) {
      // Skip the first two ports on localhost if we already checked them in Phase 1
      const portsToCheck = uniquePorts.slice(
        localHosts.includes(host) && priorityHosts.includes(host) ? 2 : 0
      );

      for (const port of portsToCheck) {
        // Check if discovery was cancelled
        if (!isDiscoveryInProgress) {
          console.log("Discovery process was cancelled during local port scan");
          return false;
        }

        // Update progress
        progress++;
        totalChecked++;
        statusText.textContent = `Scanning local ports... (${totalChecked}/${totalAttempts}) - Trying ${host}:${port}`;
        console.log(`Checking ${host}:${port}...`);

        const result = await tryServerConnection(host, port);

        // Check for cancellation or success
        if (result === "aborted" || !isDiscoveryInProgress) {
          console.log("Discovery process was cancelled");
          return false;
        } else if (result === true) {
          console.log(`Server found at ${host}:${port}`);
          return true; // Successfully found server
        }
      }
    }

    // Then scan all the remaining host/port combinations
    for (const host of hosts) {
      // Skip hosts we already checked
      if (localHosts.includes(host)) {
        continue;
      }

      for (const port of uniquePorts) {
        // Check if discovery was cancelled
        if (!isDiscoveryInProgress) {
          console.log("Discovery process was cancelled during remote scan");
          return false;
        }

        // Update progress
        progress++;
        totalChecked++;
        statusText.textContent = `Scanning remote hosts... (${totalChecked}/${totalAttempts}) - Trying ${host}:${port}`;
        console.log(`Checking ${host}:${port}...`);

        const result = await tryServerConnection(host, port);

        // Check for cancellation or success
        if (result === "aborted" || !isDiscoveryInProgress) {
          console.log("Discovery process was cancelled");
          return false;
        } else if (result === true) {
          console.log(`Server found at ${host}:${port}`);
          return true; // Successfully found server
        }
      }
    }

    console.log(
      `Discovery process completed, checked ${totalChecked} combinations, no server found`
    );
    // If we get here, no server was found
    statusIcon.className = "status-indicator status-disconnected";
    statusText.textContent =
      "No server found. Please check server is running and try again.";

    serverConnected = false;

    // End the discovery process first before updating the banner
    isDiscoveryInProgress = false;

    // Update the connection banner to show the reconnect button
    updateConnectionBanner(false, null);

    // Schedule a reconnect attempt
    scheduleReconnectAttempt();

    return false;
  } catch (error) {
    console.error("Error during server discovery:", error);
    statusIcon.className = "status-indicator status-disconnected";
    statusText.textContent = `Error discovering server: ${error.message}`;

    serverConnected = false;

    // End the discovery process first before updating the banner
    isDiscoveryInProgress = false;

    // Update the connection banner to show the reconnect button
    updateConnectionBanner(false, null);

    // Schedule a reconnect attempt
    scheduleReconnectAttempt();

    return false;
  } finally {
    console.log("Discovery process finished");
    // Always clean up, even if there was an error
    if (discoveryController) {
      discoveryController = null;
    }
  }
}

// Bind discover server button to the extracted function
discoverServerButton.addEventListener("click", () => discoverServer(false));

// Screenshot capture functionality
captureScreenshotButton.addEventListener("click", () => {
  captureScreenshotButton.textContent = "Capturing...";

  // Send message to background script to capture screenshot
  safeSendMessage(
    {
      type: "CAPTURE_SCREENSHOT",
      tabId: chrome.devtools.inspectedWindow.tabId,
      screenshotPath: settings.screenshotPath,
    },
    (response) => {
      console.log("Screenshot capture response:", response);
      if (!response) {
        captureScreenshotButton.textContent = "Failed to capture!";
        console.error("Screenshot capture failed: No response received");
        showScreenshotError("No response received from extension. Please try clicking the extension icon to grant permissions.", true);
      } else if (!response.success) {
        captureScreenshotButton.textContent = "Failed to capture!";
        console.error("Screenshot capture failed:", response.error);
        
        // Check if it's a permission-related error
        const isPermissionError = response.error && (
          response.error.toLowerCase().includes('permission') ||
          response.error.toLowerCase().includes('denied') ||
          response.error.toLowerCase().includes('access') ||
          response.error.toLowerCase().includes('blocked') ||
          response.error.toLowerCase().includes('cannot') ||
          response.error.toLowerCase().includes('unable') ||
          response.error.toLowerCase().includes('failed to capture') ||
          response.error.toLowerCase().includes('captureVisibleTab')
        );
        
        showScreenshotError(response.error, isPermissionError);
      } else {
        captureScreenshotButton.textContent = `Captured: ${response.title}`;
        console.log("Screenshot captured successfully:", response.path);
        
        // Show the screenshot location with clipboard info
        showScreenshotLocation(response.path, true);
      }
      setTimeout(() => {
        captureScreenshotButton.textContent = "Capture Screenshot";
      }, 2000);
    }
  );
});

// Add wipe logs functionality
const wipeLogsButton = document.getElementById("wipe-logs");
wipeLogsButton.addEventListener("click", () => {
  const serverUrl = `http://${settings.serverHost}:${settings.serverPort}/wipelogs`;
  console.log(`Sending wipe request to ${serverUrl}`);

  fetch(serverUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.json())
    .then((result) => {
      console.log("Logs wiped successfully:", result.message);
      wipeLogsButton.textContent = "Logs Wiped!";
      setTimeout(() => {
        wipeLogsButton.textContent = "Wipe All Logs";
      }, 2000);
    })
    .catch((error) => {
      console.error("Failed to wipe logs:", error);
      wipeLogsButton.textContent = "Failed to Wipe Logs";
      setTimeout(() => {
        wipeLogsButton.textContent = "Wipe All Logs";
      }, 2000);
    });
});

// Handle info icon clicks for tooltips
const infoIcons = document.querySelectorAll(".info-icon");
const infoDisplay = document.getElementById("info-display");
const infoTitle = document.getElementById("info-title");
const infoContent = document.getElementById("info-content");

// Map of tooltip IDs to their content
const tooltipMap = {
  "tooltip-auto-paste": {
    title: "Allow Auto-paste to Cursor",
    content: "Automatically pastes captured content into Cursor! No more manual copy-paste dance moves!"
  },
  "tooltip-screenshot-path": {
    title: "Screenshot Directory",
    content: "Choose where your beautiful screenshots should live! Leave empty for the classic Downloads folder experience."
  },
  "tooltip-server-host": {
    title: "Server Host",
    content: "Where's your server hiding? Usually localhost, but could be playing hide and seek elsewhere!"
  },
  "tooltip-server-port": {
    title: "Server Port",
    content: "The magical door number your server listens on! 3035 is our favorite, but feel free to pick your own!"
  },
  "tooltip-log-limit": {
    title: "Log Limit (number of logs)",
    content: "How many logs should we keep in our memory palace? More logs = more context, but also more memory munching!"
  },
  "tooltip-query-limit": {
    title: "Query Limit (characters)",
    content: "The maximum length of your queries before they get the chop! Keep it reasonable or your browser might get a tummy ache!"
  },
  "tooltip-string-size-limit": {
    title: "String Size Limit (characters)",
    content: "How long can individual strings be before we say \"that's enough!\"? Prevents your console from becoming a novel!"
  },
  "tooltip-max-log-size": {
    title: "Max Log Size (characters)",
    content: "The ultimate size limit for any single log entry! Keeps things tidy and prevents memory overload!"
  },
  "tooltip-request-headers": {
    title: "Include Request Headers",
    content: "Want to see all the juicy details about incoming requests? Headers include cookies, user agents, and other fun secrets!"
  },
  "tooltip-response-headers": {
    title: "Include Response Headers",
    content: "The server's way of saying \"here's what I'm sending back!\" Includes content types, cache info, and more technical goodness!"
  }
};

infoIcons.forEach((icon) => {
  icon.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();

    // Get the tooltip div and toggle its visibility
    const tooltip = this.nextElementSibling;
    if (tooltip && tooltip.classList.contains("tooltip")) {
      // Hide all other tooltips first
      document.querySelectorAll(".tooltip").forEach(t => {
        t.classList.remove("show");
        t.style.display = "none";
      });
      
      // Show this tooltip
      tooltip.style.display = "block";
      tooltip.classList.add("show");
    }
  });
});

