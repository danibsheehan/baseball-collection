import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { gzipSync } from 'zlib';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const assetsDir = path.join(root, 'dist', 'assets');

if (!fs.existsSync(assetsDir)) {
	console.error('bundle-report: dist/assets not found. Run `vite build` first.');
	process.exit(1);
}

const files = fs
	.readdirSync(assetsDir)
	.map((name) => {
		const full = path.join(assetsDir, name);
		const bytes = fs.statSync(full).size;
		const gz = gzipSync(fs.readFileSync(full)).length;
		return { name, bytes, gz };
	})
	.sort((a, b) => b.bytes - a.bytes);

const indexHtml = path.join(root, 'dist', 'index.html');
const indexBytes = fs.existsSync(indexHtml) ? fs.statSync(indexHtml).size : 0;

console.log('\n── dist bundle summary ──\n');
console.log('file\traw kB\tgzip kB');
for (const f of files) {
	console.log(
		`${f.name}\t${(f.bytes / 1024).toFixed(2)}\t${(f.gz / 1024).toFixed(2)}`
	);
}
const rawTotal = files.reduce((s, f) => s + f.bytes, 0) + indexBytes;
const gzTotal = files.reduce((s, f) => s + f.gz, 0) + (indexBytes ? gzipSync(fs.readFileSync(indexHtml)).length : 0);
console.log(
	`\nTotal (assets + index.html)\traw ${(rawTotal / 1024).toFixed(2)} kB\tgzip ~${(gzTotal / 1024).toFixed(2)} kB\n`
);
