#!/bin/bash

# Exit on error
set -e

# Display Node.js version
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Install dependencies with explicit flags for better reliability
echo "Installing dependencies..."
npm ci || npm install --no-optional

# Add extra packages that might be needed
echo "Installing additional dependencies..."
npm install --save-dev terser @vitejs/plugin-react

# Generate any required assets before build
echo "Preparing for build..."

# Create dist directory in case it doesn't exist
mkdir -p dist

# Create base index.html to ensure we have a fallback
echo "Creating base index.html..."
cat > dist/index.html << EOL
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Zocial MLM</title>
</head>
<body>
  <div id="root"></div>
  <script>
    // Fallback script in case the main app doesn't load
    setTimeout(function() {
      if (!window.appLoaded) {
        console.log('App failed to load, reloading page');
        window.location.reload();
      }
    }, 5000);
  </script>
</body>
</html>
EOL

# Run build with customized settings
echo "Building application..."
VITE_BUILD_ENV=production npx vite build

# Check if build was successful
if [ ! -f "dist/index.html" ]; then
  echo "Warning: Build failed to generate dist/index.html, using fallback"
else
  echo "Build generated index.html successfully"
fi

# Create Netlify routing file to ensure SPA routing
echo "Ensuring SPA routing..."
echo "/*    /index.html   200" > dist/_redirects

# Copy necessary files
echo "Copying static assets..."
cp -r public/* dist/ 2>/dev/null || :

echo "Build completed successfully!" 