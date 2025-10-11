import { readFileSync, writeFileSync } from 'fs';
import { compileString } from 'sass';

const result = compileString(readFileSync('./src/styles/index.scss', 'utf8'), {
  loadPaths: ['./src/styles'],
});

writeFileSync('./dist/index.css', result.css);
console.log('✓ SCSS compiled successfully');

