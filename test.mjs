import test from 'node:test';import assert from 'node:assert/strict';import {createServer} from './index.mjs';import {sample} from '../ledgerclock-fixtures/index.mjs';
async function server(fn){const s=createServer();await new Promise(r=>s.listen(0,'127.0.0.1',r));try{await fn(`http://127.0.0.1:${s.address().port}`)}finally{s.closeAllConnections();await new Promise(r=>s.close(r))}}
test('HTTP import review and readback',()=>server(async url=>{const r=await fetch(url+'/review',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(sample)});assert.equal(r.status,201);const report=await r.json();assert.equal(report.valid,true);assert.deepEqual(await(await fetch(url+'/runs/'+report.id)).json(),report)}));
test('untrusted web origins rejected',()=>server(async url=>assert.equal((await fetch(url+'/sample',{headers:{origin:'https://evil.example'}})).status,403)));
test('invalid corpus returns 400',()=>server(async url=>assert.equal((await fetch(url+'/review',{method:'POST',headers:{'content-type':'application/json'},body:'{}'})).status,400)));
test('missing report returns 404',()=>server(async url=>assert.equal((await fetch(url+'/runs/missing')).status,404)));
