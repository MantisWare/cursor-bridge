#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');

const EXTENSION_DIR = path.join(__dirname, '..', 'cursor-bridge-extension');
const DIST_DIR = path.join(__dirname, '..', 'dist');
const ZIP_PATH = path.join(DIST_DIR, 'cursor-bridge-extension.zip');

async function buildExtension() {
  try {
    console.log('🚀 Building Cursor Bridge Chrome Extension...');
    
    // Create dist directory if it doesn't exist
    await fs.ensureDir(DIST_DIR);
    
    // Check if extension directory exists
    if (!await fs.pathExists(EXTENSION_DIR)) {
      throw new Error(`Extension directory not found: ${EXTENSION_DIR}`);
    }
    
    // Create zip file
    const output = fs.createWriteStream(ZIP_PATH);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });
    
    // Handle archive events
    archive.on('error', (err) => {
      throw err;
    });
    
    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn('⚠️  Archive warning:', err);
      } else {
        throw err;
      }
    });
    
    // Pipe archive data to the file
    archive.pipe(output);
    
    // Add all extension files to the archive
    console.log('📦 Adding extension files to archive...');
    
    // Read all files in the extension directory
    const files = await fs.readdir(EXTENSION_DIR);
    
    for (const file of files) {
      const filePath = path.join(EXTENSION_DIR, file);
      const stat = await fs.stat(filePath);
      
      if (stat.isFile()) {
        console.log(`  📄 Adding: ${file}`);
        archive.file(filePath, { name: file });
      }
    }
    
    // Finalize the archive
    await archive.finalize();
    
    // Wait for the output stream to finish
    await new Promise((resolve, reject) => {
      output.on('close', () => {
        console.log(`✅ Extension built successfully!`);
        console.log(`📦 Archive size: ${archive.pointer()} bytes`);
        console.log(`📁 Output: ${ZIP_PATH}`);
        resolve();
      });
      
      output.on('error', reject);
    });
    
    // Verify the zip file was created
    if (await fs.pathExists(ZIP_PATH)) {
      const stats = await fs.stat(ZIP_PATH);
      console.log(`🎉 Build complete! Extension zip file created: ${ZIP_PATH}`);
      console.log(`📊 File size: ${(stats.size / 1024).toFixed(2)} KB`);
    } else {
      throw new Error('Failed to create zip file');
    }
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Run the build
buildExtension();
