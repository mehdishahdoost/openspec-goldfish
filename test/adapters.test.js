import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {render,locations,roles} from '../src/adapters/index.js';
import {install} from '../src/install/index.js';
for(const harness of ['claude','codex','devin'])for(const scope of ['local','global'])test(`${harness} ${scope} installation`,async()=>{
 const root=await mkdtemp(path.join(os.tmpdir(),'goldfish-adapter-'));
 const options={harness,scope,cwd:root,home:root,env:{}};
 const plan=await render(options);await install(options);await install(options);
 assert.match(await readFile(path.join(plan.root,plan.skill,'SKILL.md'),'utf8'),/explicit user invocation/);
 assert.ok(plan.files[`${plan.skill}/runtime/tool.js`]);
 for(const role of roles){
 const ext=harness==='codex'?'toml':'md';const body=plan.files[`${plan.agents}/goldfish-${role}.${ext}`];
 assert.match(body,/Never edit|never edit|Do not.*edit|Never.*edit/i);
 if(harness==='codex'){
 const lines=body.trim().split('\n');const parsed=Object.fromEntries(lines.map(l=>{const i=l.indexOf(' = ');return [l.slice(0,i),JSON.parse(l.slice(i+3))];}));
 assert.equal(parsed.name,`goldfish-${role}`);assert.ok(parsed.developer_instructions);
 assert.doesNotMatch(body,/sandbox_mode|approval_policy/);
 }
 }
 assert.ok(!Object.keys(plan.files).some(p=>p.includes('hooks')||p.includes('openspec-propose')));
 if(harness==='claude')assert.match(plan.files[`${plan.skill}/SKILL.md`],/disable-model-invocation: true/);
 if(harness==='codex')assert.match(plan.files[`${plan.skill}/agents/openai.yaml`],/allow_implicit_invocation: false/);
 if(harness==='devin')assert.match(plan.files[`${plan.skill}/SKILL.md`],/triggers: \[user\]/);
});
test('global overrides and Windows Devin path',()=>{
 assert.equal(locations({harness:'codex',scope:'global',env:{CODEX_HOME:'/tmp/custom'}}).root,path.resolve('/tmp/custom'));
 assert.equal(locations({harness:'claude',scope:'global',env:{CLAUDE_CONFIG_DIR:'/tmp/custom'}}).root,path.resolve('/tmp/custom'));
 assert.equal(locations({harness:'devin',scope:'global',env:{APPDATA:'/tmp/app'},platform:'win32'}).root,path.resolve('/tmp/app/devin'));
});
test('all harnesses coexist and README assets exist',async()=>{
 const root=await mkdtemp(path.join(os.tmpdir(),'goldfish-coexist-'));
 for(const harness of ['claude','codex','devin'])await install({harness,scope:'local',cwd:root});
 for(const harness of ['claude','codex','devin'])assert.ok(await readFile(path.join(root,`.goldfish-install/${harness}.json`)));
 const readme=await readFile(new URL('../README.md',import.meta.url),'utf8');
 for(const asset of ['goldfish-logo.png','goldfish-cover.png']){assert.ok(readme.includes(asset));assert.ok((await readFile(new URL('../assets/'+asset,import.meta.url))).length>0);}
});
test('discovery paths match independently pinned documentation fixtures',async()=>{
 const expected=JSON.parse(await readFile(new URL('./fixtures/adapters.json',import.meta.url),'utf8'));
 for(const [harness,fixture] of Object.entries(expected)){
  const local=locations({harness,scope:'local',cwd:'/tmp/project',env:{},platform:'linux'});
  assert.equal(local.skill,fixture.localSkill);assert.equal(local.agents,fixture.localAgents);
  const global=locations({harness,scope:'global',home:'/tmp/user',env:{},platform:'linux'});
  assert.equal(global.root,path.resolve('/tmp/user',fixture.globalRoot));
 }
});
