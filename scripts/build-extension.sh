#!/bin/bash

# Cursor Bridge Chrome Extension Build Script
# Creates a deployment-ready zip file for the Chrome extension

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
EXTENSION_DIR="cursor-bridge-extension"
DIST_DIR="dist"
ZIP_NAME="cursor-bridge-extension.zip"
ZIP_PATH="$DIST_DIR/$ZIP_NAME"

echo -e "${BLUE}🚀 Building Cursor Bridge Chrome Extension...${NC}"

# Create dist directory if it doesn't exist
mkdir -p "$DIST_DIR"

# Check if extension directory exists
if [ ! -d "$EXTENSION_DIR" ]; then
    echo -e "${RED}❌ Extension directory not found: $EXTENSION_DIR${NC}"
    exit 1
fi

# Remove existing zip file if it exists
if [ -f "$ZIP_PATH" ]; then
    echo -e "${YELLOW}🗑️  Removing existing zip file...${NC}"
    rm "$ZIP_PATH"
fi

# Create the zip file
echo -e "${BLUE}📦 Creating extension zip file...${NC}"

# Change to extension directory to maintain proper structure in zip
cd "$EXTENSION_DIR"

# Create zip with all files
zip -r "../$ZIP_PATH" . -x "*.DS_Store" "*.git*" "node_modules/*" "*.log"

# Return to root directory
cd ..

# Check if zip was created successfully
if [ -f "$ZIP_PATH" ]; then
    # Get file size
    FILE_SIZE=$(ls -lh "$ZIP_PATH" | awk '{print $5}')
    
    echo -e "${GREEN}✅ Extension built successfully!${NC}"
    echo -e "${GREEN}📦 Archive: $ZIP_PATH${NC}"
    echo -e "${GREEN}📊 File size: $FILE_SIZE${NC}"
    echo -e "${BLUE}🎉 Build complete! Ready for Chrome Web Store deployment.${NC}"
else
    echo -e "${RED}❌ Failed to create zip file${NC}"
    exit 1
fi
