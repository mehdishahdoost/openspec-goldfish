import {readFile} from 'node:fs/promises';
import {render} from '../adapters/index.js';
import {commitFiles} from './files.js';
export async function install(options) {
 const plan=await render(options);
 const {version}=JSON.parse(await readFile(new URL('../../package.json',import.meta.url)));
 return commitFiles({root:plan.root,files:plan.files,harness:options.harness,version});
}
