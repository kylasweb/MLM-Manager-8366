import fs from 'fs';
import path from 'path';

// Function to recursively find files with specific extensions
function findFiles(dir, extensions, fileList = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findFiles(filePath, extensions, fileList);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (extensions.includes(ext)) {
        fileList.push(filePath);
      }
    }
  }
  
  return fileList;
}

async function main() {
  try {
    // Find all JS and JSX files
    const files = findFiles('src', ['.js', '.jsx']);
    console.log(`Found ${files.length} files to process`);
    
    let changedFiles = 0;
    
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
          changedFiles++;
        }
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
      }
    }
    
    console.log(`React import fixes completed! Changed ${changedFiles} files.`);
  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error); 