import test from 'node:test';
import assert from 'node:assert/strict';
import { parseOptions, selectOptions } from '../src/install/options.js';
for (const harness of ['claude', 'codex', 'devin']) {
  test(`explicit ${harness}`, () => assert.deepEqual(parseOptions(['--harness', harness, '--local']), {harness, scope:'local'}));
}
test('reject invalid options', () => {
  for (const args of [['--global','--local'],['--harness','other'],['--harness'],['--wat'],['--harness','codex','--harness','claude']]) assert.throws(() => parseOptions(args));
});
test('noninteractive requires explicit selections', async () => {
  for (const options of [{},{harness:'codex'},{scope:'local'}]) await assert.rejects(selectOptions(options,{interactive:false}), /requires/);
});
test('interactive local default and global choice', async () => {
  const answers = ['devin', ''];
  assert.deepEqual(await selectOptions({}, {interactive:true,ask:async()=>answers.shift()}),{harness:'devin',scope:'local'});
  assert.equal((await selectOptions({harness:'claude'},{interactive:true,ask:async()=> 'global'})).scope,'global');
});
test('cancel and invalid answers fail before installation', async () => {
  await assert.rejects(selectOptions({}, {interactive:true,ask:async()=>{throw new Error('cancelled');}}),/cancelled/);
  await assert.rejects(selectOptions({harness:'claude'},{interactive:true,ask:async()=> 'oops'}),/Select/);
});
