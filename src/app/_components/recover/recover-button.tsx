import { Button } from '@abstract-money/ui'
import { useIsMutating } from '@tanstack/react-query'
import { useRecoverAssetViaPolytone } from '~/_hooks/use-recover-asset.tsx'
import { useSkipClient } from '~/_lib/skip-client.tsx'
import { useTransactionStore } from '~/_stores/transaction-store.ts'
import { XION_ASSET_DENOM, XION_CHAIN_ID } from '../../../constants.ts'

export const RecoveryButton: React.FC<{
  hostChainId: string
  hostAssetDenom: string
  amount: string
  symbol?: string
  className?: string
  onSuccess?: () => void
}> = ({ hostChainId, hostAssetDenom, amount, className, symbol, onSuccess }) => {
  const recoverAssetMutation = useRecoverAssetViaPolytone({
    hostChainId,
    controllerChainId: XION_CHAIN_ID,
  })

  const skippy = useSkipClient()

  const addTransaction = useTransactionStore((state) => state.addTransaction)

  const isRecovering = Boolean(
    useIsMutating(['recoverAssetViaPolytone'], {
      exact: false,
      predicate: (mutation) => {
        const { hostAssetDenom: varHostAssetDenom, amount: varDenom } =
          mutation.state.variables || {}

        return varHostAssetDenom === hostAssetDenom && varDenom === amount
      },
    }),
  )

  return (
    <Button
      type="button"
      onClick={() => {
        console.debug('Recovering', hostAssetDenom, amount)
        recoverAssetMutation.mutate(
          {
            hostAssetDenom,
            amount,
          },
          {
            onSettled: (data, e, variables) => {
              console.debug('Recovered', data, e, variables)
            },
            onSuccess: (data, variables) => {
              skippy.trackTransaction({
                txHash: data.transactionHash,
                // the transaction is technically initiated on XION
                chainID: XION_CHAIN_ID,
              })

              console.debug('Recovering', symbol)

              addTransaction({
                txHash: data.transactionHash,
                chainID: XION_CHAIN_ID,
                timestamp: Date.now(),
                sourceAsset: {
                  symbol: symbol ?? 'Unknown',
                  denom: variables.hostAssetDenom,
                  amount: variables.amount,
                  chainId: hostChainId,
                },
                destAsset: {
                  symbol: 'XION',
                  denom: XION_ASSET_DENOM,
                  amount: data.amount,
                  chainId: XION_CHAIN_ID,
                },
              })
              onSuccess?.()
            },
          },
        )
      }}
      disabled={!recoverAssetMutation.enabled || isRecovering}
      className={className}
    >
      {isRecovering ? 'Recovering...' : 'Recover'}
    </Button>
  )
}
