import fs from 'node:fs';
import path from 'node:path';

const dirs = ['extension', 'builder', 'core'];
const devImportPattern = /from\s+['"]\.\.\/dev(?:\/[^'"]*)?['"]/;

let failed = false;

for (const dir of dirs) {
  const files = fs.readdirSync(dir, { recursive: true }).filter(f => f.endsWith('.ts'));
  for (const file of files) {
    const filePath = path.join(dir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    if (devImportPattern.test(content)) {
      console.error(`ERROR: ${filePath} imports from dev/`);
      failed = true;
    }
  }
}

if (failed) {
  process.exit(1);
}
