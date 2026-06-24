const fs = require('node:fs');
const path = require('node:path');

const target = process.argv[2] || 'build';
const outputDir = path.join(process.cwd(), '.artifacts');

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(
  path.join(outputDir, `${target}.txt`),
  `TaskFlow frontend scaffold artifact for ${target}\n`,
  'utf8',
);

console.log(`[frontend] Placeholder ${target} completed.`);

