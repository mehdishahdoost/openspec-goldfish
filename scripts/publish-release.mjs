import {readFileSync} from 'node:fs';
import {execFileSync,spawnSync} from 'node:child_process';
const {name,version}=JSON.parse(readFileSync('package.json','utf8'));
const revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const result=spawnSync('npm',['view',`${name}@${version}`,'--json','--fetch-retries=0'],{encoding:'utf8'});
if(result.error)throw result.error;
if(result.status===0){
 const published=JSON.parse(result.stdout);
 if(published.gitHead!==revision || published.license!=='MIT')throw new Error('Existing version does not match this MIT release revision');
 console.log(`Verified existing bootstrap release ${name}@${version} from ${revision}; no republish attempted.`);
}else{
 let error;try{error=JSON.parse(result.stdout).error;}catch{}
 if(error?.code!=='E404')throw new Error(`Registry lookup failed: ${result.stderr}`);
 execFileSync('npm',['publish','--access','public'],{stdio:'inherit'});
 console.log(`Published ${name}@${version} from ${revision}`);
}
