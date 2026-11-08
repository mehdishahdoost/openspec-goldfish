import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,mkdir,symlink} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {commitFiles,exists} from '../src/install/files.js';
const temp=()=>mkdtemp(path.join(os.tmpdir(),'goldfish-install-'));
test('idempotent upgrade, retired files and second harness',async()=>{
 const root=await temp(); const first={root,harness:'claude',version:'1',files:{'a/skill':'old'}};
 await commitFiles(first); await commitFiles(first);
 await commitFiles({...first,harness:'devin',files:{'b/skill':'other'}});
 await commitFiles({...first,version:'2',files:{'a/new':'new'}});
 assert.equal(await exists(path.join(root,'a/skill')),false);
 assert.equal(await readFile(path.join(root,'b/skill'),'utf8'),'other');
});
test('modified and unowned conflicts have no partial writes',async()=>{
 for(const owned of [true,false]) {
 const root=await temp(); const opts={root,harness:'codex',version:'1',files:{'z':'one'}};
 if(owned) await commitFiles(opts);
 await writeFile(path.join(root,'z'),'custom');
 await assert.rejects(commitFiles({...opts,files:{'a':'new','z':'two'}}),/conflict/);
 assert.equal(await exists(path.join(root,'a')),false);
 assert.equal(await readFile(path.join(root,'z'),'utf8'),'custom');
 }
});
test('symlink and traversal escape rejected',async()=>{
 const root=await temp(); const outside=await temp();
 await symlink(outside,path.join(root,'linked'),'junction');
 for(const file of ['linked/evil','../evil']) await assert.rejects(commitFiles({root,harness:'x',version:'1',files:{[file]:'bad'}}),/Symlink|escapes/);
});
test('failed transaction restores files and does not advance manifest',async()=>{
 const root=await temp(); const opts={root,harness:'claude',version:'1',files:{'a':'old'}};
 await commitFiles(opts);
 await assert.rejects(commitFiles({...opts,version:'2',files:{'a':'new','b':'new'},beforeWrite:async(_,i)=>{if(i===1)throw new Error('disk failure');}}),/rolled back/);
 assert.equal(await readFile(path.join(root,'a'),'utf8'),'old');
 assert.equal(JSON.parse(await readFile(path.join(root,'.goldfish-install/claude.json'))).version,'1');
});
test('interrupted journal prevents writes',async()=>{
 const root=await temp(); await mkdir(path.join(root,'.goldfish-install')); await writeFile(path.join(root,'.goldfish-install/claude.pending'),'[]');
 await assert.rejects(commitFiles({root,harness:'claude',version:'1',files:{a:'a'}}),/Interrupted/);
});
