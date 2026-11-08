import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import {checkRelease} from '../scripts/check-release.mjs';
test('release guard rejects mismatches, off-main commits and dirty checkouts',()=>{
 const cwd=mkdtempSync(path.join(os.tmpdir(),'goldfish-release-'));
 const git=(...args)=>execFileSync('git',args,{cwd,stdio:'pipe',encoding:'utf8'}).trim();
 try{
  git('init');git('config','user.email','fixture@example.invalid');git('config','user.name','Fixture');
  writeFileSync(path.join(cwd,'file'),'one');git('add','.');git('commit','-m','initial');git('update-ref','refs/remotes/origin/main','HEAD');git('tag','v0.1.0');
  assert.equal(checkRelease({cwd,tag:'v0.1.0',version:'0.1.0'}),git('rev-parse','HEAD'));
  assert.throws(()=>checkRelease({cwd,tag:'v0.2.0',version:'0.1.0'}),/match/);
  assert.throws(()=>checkRelease({cwd,tag:'v0.1.0-beta.1',version:'0.1.0-beta.1'}),/Stable/);
  writeFileSync(path.join(cwd,'file'),'two');assert.throws(()=>checkRelease({cwd,tag:'v0.1.0',version:'0.1.0'}),/clean/);
  git('add','.');git('commit','-m','unmerged');git('tag','v0.2.0');
  assert.throws(()=>checkRelease({cwd,tag:'v0.1.0',version:'0.1.0'}),/checked revision/);
  assert.throws(()=>checkRelease({cwd,tag:'v0.2.0',version:'0.2.0'}));
 }finally{rmSync(cwd,{recursive:true,force:true});}
});
