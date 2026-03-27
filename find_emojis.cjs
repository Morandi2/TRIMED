const fs = require('fs');
const path = require('path');

const emojis = [/🏥/, /🩺/, /💊/, /ℹ️/, /⚠️/, /🚀/, /💡/, /📝/, /📊/, /👥/, /✨/, /📈/, /💬/, /🎉/, /🔥/, /👍/, /✅/]; // Common ones, plus ones mentioned
const emojiRegex = /[\u{1F300}-\u{1F5FF}\u{1F900}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F191}-\u{1F251}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F171}\u{1F17E}-\u{1F17F}\u{1F18E}\u{3030}\u{2B50}\u{2B55}\u{2934}-\u{2935}\u{2B05}-\u{2B07}\u{2B1B}-\u{2B1C}\u{3297}\u{3299}\u{303D}\u{00A9}\u{00AE}\u{2122}\u{23F3}\u{24C2}\u{23E9}-\u{23EF}\u{25B6}\u{23F8}-\u{23FA}]/u;

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
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (emojiRegex.test(content)) {
    console.log('Found emoji in:', file);
    const lines = content.split('\n');
    lines.forEach((line, i) => {
      if (emojiRegex.test(line)) {
        console.log(`  Line ${i + 1}: ${line.trim()}`);
      }
    });
  }
});
