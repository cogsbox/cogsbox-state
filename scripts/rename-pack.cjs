const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '../');
const maxRetries = 10;
const retryDelay = 1000; // 1 second

async function findTgzFile(attempt = 1) {
  const files = fs.readdirSync(distDir).filter(file => file.endsWith('.tgz'));
  
  if (files.length === 0) {
    if (attempt < maxRetries) {
      console.log(`No .tgz file found yet. Retrying in ${retryDelay/1000}s... (attempt ${attempt}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return findTgzFile(attempt + 1);
    } else {
      console.error('No .tgz file found after maximum retries');
      process.exit(1);
    }
  }
  
  return files[0];
}

async function renamePack() {
  const file = await findTgzFile();
  const oldPath = path.join(distDir, file);
  const newPath = path.join(distDir, 'cogsbox-state-latest.tgz');
  
  fs.renameSync(oldPath, newPath);
  console.log(`Renamed ${file} to cogsbox-state-latest.tgz`);
}

renamePack();