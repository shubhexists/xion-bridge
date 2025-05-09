import { EVM_CHAINS_BY_ID } from '..'

export const chainIdToName = (chainId: string) => {
  if (chainId.includes('xion')) {
    return 'Xion'
  }
  return EVM_CHAINS_BY_ID[chainId]?.name || chainId
}
