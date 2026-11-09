import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {exerciseFinalization} from './helpers/finalization.mjs';
test('CLI rejects premature finalization and explicitly persists terminal failure',async()=>{
 await exerciseFinalization(fileURLToPath(new URL('../src/review/tool.js',import.meta.url)));
});
