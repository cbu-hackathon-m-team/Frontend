import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';

it('keeps the published system free of domain-specific copy, tokens, and dependencies', () => {
  const root = resolve(process.cwd(), 'src');
  const domain = /trading|binance|upbit|bitcoin|\bBTC\b|\bUSDT\b|--(?:color-)?(?:profit|loss|exchange-)|거래소|매수|매도|sidebar prices|>\s*(?:Symbol|Price)\s*<\/TableHead>/i;
  const matches: string[] = [];
  function scan(directory: string) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) scan(path);
      else if (/\.(tsx?|css)$/.test(path) && !path.includes('.test.')) {
        if (domain.test(readFileSync(path, 'utf8'))) matches.push(path);
      }
    }
  }
  scan(root);
  expect(matches).toEqual([]);
  expect(readFileSync(resolve(process.cwd(), 'package.json'), 'utf8')).not.toContain('@web3icons');
});
