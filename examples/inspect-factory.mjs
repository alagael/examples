import {inspectFactory} from "../src/index.js";
try { console.log(JSON.stringify(await inspectFactory({rpcUrl:process.env.ETHEREUM_RPC_URL}),null,2)); }
catch { console.error("Factory inspection failed. Verify your endpoint, chain, and deployed contracts.");process.exitCode=1; }
