import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Find all JS and JSX files
const files = await glob('src/**/*.{js,jsx}');

// Process each file
for (const file of files) {
  try {
    const content = fs.readFileSync(file, 'utf8');
    
    // Replace "import React, " with "import "
    const updatedContent = content.replace(/import React,\s+/g, 'import ');
    
    // Replace "import React from 'react';" with nothing
    const finalContent = updatedContent.replace(/import React from ['"]react['"];?\s*/g, '');
    
    // Only write if changes were made
    if (content !== finalContent) {
      fs.writeFileSync(file, finalContent, 'utf8');
      console.log(`Updated: ${file}`);
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error);
  }
}

console.log('React import fixes completed!'); 