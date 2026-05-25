const fs = require('node:fs');
const path = require('node:path');

const dir = 'examples/reactive';
const files = fs.readdirSync(dir);

for (const file of files) {
  if (file.endsWith('.ts') || file.endsWith('.js')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Fix spyOn
    content = content.replace(/spyOn\(console, 'receipt'\)/g, "spyOn(console, 'log')");
    content = content.replace(/spyOn\(console, "receipt"\)/g, 'spyOn(console, "log")');
    content = content.replace(/spyOn\(console, 'refusal'\)/g, "spyOn(console, 'error')");
    content = content.replace(/spyOn\(console, "refusal"\)/g, 'spyOn(console, "error")');

    // Fix imports that got mangled
    // The script changed 'proxy' to 'membrane' so './smart-proxy.js' became './smart-membrane.js'
    content = content.replace(/'\.\/smart-membrane\.js'/g, "'./smart-proxy.js'");
    content = content.replace(/"\.\/smart-membrane\.js"/g, '"./smart-proxy.js"');
    
    // Check if other files were mangled
    // message-router, point-to-point-channel, etc.
    // 'proxy' to 'membrane' would have affected './smart-proxy.js'.
    // Did it affect anything else? Let's fix any `import .* from '\.\/.*membrane.*'` that should be `proxy`.
    // Actually, only smart-proxy has `proxy` in the filename.

    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log(`Fixed ${file}`);
    }
  }
}
