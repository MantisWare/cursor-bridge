# 🚀 Cursor Bridge Build Guide

This guide explains how to build and deploy the Cursor Bridge Chrome Extension.

## 📦 Building the Chrome Extension

### Quick Build

To build the Chrome extension zip file for deployment:

```bash
# Using npm script (if Node.js is available)
npm run build:extension

# Or directly using the shell script
./scripts/build-extension.sh
```

### What Gets Built

The build process creates a deployment-ready zip file at:
```
dist/cursor-bridge-extension.zip
```

This zip file contains all the necessary files for the Chrome extension:
- `manifest.json` - Extension manifest
- `background.js` - Service worker
- `devtools.html` & `devtools.js` - DevTools integration
- `panel.html` & `panel.js` - Extension panel UI

### Manual Build Process

If you prefer to build manually:

1. **Create the dist directory:**
   ```bash
   mkdir -p dist
   ```

2. **Create the zip file:**
   ```bash
   cd cursor-bridge-extension
   zip -r ../dist/cursor-bridge-extension.zip . -x "*.DS_Store" "*.git*" "node_modules/*" "*.log"
   cd ..
   ```

## 🎯 Deployment Options

### Chrome Web Store

1. **Prepare the zip file:**
   - Use the generated `dist/cursor-bridge-extension.zip`
   - Ensure the manifest.json is valid
   - Test the extension locally first

2. **Upload to Chrome Web Store:**
   - Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
   - Create a new item or update existing
   - Upload the zip file
   - Fill in store listing details
   - Submit for review

### Manual Installation (Development)

For development and testing:

1. **Load the extension:**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `cursor-bridge-extension` folder

2. **Test the extension:**
   - Open DevTools (F12)
   - Look for the "CursorBridge" panel
   - Verify all functionality works

## 🔧 Build Requirements

### System Requirements

- **macOS/Linux/Windows** with shell support
- **zip** command (usually pre-installed)
- **Chrome browser** for testing

### Optional Requirements

- **Node.js** (for npm scripts)
- **npm** (for package management)

## 📁 Build Output

After building, you'll find:

```
dist/
└── cursor-bridge-extension.zip  # Ready for Chrome Web Store
```

## 🧹 Cleanup

To clean build artifacts:

```bash
# Clean all build outputs
npm run clean

# Or manually
rm -rf dist
```

## 🐛 Troubleshooting

### Common Issues

**"Permission denied" when running build script:**
```bash
chmod +x scripts/build-extension.sh
```

**"zip command not found":**
- Install zip utility for your system
- On macOS: `brew install zip`
- On Ubuntu: `sudo apt-get install zip`

**Extension not loading in Chrome:**
- Check that manifest.json is valid
- Ensure all required files are included
- Check Chrome DevTools console for errors

### Build Script Details

The build script (`scripts/build-extension.sh`):
- Creates the `dist` directory if it doesn't exist
- Removes any existing zip file
- Creates a new zip with all extension files
- Excludes system files (`.DS_Store`, `.git*`, etc.)
- Provides colored output for better visibility

## 🎉 Success!

Once the build completes successfully, you'll see:
```
✅ Extension built successfully!
📦 Archive: dist/cursor-bridge-extension.zip
📊 File size: 27K
🎉 Build complete! Ready for Chrome Web Store deployment.
```

Your Chrome extension is now ready for deployment! 🚀
