import { lstat, mkdir, readFile, writeFile, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
export const hash = value => createHash('sha256').update(value).digest('hex');
export async function exists(file) { try { await lstat(file); return true; } catch(e) { if(e.code==='ENOENT') return false; throw e; } }
// Trust ancestors of the selected root (macOS /var is an alias), but reject
// symlinks at the root and below, including the destination itself.
export async function safePath(root, relative) {
  const target = path.resolve(root, relative);
  const rel = path.relative(path.resolve(root), target);
  if (!rel || rel.startsWith(`..${path.sep}`) || rel === '..' || path.isAbsolute(rel)) throw new Error(`Path escapes installation root: ${relative}`);
  let current = path.resolve(root);
  for (const part of ['', ...rel.split(path.sep)]) {
    current = path.join(current, part);
    try { if ((await lstat(current)).isSymbolicLink()) throw new Error(`Symlink destination refused: ${current}`); }
    catch(e) { if(e.code!=='ENOENT') throw e; }
  }
  return target;
}
export async function commitFiles({root, files, harness, version, beforeWrite = async()=>{}}) {
  const manifestRel = `.goldfish-install/${harness}.json`;
  const journalRel = `.goldfish-install/${harness}.pending`;
  const manifestPath = await safePath(root,manifestRel);
  const journal = await safePath(root,journalRel);
  if (await exists(journal)) throw new Error(`Interrupted installation: inspect recovery journal ${journal}; restore listed backups before retrying.`);
  const previous = await exists(manifestPath) ? JSON.parse(await readFile(manifestPath,'utf8')) : {files:{}};
  if (!previous.files || typeof previous.files!=='object' || Array.isArray(previous.files)) throw new Error('Invalid installation manifest.');
  const entries = [];
  for (const relative of new Set([...Object.keys(previous.files), ...Object.keys(files)])) {
    const target = await safePath(root, relative);
    const old = await exists(target) ? await readFile(target) : null;
    if (old && (!previous.files[relative] || hash(old)!==previous.files[relative])) throw new Error(`Installation conflict: ${target}`);
    const next = Object.hasOwn(files, relative) ? Buffer.from(files[relative]) : null;
    if (!old?.equals(next ?? Buffer.alloc(0)) || (!old && next)) entries.push({relative,target,old,next});
  }
  const manifest = Buffer.from(JSON.stringify({version,harness,files:Object.fromEntries(Object.entries(files).map(([name,body])=>[name,hash(body)]))},null,2)+'\n');
  const oldManifest = await exists(manifestPath) ? await readFile(manifestPath) : null;
  if (!entries.length && oldManifest?.equals(manifest)) return {paths:Object.keys(files).map(f=>path.resolve(root,f))};
  entries.push({relative:manifestRel,target:manifestPath,old:oldManifest,next:manifest});
  await mkdir(path.dirname(journal),{recursive:true});
  // Exclusive journal doubles as a lock. Store backups before changing destinations.
  await writeFile(journal, JSON.stringify(entries.map(e=>({path:e.target,old:e.old?.toString('base64')??null})),null,2),{flag:'wx'});
  const changed=[];
  try {
    for (const [index,entry] of entries.entries()) {
      await beforeWrite(entry.target,index);
      await safePath(root,entry.relative);
      const now=await exists(entry.target)?await readFile(entry.target):null;
      if (now?.toString('base64')!==entry.old?.toString('base64')) throw new Error(`Destination changed during installation: ${entry.target}`);
      changed.push(entry);
      await mkdir(path.dirname(entry.target),{recursive:true});
      if(entry.next) {
        const stage=entry.target+`.goldfish-stage-${process.pid}`;
        try { await writeFile(stage,entry.next,{flag:'wx'}); await rename(stage,entry.target); }
        finally { await rm(stage,{force:true}); }
      } else await rm(entry.target,{force:true});
    }
    await rm(journal);
  } catch(error) {
    const failures=[];
    for(const entry of changed.reverse()) {
      try { await safePath(root,entry.relative); if(entry.old) await writeFile(entry.target,entry.old); else await rm(entry.target,{force:true}); }
      catch { failures.push(entry.target); }
    }
    if(!failures.length) await rm(journal,{force:true});
    throw new Error(`${error.message}${failures.length?`; manual recovery required: ${failures.join(', ')}; backups: ${journal}`:'; installation rolled back'}`);
  }
  return {paths:Object.keys(files).map(f=>path.resolve(root,f))};
}
