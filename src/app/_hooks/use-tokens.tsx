import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { Network, OwnedToken } from 'alchemy-sdk'
import { alchemy } from 'app'
import { useMemo } from 'react'
import { useDeepCompareMemo } from 'use-deep-compare'
import { Hex } from 'viem'
import { wagmiConfig } from 'wagmi-config'
import { getBalance } from 'wagmi/actions'
import { debounce } from '~/_lib/debounce.ts'
import { ChainConfig, chainConfigs } from '../_lib/chains-config.ts'

export interface TokenWithPrice extends OwnedToken {
  price?: string
  chainId: number
  chainName: string
  contractAddress: string
  rawBalance?: string
  balance?: string
  name?: string
  symbol?: string
  decimals?: number
  logo?: string
  error?: string
  hasRoute?: boolean
}

async function getNativeBalance(
  address: string,
  chainConfig: ChainConfig,
): Promise<TokenWithPrice | null> {
  const config = chainConfig.mainnet
  const balance = await getBalance(wagmiConfig, {
    address: address as `0x${string}`,
    chainId: config.chain.id as (typeof wagmiConfig)['chains'][number]['id'],
  })

  if (balance.value === BigInt(0)) return null

  return {
    balance: `${Number(balance.value) / 10 ** balance.decimals}`,
    contractAddress: config.nativeToken.contractAddress,
    decimals: balance.decimals,
    logo: undefined,
    name: config.nativeToken.name,
    rawBalance: balance.value.toString(),
    symbol: balance.symbol,
    chainId: config.chain.id,
    chainName: config.chain.name,
  }
}

async function getTokenBalances(
  address: string,
  chainConfig: ChainConfig,
): Promise<TokenWithPrice[]> {
  const config = chainConfig.mainnet
  const tokens = await alchemy.forNetwork(config.network).core.getTokensForOwner(address)

  return tokens.tokens
    .filter((token) => token.balance !== '0' && token.balance !== '0.0')
    .map((token) => ({
      ...token,
      chainId: config.chain.id,
      chainName: config.chain.name,
    }))
}

async function getChainBalances(
  address: string,
  chainConfig: ChainConfig,
): Promise<TokenWithPrice[]> {
  const [tokenBalances, nativeBalance] = await Promise.all([
    getTokenBalances(address, chainConfig),
    getNativeBalance(address, chainConfig),
  ])

  return nativeBalance ? [...tokenBalances, nativeBalance] : tokenBalances
}

async function getTokenPrices(symbols: string[]): Promise<Record<string, string>> {
  if (!symbols.length) return {}

  const batchSize = 25
  const batches = []
  for (let i = 0; i < symbols.length; i += batchSize) {
    batches.push(symbols.slice(i, i + batchSize))
  }

  const prices = await Promise.all(
    batches.map((batch) =>
      alchemy.forNetwork(Network.ETH_MAINNET).prices.getTokenPriceBySymbol(batch),
    ),
  )

  return prices
    .flatMap(({ data }) => data)
    .reduce(
      (acc, symbolPrice) => {
        if (symbolPrice.prices.length > 0) {
          acc[symbolPrice.symbol] = symbolPrice.prices[0].value
        }
        return acc
      },
      {} as Record<string, string>,
    )
}

export function useTokens(address: string | undefined) {
  const enabled = Boolean(address)
  const queryClient = useQueryClient()
  // Query balances for each chain in parallel
  const chainQueries = useQueries({
    queries: Object.entries(chainConfigs).map(([_alchemyChainId, config]) => ({
      queryKey: ['chainBalances', config.mainnet.chain.id, address],
      queryFn: (): Promise<TokenWithPrice[]> => {
        if (!address) throw new Error('No address!')
        return getChainBalances(address, config)
      },
      staleTime: 30 * 1000, // 30 seconds
      enabled,
    })),
  })

  // Combine all token balances
  const allTokens = useDeepCompareMemo(() => {
    return chainQueries.filter((query) => query.data).flatMap((query) => query.data ?? [])
  }, [chainQueries])

  // Get unique symbols for price fetching
  const uniqueSymbols = useMemo(() => {
    return [
      ...new Set(
        allTokens
          .map((token) => token.symbol)
          .filter(Boolean)
          .filter((sym) => !sym?.includes(' ')) as string[],
      ),
    ]
  }, [allTokens])

  // Query prices for all tokens
  const { data: prices = {}, isLoading: isPricesLoading } = useQuery({
    queryKey: ['tokenPrices', uniqueSymbols],
    queryFn: () => getTokenPrices(uniqueSymbols),
    staleTime: 60 * 1000, // 1 minute
  })

  // Combine tokens with their prices and sort
  // biome-ignore lint/correctness/useExhaustiveDependencies: checked
  const processedTokens = useMemo(() => {
    const tokensWithPrices = allTokens.map((token) => ({
      ...token,
      price: token.symbol ? prices[token.symbol] : undefined,
    }))

    return tokensWithPrices.sort((a, b) => {
      const aValue = Number(a.balance) * (Number(a.price) ?? 0)
      const bValue = Number(b.balance) * (Number(b.price) ?? 0)
      return bValue - aValue
    })
  }, [allTokens, prices])

  // Filter tokens that have prices
  const tokensWithPricesOnly = useMemo(() => {
    return processedTokens
      .filter((token) => token.price !== undefined)
      .sort((a, b) => {
        const aValue = Number(a.balance) * (Number(a.price) ?? 0)
        const bValue = Number(b.balance) * (Number(b.price) ?? 0)
        return bValue - aValue
      })
  }, [processedTokens])

  const isLoading = enabled && (chainQueries.some((query) => query.isLoading) || isPricesLoading)
  const isRefetching = enabled && chainQueries.some((query) => query.isRefetching)

  const errors = chainQueries.map((query) => query.error).filter(Boolean)

  return {
    // Raw data
    chainQueries,
    prices,

    // Processed data
    tokens: processedTokens,
    tokensWithPricesOnly,

    // Status
    isLoading,
    isRefetching,
    errors,

    // Refresh functions
    refresh: {
      all: debounce(
        () => {
          for (const query of chainQueries) {
            query.refetch()
          }
        },
        5000,
        { leading: true, trailing: false },
      ),
      prices: debounce(() => {
        queryClient.invalidateQueries({ queryKey: ['tokenPrices'] })
      }, 5000),
      chain: (chainId: number, address: Hex | undefined) => {
        queryClient.invalidateQueries({ queryKey: ['chainBalances', chainId, address] })
      },
    },
  }
}
