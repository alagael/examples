export const FACTORY: string;
export const IMPLEMENTATION: string;
export function inspectFactory(options?: {rpcUrl?: string; fetcher?: typeof fetch}): Promise<{chainId: 1; factory: string; implementation: string; codePresent: true; bytecodeAudit: false}>;
