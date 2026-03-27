const fs = require('fs');
const path = require('path');

// Common AI generated emojis
const emojiRegex = /[💡✅🎉🚫⛔👤❌]/g;

function walkSync(dir, filelist = []) {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== 'build' && file !== '.git') {
        filelist = walkSync(filePath, filelist);
      }
    } else {
      if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
        filelist.push(filePath);
      }
    }
  });
  return filelist;
}

const files = walkSync(path.join(__dirname, 'src'));
let changedFiles = 0;
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (emojiRegex.test(content)) {
    const newContent = content.replace(emojiRegex, '').replace(/  +/g, ' '); // remove emoji and fix double spaces
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Removed emojis from:', file);
    changedFiles++;
  }
});
console.log(`Removed emojis from ${changedFiles} files.`);
