#!/bin/bash

# Display Node.js version
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Make sure all dependencies are installed, including dev dependencies
npm install

# Run build
npm run build 