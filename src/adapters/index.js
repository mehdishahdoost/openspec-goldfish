import path from 'node:path';
import os from 'node:os';
import {readFile,readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
export const roles=['cold-reader','adversarial-reviewer','adjudicator'];
const packageRoot=fileURLToPath(new URL('../../',import.meta.url));
export function locations({harness,scope,cwd=process.cwd(),home=os.homedir(),env=process.env,platform=process.platform}) {
 if(!['claude','codex','devin'].includes(harness)||!['local','global'].includes(scope)) throw new Error('Invalid harness or scope');
 if(scope==='local') return {root:path.resolve(cwd),skill:`${harness==='codex'?'.agents':'.'+harness}/skills/openspec-goldfish`,agents:`.${harness}/agents`};
 if(harness==='claude') return {root:path.resolve(env.CLAUDE_CONFIG_DIR||path.join(home,'.claude')),skill:'skills/openspec-goldfish',agents:'agents'};
 if(harness==='codex') return {root:path.resolve(env.CODEX_HOME||path.join(home,'.codex')),skill:'skills/openspec-goldfish',agents:'agents'};
 return {root:path.resolve(platform==='win32'?path.join(env.APPDATA||path.join(home,'AppData/Roaming'),'devin'):path.join(env.XDG_CONFIG_HOME||path.join(home,'.config'),'devin')),skill:'skills/openspec-goldfish',agents:'agents'};
}
export async function render(options) {
 const loc=locations(options); const files={};
 const read=async name=>readFile(path.join(packageRoot,'resources/protocol',name),'utf8');
 const common=await read('principles.md');
 const header=options.harness==='claude'?'disable-model-invocation: true\n':options.harness==='devin'?'triggers: [user]\n':'';
 const coordinator=await read('coordinator.md');
 files[`${loc.skill}/SKILL.md`]=`---\nname: openspec-goldfish\ndescription: Manually review a completed OpenSpec proposal before implementation.\n${header}---\n\n${coordinator}\n\n## Harness adapter\n\n${delegation(options.harness)}\n`;
 if(options.harness==='codex') files[`${loc.skill}/agents/openai.yaml`]='policy:\n  allow_implicit_invocation: false\n';
 for(const role of roles) {
  const body=`${common}\n${await read(role+'.md')}`;
  const name=`goldfish-${role}`;
  const description=`Only for explicitly invoked Goldfish reviews: ${role}.`;
  if(options.harness==='codex') files[`${loc.agents}/${name}.toml`]=`name = ${JSON.stringify(name)}\ndescription = ${JSON.stringify(description)}\ndeveloper_instructions = ${JSON.stringify(body)}\n`;
  else {
   const tools=options.harness==='claude'?'tools: Read, Grep, Glob\n':'allowed-tools: [read, grep, glob]\n';
   files[`${loc.agents}/${name}.md`]=`---\nname: ${name}\ndescription: ${description}\n${tools}---\n\n${body}`;
  }
 }
 for(const file of await readdir(path.join(packageRoot,'resources/protocol'))) files[`${loc.skill}/protocol/${file}`]=await read(file);
 // Ship deterministic helpers inside the installed skill; no npx download during review.
 for(const file of await readdir(path.join(packageRoot,'src/review'))) if(file.endsWith('.js')) files[`${loc.skill}/runtime/${file}`]=await readFile(path.join(packageRoot,'src/review',file),'utf8');
 files[`${loc.skill}/runtime/package.json`]='{"type":"module"}\n';
 return {...loc,files};
}
export function delegation(harness) {
 if(harness==='claude') return 'Use the Agent tool with subagent_type goldfish-cold-reader, goldfish-adversarial-reviewer, then goldfish-adjudicator. Supply bounded packets; do not fork the author conversation. Native agents only have Read/Grep/Glob. If a native agent is unavailable, record failure; do not substitute your own review.';
 if(harness==='codex') return 'Spawn the named custom agents goldfish-cold-reader, goldfish-adversarial-reviewer, then goldfish-adjudicator with fresh context (no history fork). Do not override model choices. Parent permissions are inherited: read-only instructions are not a separate sandbox. If custom agents or fresh context are unavailable, record failure; do not substitute coordinator self-review.';
 return 'Select native subagent profiles goldfish-cold-reader, goldfish-adversarial-reviewer, then goldfish-adjudicator. Their independent conversation chains must not receive author history. Profiles allow read/grep/glob only. If profiles or isolation are unavailable, record failure; do not substitute coordinator self-review.';
}
