#!/bin/bash
# Startup script for Render

echo "🚀 Starting ALMEERV4..."
echo "📊 Node version: $(node -v)"
echo "📦 NPM version: $(npm -v)"

# Ensure directories exist
mkdir -p session database media/temp

# Start the bot
npm start
