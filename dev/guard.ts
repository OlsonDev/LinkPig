import fs from 'node:fs/promises';
import path from 'node:path';

const dirs = ['extension', 'builder', 'core'];
const devImportPattern = /from\s+['"]\.\.\/dev(?:\/[^'"]*)?['"]/;

async function checkDirectory(dir: string): Promise<boolean> {
  const entries = await fs.readdir(dir, { recursive: true });
  const tsFiles = entries.filter((f): f is string => typeof f === 'string' && f.endsWith('.ts'));

  const results = await Promise.all(tsFiles.map(async (file) => {
    const filePath = path.join(dir, file);
    const content = await fs.readFile(filePath, 'utf8');
    if (devImportPattern.test(content)) {
      console.error(`ERROR: ${filePath} imports from dev/`);
      return true;
    }
    return false;
  }));

  return results.some(Boolean);
}

const results = await Promise.all(dirs.map((dir) => checkDirectory(dir)));
if (results.some(Boolean)) process.exitCode = 1;
