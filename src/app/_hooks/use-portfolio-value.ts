import { useTokens } from 'app/_hooks/use-tokens'
import { useMemo } from 'react'
import { useAccount } from 'wagmi'

interface PortfolioData {
  totalValue: number
  isLoading: boolean
}

export function usePortfolioValue(): PortfolioData {
  const { address } = useAccount()

  const { tokensWithPricesOnly, isLoading } = useTokens(address as `0x${string}`)

  const totalPortfolioValue = useMemo(() => {
    return tokensWithPricesOnly.reduce((sum, item) => {
      const balance = item.balance ?? 0
      const price = item.price ?? 0
      const total = Number(price) * Number(balance)
      return sum + total
    }, 0)
  }, [tokensWithPricesOnly])

  return {
    totalValue: totalPortfolioValue,
    isLoading,
  }
}
