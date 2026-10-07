export const FACTORY="0xe1906bBFf0c6AE8139b84c713CA60306596FD80f";
export const IMPLEMENTATION="0xe821e8E3DE2bA2691437bE5EB69AF0Cd14f3afB9";
const addressPattern=/^0x[0-9a-fA-F]{40}$/;
export async function inspectFactory({rpcUrl="https://ethereum-rpc.publicnode.com",fetcher=globalThis.fetch}={}) {
  const url=new URL(rpcUrl);
  if(url.protocol!=="https:" && !(url.protocol==="http:" && ["localhost","127.0.0.1","[::1]"].includes(url.hostname))) throw Error("Use HTTPS or a loopback endpoint.");
  async function rpc(method,params) {
    const response=await fetcher(rpcUrl,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:1,method,params}),signal:AbortSignal.timeout(10000)});
    if(!response.ok) throw Error("RPC HTTP request failed.");
    const data=await response.json();
    if(data.error || !Object.hasOwn(data,"result")) throw Error("RPC response failed.");
    return data.result;
  }
  if(await rpc("eth_chainId",[])!=="0x1") throw Error("Ethereum mainnet required.");
  for(const address of [FACTORY,IMPLEMENTATION]) {
    const code=await rpc("eth_getCode",[address,"latest"]);
    if(typeof code!=="string" || !/^0x(?:[0-9a-fA-F]{2})+$/.test(code)) throw Error("Expected deployed contract code.");
  }
  const encoded=await rpc("eth_call",[{to:FACTORY,data:"0x5c60da1b"},"latest"]);
  if(typeof encoded!=="string" || !/^0x0{24}[0-9a-fA-F]{40}$/.test(encoded)) throw Error("Malformed implementation response.");
  const implementation="0x"+encoded.slice(-40);
  if(!addressPattern.test(implementation) || implementation.toLowerCase()!==IMPLEMENTATION.toLowerCase()) throw Error("Unexpected implementation.");
  return {chainId:1,factory:FACTORY,implementation:IMPLEMENTATION,codePresent:true,bytecodeAudit:false};
}
