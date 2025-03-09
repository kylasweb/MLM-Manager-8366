#!/bin/bash

# Display Node.js version
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Install dependencies with explicit flags for better reliability
echo "Installing dependencies..."
npm ci || npm install --no-optional

# Generate any required assets before build
echo "Preparing for build..."
# Add any other pre-build steps here (e.g., npx prisma generate)

# Add Vite config for proper base path
echo "Adjusting Vite config for Netlify..."
cat > vite.config.base.js << EOL
import { defineConfig } from 'vite';
import { mergeConfig } from 'vite';
import baseConfig from './vite.config.js';

export default mergeConfig(
  baseConfig,
  defineConfig({
    base: './',
    build: {
      sourcemap: false,
      outDir: 'dist',
    }
  })
);
EOL

# Run build with the modified config
echo "Building application..."
npx vite build --config vite.config.base.js || npm run build

# Create Netlify routing file to ensure SPA routing
echo "Ensuring SPA routing..."
echo "/*    /index.html   200" > dist/_redirects

echo "Build completed successfully!" 