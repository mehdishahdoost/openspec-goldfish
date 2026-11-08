export const harnesses = ['claude', 'codex', 'devin'];
export function parseOptions(args) {
  const result = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') result.help = true;
    else if (arg === '--version') result.version = true;
    else if (arg === '--harness') {
      if (result.harness) throw new Error('Supply --harness only once.');
      result.harness = args[++i];
      if (!harnesses.includes(result.harness)) throw new Error(`--harness must be ${harnesses.join(', ')}.`);
    } else if (arg === '--global' || arg === '--local') {
      if (result.scope) throw new Error('--local and --global are mutually exclusive; supply one scope.');
      result.scope = arg.slice(2);
    } else throw new Error(`Unknown argument: ${arg}`);
  }
  return result;
}
export async function selectOptions(options, { interactive, ask }) {
  if (options.help || options.version) return options;
  if (!interactive && (!options.harness || !options.scope)) throw new Error('Noninteractive installation requires --harness and --local or --global.');
  const result = { ...options };
  if (!result.harness) {
    result.harness = (await ask('Harness (claude/codex/devin): ')).trim();
    if (!harnesses.includes(result.harness)) throw new Error('Select claude, codex, or devin.');
  }
  if (!result.scope) {
    const answer = (await ask('Install in current project or all projects? (local/global) [local]: ')).trim();
    result.scope = answer || 'local';
    if (!['local', 'global'].includes(result.scope)) throw new Error('Select local or global.');
  }
  return result;
}
