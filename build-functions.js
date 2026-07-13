import { build } from 'esbuild';
import { readdir, rm, mkdir } from 'fs/promises';
import { join } from 'path';

async function buildFunctions() {
  const srcDir = 'functions-src/api';
  const outDir = 'functions/api';

  // Clean output directory (remove old .ts and .js files)
  try {
    await rm(outDir, { recursive: true });
  } catch {}
  await mkdir(outDir, { recursive: true });

  const files = await readdir(srcDir);
  const tsFiles = files.filter(f => f.endsWith('.ts'));

  for (const file of tsFiles) {
    const entryPoint = join(srcDir, file);
    const outfile = join(outDir, file.replace('.ts', '.js'));

    await build({
      entryPoints: [entryPoint],
      bundle: false,
      outfile: outfile,
      format: 'esm',
      platform: 'browser',
      target: 'es2022',
    });

    console.log(`✓ Built ${file} → ${file.replace('.ts', '.js')}`);
  }
}

buildFunctions().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
