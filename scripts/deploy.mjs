import {spawnSync} from 'node:child_process';
import {mkdtemp,rm,access} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';

// Publish the reviewed build without checking out another branch or touching
// the working index. The pages commit retains its previous parent; no force push.
const root=process.cwd();await access(resolve('dist/index.html'));await access(resolve('dist/sw.js'));
const temporary=await mkdtemp(join(tmpdir(),'maree-publish-'));
function git(args,env=process.env,input){const result=spawnSync('git',args,{cwd:root,env,encoding:'utf8',input});if(result.status!==0)throw new Error(result.stderr||result.stdout||'Git non disponibile');return result.stdout.trim();}
try{
  const remote=git(['remote','get-url','origin']);if(!/^https:\/\/github\.com\/gabrielecapponi-ux\/archivio-delle-maree(?:\.git)?$/.test(remote))throw new Error('Il repository remoto non è quello previsto per questo gioco.');
  const previous=git(['ls-remote','--heads','origin','refs/heads/gh-pages']).split(/\s/)[0];
  if(previous)git(['fetch','--quiet','origin','gh-pages']);
  const env={...process.env,GIT_DIR:resolve('.git'),GIT_WORK_TREE:resolve('dist'),GIT_INDEX_FILE:join(temporary,'index')};
  git(['read-tree','--empty'],env);git(['add','--all'],env);const tree=git(['write-tree'],env);
  const args=['-c','user.name=Gabriele Capponi','-c','user.email=283669028+gabrielecapponi-ux@users.noreply.github.com','commit-tree',tree];if(previous)args.push('-p',previous);
  const commit=git(args,env,'Pubblica L’Archivio delle Maree per iPhone\n');
  git(['push','origin',`${commit}:refs/heads/gh-pages`]);console.log(`Versione pubblicata sul ramo gh-pages: ${commit}`);
}finally{await rm(temporary,{recursive:true,force:true});}
