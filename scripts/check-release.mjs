import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';

export function checkRelease({tag, version, cwd=process.cwd()}) {
  if (!/^\d+\.\d+\.\d+$/.test(version) || tag !== `v${version}`) throw new Error('Stable release tag must match package version');
  const git=(...args)=>execFileSync('git',args,{cwd,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
  const revision=git('rev-parse','HEAD');
  if(git('rev-parse',`${tag}^{commit}`)!==revision)throw new Error('Release tag must point at the checked revision');
  git('merge-base','--is-ancestor',revision,'origin/main');
  if(git('status','--porcelain'))throw new Error('Release checkout must be clean');
  return revision;
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href){
  try {
    const {version}=JSON.parse(readFileSync('package.json','utf8'));
    console.log(checkRelease({tag:process.argv[2],version}));
  } catch(error){console.error(`Release rejected: ${error.message}`);process.exitCode=1;}
}
