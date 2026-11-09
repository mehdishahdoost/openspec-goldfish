import test from 'node:test';
import {exerciseFinalization} from './helpers/finalization.mjs';
import assert from 'node:assert/strict';
import {execFileSync,spawnSync} from 'node:child_process';
import {mkdtemp,readFile,mkdir,realpath} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {mkdtempSync,openSync,closeSync,readFileSync,rmSync} from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';
const run=(cmd,args,opts={})=>{const dir=mkdtempSync(path.join(os.tmpdir(),'goldfish-child-'));const out=path.join(dir,'out'),err=path.join(dir,'err');const fds=[openSync(out,'w'),openSync(err,'w')];let r;try{r=spawnSync(cmd,args,{...opts,stdio:['ignore',...fds]});}finally{fds.forEach(closeSync);}r.stdout=readFileSync(out,'utf8');r.stderr=readFileSync(err,'utf8');rmSync(dir,{recursive:true,force:true});return r;};
const exec=(cmd,args,opts)=>{const r=run(cmd,args,opts);if(r.status!==0)throw new Error(r.stderr||r.error?.message||'Command failed');return r.stdout;};
const root=fileURLToPath(new URL('../',import.meta.url));
test('packed package installs all adapters and bundled runtime works away from package',async()=>{
 const temp=await mkdtemp(path.join(os.tmpdir(),'goldfish-pack-'));const npm=process.execPath; const npmCli=process.env.npm_execpath || (process.platform==='win32'?path.join(path.dirname(process.execPath),'node_modules/npm/bin/npm-cli.js'):await realpath(path.join(path.dirname(process.execPath),'npm')));
 const output=JSON.parse(exec(npm,[npmCli,'pack','--json','--pack-destination',temp,'--cache',path.join(temp,'cache')],{cwd:root,encoding:'utf8'}));
 const packed=new Set(output[0].files.map(f=>f.path));
 for(const required of ['LICENSE','README.md','package.json','bin/openspec-goldfish.js','resources/protocol/workflow.md','src/review/tool.js'])assert.ok(packed.has(required),`Missing ${required}`);
 for(const prefix of ['test/','openspec/','website/','scripts/','docs/native/','docs/releases/'])assert.ok(![...packed].some(f=>f.startsWith(prefix)),`Unexpected ${prefix}`);
 const prefix=path.join(temp,'consumer');await mkdir(prefix);
 exec(npm,[npmCli,'install','--prefix',prefix,'--ignore-scripts','--no-audit','--no-fund', '--cache',path.join(temp,'cache'),path.join(temp,output[0].filename)],{encoding:'utf8'});
 const pkg=path.join(prefix,'node_modules/openspec-goldfish');
 const metadata=JSON.parse(await readFile(path.join(pkg,'package.json'),'utf8'));
 assert.equal(metadata.license,'MIT');assert.equal(metadata.name,'openspec-goldfish');
 assert.match(metadata.repository.url,/github.com\/mehdishahdoost\/openspec-goldfish/);
 assert.match(await readFile(path.join(pkg,'LICENSE'),'utf8'),/MIT License/);
 const {install}=await import(pathToFileURL(path.join(pkg,'src/install/index.js')).href);
 const {locations}=await import(pathToFileURL(path.join(pkg,'src/adapters/index.js')).href);
 const project=path.join(temp,'project');await mkdir(project);
 for(const scope of ['local','global'])for(const harness of ['claude','codex','devin']){
  const opts={scope,harness,cwd:project,home:path.join(temp,'home'),env:{}};
  await install(opts);const loc=locations(opts);
  const runtime=path.join(loc.root,loc.skill,'runtime/tool.js');
  const result=run(process.execPath,[runtime],{cwd:temp,encoding:'utf8'});
  assert.match(result.stderr,/Commands: start/);assert.doesNotMatch(result.stderr,/MODULE_NOT_FOUND|SyntaxError/);
  assert.ok(await readFile(path.join(loc.root,loc.skill,'protocol/workflow.md')));
  await exerciseFinalization(runtime,{packageVersion:metadata.version});
 }
 const result=run(process.execPath,[path.join(pkg,'bin/openspec-goldfish.js'),'--help'],{cwd:temp,encoding:'utf8'});assert.equal(result.status,0);assert.match(result.stdout,/Usage/);
});
