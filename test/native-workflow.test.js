import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {adjudicate} from '../src/review/core.js';
for(const harness of ['claude','codex','devin'])test(`recorded ${harness} native report and approved revision remain compatible`,async()=>{
 const base=new URL(`../docs/native/end-to-end/${harness}/`,import.meta.url);
 const report=JSON.parse(await readFile(new URL('report.json',base)));
 const revision=JSON.parse(await readFile(new URL('revision.json',base)));
 const verdict=adjudicate(report.roleResults);
 assert.equal(verdict.completion,'complete');assert.equal(verdict.readiness,report.readiness);
 assert.equal(report.freshness,'current');assert.equal(revision.freshness,'stale');
 assert.deepEqual(new Set(revision.acceptedIds),new Set(['A1','A2']));
 const applied=revision.outcomes.filter(o=>o.status==='applied');
 assert.deepEqual(new Set(applied.map(o=>o.id)),new Set(revision.acceptedIds));
 for(const outcome of applied)assert.deepEqual(outcome.paths,['design.md']);
 const md=await readFile(new URL('report.md',base),'utf8');
 assert.ok(md.includes(report.readiness));assert.ok(md.includes(report.completion));
});
