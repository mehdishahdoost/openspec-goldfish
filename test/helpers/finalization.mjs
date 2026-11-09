import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile,readdir,mkdir} from 'node:fs/promises';
import {openSync,closeSync,readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import os from 'node:os';

// Exercise the actual CLI in a child process, providing only deterministic
// OpenSpec discovery metadata. Finalization, snapshots, and IO are not mocked.
export async function exerciseFinalization(runtime,{packageVersion}={}){
 const cwd=await mkdtemp(path.join(os.tmpdir(),'goldfish-finalize-cli-'));
 const changeRoot=path.join(cwd,'change');await mkdir(changeRoot);
 const plan=path.join(changeRoot,'plan.md');await writeFile(plan,'Export profile');
 const status={changeRoot,schemaName:'custom',applyRequires:['plan'],artifacts:[{id:'plan',status:'done',requires:[]}],artifactPaths:{plan:{existingOutputPaths:[plan]}}};
 const hook=path.join(cwd,'metadata.mjs');
 await writeFile(hook,`import cp from 'node:child_process';
import {writeSync} from 'node:fs';
import {syncBuiltinESMExports} from 'node:module';
const original=cp.spawnSync;
cp.spawnSync=(cmd,args,opts)=>{
 if(cmd!=='openspec')return original(cmd,args,opts);
 const status=${JSON.stringify(status)};
 const value=args[0]==='context'?{root:{path:${JSON.stringify(cwd)}}}:args[0]==='list'?{changes:[{name:'sample'}]}:args[0]==='status'?status:{state:'ready',progress:{complete:0}};
 writeSync(opts.stdio[1],JSON.stringify(value));return {status:0};
};syncBuiltinESMExports();`);
 const invoke=(args)=>{
  const out=path.join(cwd,'stdout'),err=path.join(cwd,'stderr'),fds=[openSync(out,'w'),openSync(err,'w')];
  let r;try{r=spawnSync(process.execPath,['--import',pathToFileURL(hook).href,runtime,...args],{cwd,stdio:['ignore',...fds]});}finally{fds.forEach(closeSync);}
  assert.ifError(r.error);return {status:r.status,stdout:readFileSync(out,'utf8'),stderr:readFileSync(err,'utf8')};
 };
 const start=()=>{const r=invoke(['start','--change','sample','--harness','devin','--harness-version','test']);assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout).dir;};
 const role=name=>({role:name,status:'complete',reconstruction:'Export profile',coverage:['plan.md'],evidence:[{path:'plan.md',reference:'all'}],findings:[]});
 const results={'cold-reader':role('cold-reader'),'adversarial-reviewer':role('adversarial-reviewer')};
 const file=path.join(cwd,'candidate.json');await writeFile(file,JSON.stringify(results));
 const dir=start();
 if(packageVersion)assert.equal(JSON.parse(await readFile(path.join(dir,'inputs.json'))).packageVersion,packageVersion);
 const finalize=(run,...extra)=>invoke(['finalize','--run',run,'--results',file,...extra]);
 let r=finalize(dir);assert.equal(r.status,1);assert.match(r.stderr,/Missing adjudicator/);assert.match(r.stderr,/Await pending roles/);
 assert.deepEqual((await readdir(dir)).sort(),['cold-packet.json','inputs.json']);
 for(const args of [['--incomplete-reason'],['--incomplete-reason',''],['--incomplete-reason','   ']]){
  r=finalize(dir,...args);assert.equal(r.status,1);assert.match(r.stderr,/value pairs|nonempty string/);
  assert.deepEqual((await readdir(dir)).sort(),['cold-packet.json','inputs.json']);
 }
 results.adjudicator=role('adjudicator');await writeFile(file,JSON.stringify(results));
 r=finalize(dir,'--incomplete-reason','failure');assert.equal(r.status,1);assert.match(r.stderr,/normal finalization/);
 assert.deepEqual((await readdir(dir)).sort(),['cold-packet.json','inputs.json']);
 r=finalize(dir);assert.equal(r.status,0,r.stderr);assert.equal(JSON.parse(r.stdout).completion,'complete');
 const report=await readFile(path.join(dir,'report.json'),'utf8');
 r=finalize(dir);assert.equal(r.status,1);assert.match(r.stderr,/EEXIST/);assert.equal(await readFile(path.join(dir,'report.json'),'utf8'),report);
 const failed=start();delete results.adjudicator;await writeFile(file,JSON.stringify(results));
 r=finalize(failed,'--incomplete-reason','  Adjudicator timed out  ');assert.equal(r.status,0,r.stderr);
 const saved=JSON.parse(await readFile(path.join(failed,'report.json')));
 assert.equal(saved.completion,'incomplete');assert.equal(saved.readiness,'undetermined');assert.equal(saved.incompleteReason,'Adjudicator timed out');
 assert.match(saved.coverageLimits.join(),/Missing adjudicator/);
 assert.match(await readFile(path.join(failed,'report.md'),'utf8'),/Incomplete reason: Adjudicator timed out/);
 assert.deepEqual(JSON.parse(await readFile(path.join(failed,'results.json'))),results);
}
