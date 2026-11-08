import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile,mkdir,symlink} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {discover,validatePlanning,snapshot,coldPacket,createRun,adjudicate,finalize,revisionOffer,prepareRevision,recordRevision} from '../src/review/core.js';
const good=(role,findings=[])=>({role,status:'complete',reconstruction:'Scope and acceptance reconstructed',coverage:['plan'],evidence:[{path:'plan.md',reference:'Scope'}],findings});
const finding=(id='C1',severity='major')=>({id,severity,location:'plan.md: Scope',scenario:'Request times out',impact:'Unknown retry behavior',resolution:'Specify retry contract'});
const results=(findings=[])=>({'cold-reader':good('cold-reader',findings),'adversarial-reviewer':good('adversarial-reviewer'),adjudicator:good('adjudicator',findings.map(f=>({...f,disposition:'accepted',reason:'No retry policy in Scope'})))});
async function fixture(){
 const root=await mkdtemp(path.join(os.tmpdir(),'goldfish-review-'));await writeFile(path.join(root,'plan.md'),'Create export. Scope: retries unspecified.');
 const status={changeRoot:root,schemaName:'custom',applyRequires:['plan'],artifacts:[{id:'plan',status:'done',requires:[]},{id:'optional',status:'skipped',requires:[]}],artifactPaths:{plan:{existingOutputPaths:[path.join(root,'plan.md')]}}};
 return {cwd:root,root,change:'sample',status,required:['plan']};
}
test('discovery handles metadata, stores, selection and progress',async()=>{
 const t=await fixture();const seen=[];
 const execute=(args,opts)=>{seen.push(opts);if(args[0]==='context')return {root:{path:t.root}};if(args[0]==='list')return {changes:[{name:'sample'}]};if(args[0]==='status')return t.status;return {state:'ready',progress:{complete:0}};};
 assert.equal(discover({store:'s',execute}).change,'sample');assert.ok(seen.every(o=>o.store==='s'));
 assert.throws(()=>discover({execute:()=>({root:null})}),/root/);
 assert.throws(()=>discover({execute:(args)=>args[0]==='context'?{root:{path:t.root}}:{changes:[{name:'a'},{name:'b'}]}}),/Select/);
 assert.throws(()=>validatePlanning(t.status,{progress:{complete:1}}),/started/);
 assert.throws(()=>validatePlanning({},{}),/metadata/);
 t.status.artifacts[0].status='ready';assert.throws(()=>validatePlanning(t.status,{}),/Missing/);
 t.status.artifacts[0].status='skipped';assert.deepEqual(validatePlanning(t.status,{}),['plan']);
});
test('transitive dependencies checked even when terminal artifact done',async()=>{
 const t=await fixture();t.status.artifacts[0].requires=['why'];t.status.artifacts.push({id:'why',status:'ready',requires:[]});
 assert.throws(()=>validatePlanning(t.status,{}),/why/);
});
test('cold packet excludes extraneous context and fingerprints change',async()=>{
 const t=await fixture();const a=await snapshot(t,'Must work offline');
 const packet=coldPacket({...a,authorChat:'secret',history:'old',code:'source'});
 assert.deepEqual(Object.keys(packet).sort(),['artifacts','constraints']);
 assert.ok(!JSON.stringify(packet).includes('secret'));assert.match(packet.artifacts[0].content,/unspecified/);
 await writeFile(path.join(t.root,'plan.md'),'Specify no retries');const b=await snapshot(t,'Must work offline');assert.notEqual(a.fingerprint,b.fingerprint);
 await writeFile(path.join(t.root,'extra.md'),'extra');t.status.artifactPaths.plan.existingOutputPaths.push(path.join(t.root,'extra.md'));
 const c=await snapshot(t,'Must work offline');assert.notEqual(b.fingerprint,c.fingerprint);
 t.status.artifactPaths.plan.existingOutputPaths.pop();assert.equal((await snapshot(t,'Must work offline')).fingerprint,b.fingerprint);
});
test('verdicts cover clean, minor, major, critical, unresolved and dismissals',()=>{
 assert.equal(adjudicate(results()).readiness,'ready');
 assert.equal(adjudicate(results([finding('C1','minor')])).readiness,'ready');
 for(const severity of ['major','critical'])assert.equal(adjudicate(results([finding('C1',severity)])).readiness,'revise');
 const r=results([finding()]);r.adjudicator.findings[0].disposition='dismissed';assert.equal(adjudicate(r).readiness,'ready');
 r.adjudicator.findings[0].disposition='unresolved';r.adjudicator.findings[0].blocking=true;assert.equal(adjudicate(r).readiness,'revise');
});
test('missing, failed, malformed, omitted and invalid duplicate coverage is incomplete',()=>{
 for(const mutate of [r=>delete r['cold-reader'],r=>r['cold-reader'].status='failed',r=>r.adjudicator.findings=[],r=>r.adjudicator.findings[0].disposition='invalid',r=>{Object.assign(r.adjudicator.findings[0],{disposition:'duplicate',duplicateOf:'missing'});}]){
 const r=results([finding()]);mutate(r);assert.equal(adjudicate(r).readiness,'undetermined');
 }
 const r=results();r['cold-reader']={role:'cold-reader',status:'failed',error:'timeout',coverage:[],evidence:[],findings:[]};assert.match(adjudicate(r).coverageLimits.join(),/timeout/);
});
test('valid duplicates and reasons retained',()=>{
 const r=results([finding('C1'),finding('C2')]);Object.assign(r.adjudicator.findings[1],{disposition:'duplicate',duplicateOf:'C1',reason:'Same missing policy'});
 assert.equal(adjudicate(r).completion,'complete');assert.equal(adjudicate(r).findings[1].duplicateOf,'C1');
});
test('reports are immutable, stale and human/machine agree',async()=>{
 const t=await fixture();const a=await snapshot(t);const run=await createRun(t,a,{harness:'codex',harnessVersion:'test'});
 await writeFile(path.join(t.root,'plan.md'),'changed');const b=await snapshot(t);
 const report=await finalize(run.dir,results([finding()]),b);assert.equal(report.freshness,'stale');
 const md=await readFile(path.join(run.dir,'report.md'),'utf8');for(const v of [report.completion,report.readiness,report.freshness])assert.ok(md.includes(v));
 await assert.rejects(finalize(run.dir,results(),b),/EEXIST/);
 const second=await createRun(t,b,{harness:'codex',harnessVersion:'test'});assert.notEqual(run.dir,second.dir);
});
test('run rejects symlink report destination',async()=>{
 const t=await fixture();const other=await mkdtemp(path.join(os.tmpdir(),'goldfish-other-'));await symlink(other,path.join(t.root,'.goldfish'),'junction');
 await assert.rejects(createRun(t,await snapshot(t),{harness:'claude',harnessVersion:'test'}),/Symlink/);
});
test('revision acceptance, subset, decision gate, concurrency and outcomes',async()=>{
 const t=await fixture();const inputs=await snapshot(t);const run=await createRun(t,inputs,{harness:'devin',harnessVersion:'test'});
 const report=await finalize(run.dir,results([finding('C1'),finding('C2')]),inputs);
 const offer=revisionOffer(report,[{findingId:'C1',path:'plan.md',description:'Specify retry'},{findingId:'C2',path:'plan.md',description:'Specify timeout'}]);
 assert.deepEqual(await prepareRevision(run.record,offer,{}),[]);
 assert.equal((await prepareRevision(run.record,offer,{explicitAcceptance:true,acceptedIds:['C1']})).length,1);
 const decision={...offer,edits:[{...offer.edits[0],requiresDecision:true}]};await assert.rejects(prepareRevision(run.record,decision,{explicitAcceptance:true,acceptedIds:['C1']}),/decision/);
 const escaped={...offer,edits:[{...offer.edits[0],path:'../code.js'}]};await assert.rejects(prepareRevision(run.record,escaped,{explicitAcceptance:true,acceptedIds:['C1']}),/planning/);
 await writeFile(path.join(t.root,'plan.md'),'Specify no retry');await assert.rejects(prepareRevision(run.record,offer,{explicitAcceptance:true,acceptedIds:['C1']}),/changed/);
 const revision=await recordRevision(run.dir,{acceptedIds:['C1'],outcomes:[{id:'C1',status:'applied',paths:['plan.md'],reason:'User accepted no retries'},{id:'C2',status:'deferred',paths:[],reason:'Not selected'}]},await snapshot(t));
 assert.equal(revision.freshness,'stale');assert.match(revision.next,/wait for explicit/);
 assert.equal(JSON.parse(await readFile(path.join(run.dir,'report.json'))).freshness,'current');
});
