import { readFile } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';
import { parseOptions, selectOptions } from './install/options.js';
export async function main(args) {
  const parsed = parseOptions(args);
  if (parsed.help) {
    console.log('Usage: openspec-goldfish [--harness claude|codex|devin] [--local|--global]\nMissing selections prompt in a terminal. Installation never starts review.');
    return;
  }
  if (parsed.version) {
    console.log(JSON.parse(await readFile(new URL('../package.json', import.meta.url))).version);
    return;
  }
  let terminal;
  const ask = async (question) => {
    terminal ??= createInterface({ input: process.stdin, output: process.stdout });
    return terminal.question(question);
  };
  let options;
  try { options = await selectOptions(parsed, { interactive: !!(process.stdin.isTTY && process.stdout.isTTY), ask }); }
  finally { terminal?.close(); }
  const { install } = await import('./install/index.js');
  const result = await install(options);
  console.log(`Goldfish installed for ${options.harness} (${options.scope}).`);
  for (const file of result.paths) console.log(`  ${file}`);
  console.log(`Restart your harness if needed. Invoke ${options.harness === 'codex' ? '$' : '/'}openspec-goldfish <change-name> manually after proposal, before implementation.`);
}
