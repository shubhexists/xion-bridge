import { SkipClient, TxStatusResponse } from '@skip-go/client'
import { UseQueryOptions, useQuery } from '@tanstack/react-query'
import { useSkipClient } from 'app/_lib/skip-client'

export const getTransactionStatusOptions = (
  skippy: SkipClient,
  txHash?: string,
  chainID?: string,
): UseQueryOptions<TxStatusResponse, Error, TxStatusResponse> => ({
  queryKey: ['transaction-status', chainID, txHash] as const,
  queryFn: async () => {
    if (!txHash || !chainID) throw new Error('Missing txHash or chainID')
    return await skippy.transactionStatus({
      txHash: txHash,
      chainID: chainID,
    })
  },
  enabled: !!txHash && !!chainID,
  refetchInterval: (data: TxStatusResponse | undefined) => {
    if (!data) return 5000
    // Refetch every 5 seconds if transaction is pending
    return ['STATE_UNKNOWN', 'STATE_SUBMITTED', 'STATE_PENDING', 'STATE_RECEIVED'].includes(
      data?.state,
    )
      ? 5000
      : false
  },
})

export const useTransactionStatus = (txHash?: string, chainID?: string) => {
  const skippy = useSkipClient()
  return useQuery(getTransactionStatusOptions(skippy, txHash, chainID))
}
