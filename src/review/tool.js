#!/usr/bin/env node
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {discover,snapshot,createRun,finalize,prepareRevision,recordRevision,revisionOffer} from './core.js';
const json=async f=>JSON.parse(await readFile(f,'utf8'));
try {
 const [action,...args]=process.argv.slice(2);const opts={};
 for(let i=0;i<args.length;i+=2){if(!/^--[a-z-]+$/.test(args[i])||args[i+1]===undefined)throw new Error('Expected --key value pairs');opts[args[i].slice(2)]=args[i+1];}
 let result;
 if(action==='start') {
  const target=discover({change:opts.change,store:opts.store});
  const constraints=opts.constraints?await readFile(opts.constraints,'utf8'):'';
  result=await createRun(target,await snapshot(target,constraints),{harness:opts.harness,harnessVersion:opts['harness-version']});
  result={dir:result.dir,runId:result.record.runId};
 }else if(['finalize','freshness','prepare-revision','record-revision'].includes(action)){
  if(!opts.run)throw new Error('--run is required');
  const inputs=await json(path.join(opts.run,'inputs.json'));
  const target=discover({change:inputs.change,store:inputs.store,cwd:inputs.cwd});
  const current=await snapshot(target,inputs.metadata.constraints);
  if(action==='finalize')result=await finalize(opts.run,await json(opts.results),current,{incompleteReason:opts['incomplete-reason']});
  if(action==='freshness')result={freshness:inputs.fingerprint===current.fingerprint?'current':'stale'};
  if(action==='prepare-revision'){const offer=await json(opts.offer); revisionOffer(await json(path.join(opts.run,'report.json')),offer.edits); result=await prepareRevision(inputs,offer,await json(opts.acceptance));}
  if(action==='record-revision')result=await recordRevision(opts.run,await json(opts.outcomes),current);
 }else throw new Error('Commands: start, finalize, freshness, prepare-revision, record-revision. See protocol/workflow.md.');
 console.log(JSON.stringify(result,null,2));
}catch(e){console.error(e.message);process.exitCode=1;}
