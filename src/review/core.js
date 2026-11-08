import {createHash,randomUUID} from 'node:crypto';
import {readFile,writeFile,mkdir,lstat,readdir} from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,openSync,closeSync,readFileSync,rmSync} from 'node:fs';
import os from 'node:os';
export const roles=['cold-reader','adversarial-reviewer','adjudicator'];
export const digest=x=>createHash('sha256').update(x).digest('hex');
export async function contained(root,file) {
 const base=path.resolve(root),target=path.resolve(file),rel=path.relative(base,target);
 if(!rel||rel==='..'||rel.startsWith('..'+path.sep)||path.isAbsolute(rel))throw new Error(`Path outside change: ${file}`);
 let cursor=base;
 // Ancestors belong to the selected root; system aliases such as /var are valid.
 for(const part of ['',...rel.split(path.sep)]) {
  cursor=path.join(cursor,part);
  try{if((await lstat(cursor)).isSymbolicLink())throw new Error(`Symlink refused: ${cursor}`);}catch(e){if(e.code!=='ENOENT')throw e;}
 }
 return target;
}
export function runOpenSpec(args,{cwd=process.cwd(),store}={}) {
 const command=[...args,'--json',...(store?['--store',store]:[])];
 const temp=mkdtempSync(path.join(os.tmpdir(),'goldfish-cli-'));
 const out=path.join(temp,'stdout'),err=path.join(temp,'stderr');
 const outFd=openSync(out,'w'),errFd=openSync(err,'w');
 let result;
 try{result=spawnSync('openspec',command,{cwd,stdio:['ignore',outFd,errFd]});}
 finally{closeSync(outFd);closeSync(errFd);}
 try{
  const stdout=readFileSync(out,'utf8'),stderr=readFileSync(err,'utf8');
  if(result.status!==0)throw new Error(`OpenSpec ${args.join(' ')} failed: ${stdout||stderr||result.error?.message}`);
  try{return JSON.parse(stdout);}catch{throw new Error('OpenSpec returned invalid JSON');}
 }finally{rmSync(temp,{recursive:true,force:true});}
}
export function validatePlanning(status,apply) {
 if(!status?.changeRoot||!Array.isArray(status.artifacts)||!Array.isArray(status.applyRequires)||!status.artifactPaths)throw new Error('Unsupported OpenSpec metadata: resolved changeRoot/artifactPaths/dependencies required.');
 if(apply?.progress?.complete>0||apply?.tasks?.some(t=>t.done))throw new Error('Implementation has started; Goldfish reviews planning only.');
 const byId=new Map(status.artifacts.map(a=>[a.id,a])); const required=new Set();
 const visit=(id,trail=new Set())=>{
  if(trail.has(id))throw new Error('Cyclic artifact dependencies');
  if(required.has(id))return;
  const a=byId.get(id);if(!a||!Array.isArray(a.requires))throw new Error(`Unsupported artifact metadata: ${id}`);
  required.add(id);if(a.status==='skipped')return;
  for(const dep of a.requires)visit(dep,new Set([...trail,id]));
 };
 for(const id of status.applyRequires)visit(id);
 if(!required.size)throw new Error('No planning prerequisites available');
 const missing=[...required].filter(id=>!['done','skipped'].includes(byId.get(id).status));
 if(missing.length)throw new Error(`Missing planning artifacts: ${missing.join(', ')}`);
 if(apply?.state==='blocked')throw new Error(`OpenSpec apply metadata blocked: ${apply.instruction}`);
 return [...required];
}
export function discover({cwd=process.cwd(),store,change,execute=runOpenSpec}={}) {
 const options={cwd,store}; const context=execute(['context'],options);
 if(!context.root?.path)throw new Error('No resolved OpenSpec root; initialize or select a store explicitly.');
 const list=execute(['list'],options);
 if(!change){if(list.changes?.length!==1)throw new Error(`Select a change explicitly: ${(list.changes||[]).map(c=>c.name).join(', ')||'none available'}`);change=list.changes[0].name;}
 if(!list.changes?.some(c=>c.name===change))throw new Error(`Unknown active change: ${change}`);
 const status=execute(['status','--change',change],options);
 const apply=execute(['instructions','apply','--change',change],options);
 const required=validatePlanning(status,apply);
 return {cwd,store,change,root:context.root.path,status,required};
}
// Re-enumerate schema outputs on each discovery to detect added/deleted glob matches.
export async function snapshot(target,constraints='') {
 const files=[];
 for(const id of target.required) {
  const artifact=target.status.artifacts.find(a=>a.id===id);
  if(artifact.status==='skipped')continue;
  const paths=target.status.artifactPaths[id]?.existingOutputPaths;
  if(!Array.isArray(paths)||!paths.length)throw new Error(`Missing concrete artifact paths: ${id}`);
  for(const file of paths) {
   await contained(target.status.changeRoot,file);
   const content=await readFile(file,'utf8');
   files.push({artifact:id,path:path.relative(target.status.changeRoot,file).split(path.sep).join('/'),sha256:digest(content),content});
  }
 }
 files.sort((a,b)=>a.path.localeCompare(b.path));
 const metadata={schema:target.status.schemaName,artifacts:target.status.artifacts.map(a=>({id:a.id,requires:a.requires,skipped:a.status==='skipped'})),constraints};
 return {files,metadata,fingerprint:digest(JSON.stringify({files:files.map(({content,...f})=>f),metadata}))};
}
export function coldPacket(inputs){return {constraints:inputs.metadata.constraints,artifacts:inputs.files.map(({artifact,path,content})=>({artifact,path,content}))};}
export async function createRun(target,inputs,{harness,harnessVersion,packageVersion='0.1.0'}={}) {
 if(!['claude','codex','devin'].includes(harness)||!harnessVersion)throw new Error('Harness and actual harness version required');
 const id=randomUUID();const dir=await contained(target.status.changeRoot,path.join(target.status.changeRoot,'.goldfish/reviews',id));
 await mkdir(dir,{recursive:true});
 const record={runId:id,createdAt:new Date().toISOString(),change:target.change,changeRoot:target.status.changeRoot,cwd:target.cwd,store:target.store,harness,harnessVersion,packageVersion,protocolVersion:1,...inputs};
 await writeFile(path.join(dir,'inputs.json'),JSON.stringify(record,null,2)+'\n',{flag:'wx'});
 await writeFile(path.join(dir,'cold-packet.json'),JSON.stringify(coldPacket(inputs),null,2)+'\n',{flag:'wx'});
 return {dir,record};
}
const nonempty=v=>typeof v==='string'&&v.trim().length>0;
export function validateResult(result,role) {
 if(!result||result.role!==role||!['complete','failed'].includes(result.status)||!Array.isArray(result.findings)||!Array.isArray(result.coverage)||!result.coverage.every(nonempty))throw new Error(`Malformed ${role} result`);
 if(result.status==='failed'&&!nonempty(result.error))throw new Error(`Missing ${role} failure reason`);
 if(role==='cold-reader'&&result.status==='complete'&&!nonempty(result.reconstruction))throw new Error('Cold reader must reconstruct intent');
 const ids=new Set();
 for(const f of result.findings){
  if(!f||!['id','location','scenario','impact','resolution'].every(k=>nonempty(f[k]))||!['critical','major','minor'].includes(f.severity)||ids.has(f.id))throw new Error(`Malformed finding in ${role}`);
  ids.add(f.id);
  if(role==='adjudicator'){
   if(!['accepted','dismissed','duplicate','unresolved'].includes(f.disposition)||!nonempty(f.reason))throw new Error(`Missing disposition: ${f.id}`);
   if(f.disposition==='unresolved'&&typeof f.blocking!=='boolean')throw new Error(`Missing blocking decision: ${f.id}`);
   if(f.disposition==='duplicate'&&!nonempty(f.duplicateOf))throw new Error(`Missing canonical ID: ${f.id}`);
  }
 }
 if(!Array.isArray(result.evidence)||!result.evidence.every(e=>nonempty(e.path)&&nonempty(e.reference)))throw new Error(`Missing evidence inventory: ${role}`);
 return result;
}
export function adjudicate(results,{stale=false}={}) {
 const coverage=[];const valid={};
 for(const role of roles){
  try{valid[role]=validateResult(results[role],role);if(valid[role].status==='failed')coverage.push(`${role}: ${valid[role].error}`);}
  catch(e){coverage.push(e.message);}
 }
 const findings=valid.adjudicator?.findings||[];
 const canonical=new Map(findings.map(f=>[f.id,f]));
 const originals=roles.slice(0,2).flatMap(r=>valid[r]?.findings||[]);
 if(new Set(originals.map(f=>f.id)).size!==originals.length)coverage.push('Reviewer finding IDs collide');
 for(const f of originals)if(!canonical.has(f.id))coverage.push(`Adjudicator omitted ${f.id}`);
 for(const f of findings)if(f.disposition==='duplicate'&&(!canonical.has(f.duplicateOf)||canonical.get(f.duplicateOf).disposition==='duplicate'||f.id===f.duplicateOf))coverage.push(`Invalid duplicate: ${f.id}`);
 const complete=coverage.length===0;
 const blocking=findings.some(f=>(f.disposition==='accepted'&&['critical','major'].includes(f.severity))||(f.disposition==='unresolved'&&f.blocking));
 return {completion:complete?'complete':'incomplete',readiness:!complete?'undetermined':blocking?'revise':'ready',freshness:stale?'stale':'current',coverageLimits:coverage,roleResults:valid,findings,revisionOffer:findings.some(f=>f.disposition==='accepted')?'Offer specific artifact revisions and wait for explicit acceptance.':'No accepted fixes to offer. Discuss unresolved questions if any.'};
}
export function markdown(report){
 const lines=[`# Goldfish review: ${report.change}`,``, `Completion: **${report.completion}**`, `Readiness: **${report.readiness}**`, `Freshness: **${report.freshness}**`, '',report.freshness==='stale'?'This verdict describes older inputs and is not current.':'Readiness is advisory, not an implementation gate.','', '## Coverage',''];
 for(const [role,result] of Object.entries(report.roleResults))lines.push(`- ${role}: ${result.status}; ${result.coverage.join('; ')}`);
 for(const limit of report.coverageLimits)lines.push(`- LIMIT: ${limit}`);
 lines.push('','## Findings','');
 if(!report.findings.length)lines.push('No adjudicated findings. Check completion before interpreting this result.');
 for(const f of report.findings)lines.push(`### ${f.id}: ${f.severity} / ${f.disposition}`,'',`Location: ${f.location}`,`Scenario: ${f.scenario}`,`Impact: ${f.impact}`,`Resolution: ${f.resolution}`,`Decision: ${f.reason}${f.duplicateOf?` (duplicate of ${f.duplicateOf})`:''}`,'');
 lines.push('','## Next step','',report.revisionOffer,'Re-review requires a new explicit invocation.');
 return lines.join('\n')+'\n';
}
export async function finalize(dir,results,currentInputs) {
 const inputs=JSON.parse(await readFile(path.join(dir,'inputs.json'),'utf8'));
 await contained(inputs.changeRoot,dir);
 const report={runId:inputs.runId,change:inputs.change,harness:inputs.harness,harnessVersion:inputs.harnessVersion,packageVersion:inputs.packageVersion,protocolVersion:inputs.protocolVersion,inputFingerprint:inputs.fingerprint,createdAt:new Date().toISOString(),...adjudicate(results,{stale:inputs.fingerprint!==currentInputs.fingerprint})};
 // Reserve once: never rewrite an earlier report, even after partial failure.
 await writeFile(path.join(dir,'results.json'),JSON.stringify(results,null,2)+'\n',{flag:'wx'});
 await writeFile(path.join(dir,'report.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
 await writeFile(path.join(dir,'report.md'),markdown(report),{flag:'wx'});
 return report;
}
export function revisionOffer(report,edits){
 const accepted=new Set(report.findings.filter(f=>f.disposition==='accepted').map(f=>f.id));
 for(const edit of edits)if(!accepted.has(edit.findingId)||!nonempty(edit.path)||!nonempty(edit.description))throw new Error('Revision offer must reference accepted findings and explicit edits');
 return {runId:report.runId,edits,question:'Apply these planning edits? Accept all, select finding IDs, or decline.'};
}
export async function prepareRevision(inputs,offer,{acceptedIds=[],explicitAcceptance=false}={}){
 if(!explicitAcceptance)return [];
 if(offer.runId!==inputs.runId)throw new Error('Revision offer belongs to another run');
 if(!acceptedIds.every(id=>offer.edits.some(e=>e.findingId===id)))throw new Error('Unknown accepted finding');
 const selected=offer.edits.filter(e=>acceptedIds.includes(e.findingId));
 const plan=[];
 for(const edit of selected){
  const input=inputs.files.find(f=>f.path===edit.path);if(!input)throw new Error('Revision may edit only agreed planning artifacts');
  const file=await contained(inputs.changeRoot,path.join(inputs.changeRoot,edit.path));
  const content=await readFile(file,'utf8');
  const acceptedHash=edit.beforeHash ?? input.sha256;
  if(digest(content)!==acceptedHash)throw new Error(`Artifact changed; reread and reconcile accepted scope: ${edit.path}`);
  if(edit.requiresDecision)throw new Error(`User decision required before editing ${edit.path}`);
  plan.push({...edit,beforeHash:acceptedHash});
 }
 return plan;
}
export async function recordRevision(dir,{acceptedIds,outcomes},currentInputs){
 const inputs=JSON.parse(await readFile(path.join(dir,'inputs.json'),'utf8'));await contained(inputs.changeRoot,dir);
 if(!Array.isArray(acceptedIds)||!Array.isArray(outcomes))throw new Error('Revision acceptance and outcomes required');
 const report=JSON.parse(await readFile(path.join(dir,'report.json'),'utf8'));
 const validIds=new Set(report.findings.map(f=>f.id));
 for(const id of acceptedIds)if(!validIds.has(id))throw new Error('Unknown accepted finding');
 for(const o of outcomes){
  if(!validIds.has(o.id)||!['applied','deferred','unresolved'].includes(o.status)||!nonempty(o.reason)||!Array.isArray(o.paths))throw new Error('Invalid revision outcome');
  if(o.status==='applied'&&!acceptedIds.includes(o.id))throw new Error('Unaccepted revision');
  for(const p of o.paths){if(!inputs.files.some(f=>f.path===p))throw new Error('Revision outside planning artifacts');await contained(inputs.changeRoot,path.join(inputs.changeRoot,p));}
 }
 const record={runId:inputs.runId,createdAt:new Date().toISOString(),acceptedIds,outcomes,freshness:inputs.fingerprint===currentInputs.fingerprint?'current':'stale',next:'Offer a fresh review; wait for explicit invocation.'};
 const filename=path.join(dir,`revision-${randomUUID()}.json`);
 await writeFile(filename,JSON.stringify(record,null,2)+'\n',{flag:'wx'});return record;
}
