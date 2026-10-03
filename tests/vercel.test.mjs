import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {initialContent} from '../lib/catalog.ts';
import {readLocalContent,writeLocalContent} from '../lib/local-content.ts';

test('local draft and published data persist independently and stale writes cannot overwrite them',()=>{
 const directory=mkdtempSync(join(tmpdir(),'yojeumpick-test-'));
 const original={NODE_ENV:process.env.NODE_ENV,VERCEL:process.env.VERCEL,LOCAL_CONTENT_PATH:process.env.LOCAL_CONTENT_PATH};
 process.env.NODE_ENV='development';delete process.env.VERCEL;process.env.LOCAL_CONTENT_PATH=join(directory,'content.sqlite');
 try {
  const state=readLocalContent(initialContent),draft={...state.draft,heroTitle:'아직 공개하지 않은 초안'};
  const saved={...state,draft,revision:1,updatedAt:new Date().toISOString()};
  assert.equal(writeLocalContent(initialContent,saved,0),true);
  assert.deepEqual(readLocalContent(initialContent),saved);
  assert.equal(readLocalContent(initialContent).published.heroTitle,initialContent.heroTitle);
  assert.equal(writeLocalContent(initialContent,{...state,revision:1},0),false);
  assert.equal(writeLocalContent(initialContent,{...saved,published:draft,publishedRevision:1,revision:2},1),true);
  assert.equal(readLocalContent(initialContent).published.heroTitle,draft.heroTitle);
  process.env.NODE_ENV='production';assert.throws(()=>readLocalContent(initialContent),/development-only/);
  process.env.NODE_ENV='development';process.env.VERCEL='1';assert.throws(()=>readLocalContent(initialContent),/development-only/);
 } finally {
  for(const [key,value] of Object.entries(original)){if(value===undefined)delete process.env[key];else process.env[key]=value;}
  rmSync(directory,{recursive:true,force:true});
 }
});

test('local login requires development, loopback host and no Vercel environment',()=>{
 const config=new URL('../lib/server-config.ts',import.meta.url).href;
 for(const [mode,vercel,allowed] of [['development','',true],['production','',false],['development','1',false]]){
  const script=`import assert from 'node:assert/strict';import {localRequestAllowed} from '${config}';assert.equal(localRequestAllowed('127.0.0.1:5173'),${allowed});assert.equal(localRequestAllowed('localhost:5173'),${allowed});for(const host of [null,'example.com','localhost.evil.test','127.0.0.1.evil.test'])assert.equal(localRequestAllowed(host),false);`;
  const result=spawnSync(process.execPath,['--input-type=module','-e',script],{env:{...process.env,NODE_ENV:mode,VERCEL:vercel},encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
 }
});

import {requestOrigin} from '../lib/request-origin.ts';
test('browser origin and login redirects keep the public host when Next normalizes its internal hostname',()=>{
 assert.equal(requestOrigin(new Request('http://localhost:5173/api/admin/session',{headers:{host:'127.0.0.1:5173'}})),'http://127.0.0.1:5173');
 assert.equal(requestOrigin(new Request('https://internal.example/api/admin/session',{headers:{host:'example.vercel.app','x-forwarded-host':'untrusted.example'}})),'https://example.vercel.app');
});
