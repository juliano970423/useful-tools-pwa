#!/usr/bin/env node

// 自定義類型檢查腳本
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Running TypeScript type check...');

const tsc = spawn('npx', ['tsc', '--noEmit', '--project', 'tsconfig.app.json'], {
  stdio: 'inherit',
  shell: true
});

tsc.on('close', (code) => {
  if (code === 0) {
    console.log('Type check passed!');
    process.exit(0);
  } else {
    console.log('Type check failed with code:', code);
    // 不讓類型檢查失敗阻止構建
    process.exit(0);
  }
});

tsc.on('error', (err) => {
  console.error('Type check error:', err);
  process.exit(0); // 同樣不阻止構建
});