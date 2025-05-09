import { useQuery } from '@tanstack/react-query'
import { TokenMetadataResponse } from 'alchemy-sdk'
import { EVM_CHAINS_BY_ID, alchemy } from '..'

// Query key factory for consistent keys
export const tokenMetadataKeys = {
  all: ['token-metadata'] as const,
  metadata: (chainId: number, address: string) =>
    [...tokenMetadataKeys.all, chainId, address] as const,
}

// Options for fetching token metadata
export const getTokenMetadataOptions = (chainId: number, address: string) => ({
  queryKey: tokenMetadataKeys.metadata(chainId, address),
  queryFn: async (): Promise<TokenMetadataResponse> => {
    const chain = EVM_CHAINS_BY_ID[chainId]
    if (!chain) {
      throw new Error(`Unsupported chain ID ${chainId}`)
    }
    if (!address.startsWith('0x')) {
      return {
        name: null,
        symbol: null,
        decimals: null,
        logo: null,
      }
    }
    return alchemy.forNetwork(chain.alchemyNetwork).core.getTokenMetadata(address)
  },
  // Cache the data for 5 minutes
  staleTime: 100 * 60 * 1000,
  cacheTime: 10 * 60 * 1000,
  // Don't refetch on window focus for token metadata as it rarely changes
  refetchOnWindowFocus: false,
  enabled: !!address && address.startsWith('0x'),
})

// Hook to fetch token metadata
export const useTokenMetadata = (chainId: number, address: string) => {
  return useQuery(getTokenMetadataOptions(chainId, address))
}
