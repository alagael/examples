import test from "node:test";
import assert from "node:assert/strict";
import {inspectFactory,IMPLEMENTATION} from "../src/index.js";
function mock(change={}) {return async (_url,init)=>{const {method}=JSON.parse(init.body);const result=method==="eth_chainId"?"0x1":method==="eth_getCode"?"0x6001":"0x"+"0".repeat(24)+IMPLEMENTATION.slice(2);return {ok:true,json:async()=>({result:method in change?change[method]:result})};};}
test("mainnet factory inspection",{timeout:2000},async()=>{const r=await inspectFactory({fetcher:mock()});assert.equal(r.chainId,1);assert.equal(r.bytecodeAudit,false);});
test("reject wrong chain",async()=>assert.rejects(()=>inspectFactory({fetcher:mock({eth_chainId:"0xaa36a7"})}),/mainnet/));
test("reject missing code",async()=>assert.rejects(()=>inspectFactory({fetcher:mock({eth_getCode:"0x"})}),/deployed/));
test("reject malformed implementation",async()=>assert.rejects(()=>inspectFactory({fetcher:mock({eth_call:"0x1234"})}),/Malformed/));
test("reject wrong implementation",async()=>assert.rejects(()=>inspectFactory({fetcher:mock({eth_call:"0x"+"0".repeat(64)})}),/Unexpected/));
test("reject RPC errors",async()=>assert.rejects(()=>inspectFactory({fetcher:async()=>({ok:true,json:async()=>({error:{code:-32000}})})}),/RPC/));
test("reject HTTP errors",async()=>assert.rejects(()=>inspectFactory({fetcher:async()=>({ok:false})}),/HTTP/));
test("reject insecure endpoint",async()=>assert.rejects(()=>inspectFactory({rpcUrl:"http://example.com",fetcher:mock()}),/HTTPS/));
