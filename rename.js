const fs = require('fs');
const path = require('path');

const baseDirectoryPath = path.join(__dirname, 'dist/esm');

// Function to append .mjs to relative module imports and then rename the file to .mjs
function modifyFileExtensions(filePath) {
  const data = fs.readFileSync(filePath, 'utf8');
  const modifiedData = data.replace(/from\s+['"]((?:\.\/|\.\.\/)[^'"]+)['"]/g, (match, p1) => {
    // Skip modification if the import statement already ends with .mjs or is a URL
    if (p1.endsWith('.mjs') || p1.startsWith('http:') || p1.startsWith('https:')) {
      return match;
    }
    // Check if the path refers to a directory's index file
    const fullPath = path.resolve(path.dirname(filePath), p1);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
      return `from '${p1}/index.mjs'`;
    }
    return `from '${p1}.mjs'`;
  });

  fs.writeFileSync(filePath, modifiedData, 'utf8');

  // Rename the file to .mjs
  const newFilePath = filePath.replace(/\.js$/, '.mjs');
  fs.renameSync(filePath, newFilePath);
}

// Recursive function to process all .js files in a directory
function processDirectory(directoryPath) {
  fs.readdir(directoryPath, { withFileTypes: true }, (err, entries) => {
    if (err) {
      console.log('Unable to scan directory:', err);
      return;
    }

    entries.forEach((entry) => {
      const fullPath = path.join(directoryPath, entry.name);
      if (entry.isDirectory()) {
        processDirectory(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        modifyFileExtensions(fullPath);
      }
    });
  });
}

// Start the processing with the base directory
processDirectory(baseDirectoryPath);
