import { readFileSync, writeFileSync } from 'fs';
import { compileString } from 'sass';

const result = compileString(readFileSync('./src/styles/index.scss', 'utf8'), {
  loadPaths: ['./src/styles'],
});

writeFileSync('./dist/index.css', result.css);

// TypeScript declaration for the `eidos-ui/styles` side-effect import.
// Without this, consumers on TS 5.5+ get TS2882 because the exports map has
// no `types` condition for the CSS entry point.
writeFileSync('./dist/index.css.d.ts', '// eidos-ui styles\nexport {};\n');

console.log('✓ SCSS compiled successfully');
