import { Button, Tooltip, TooltipArrow, TooltipContent, TooltipTrigger } from '@abstract-money/ui'
import { StatusState, TxStatusResponse } from '@skip-go/client'
import { useQueries, useQueryClient } from '@tanstack/react-query'
import { TokenMetadataResponse } from 'alchemy-sdk'
import GenericLogo from 'cryptocurrency-icons/svg/color/generic.svg'
import { Info } from 'lucide-react'
import { useCallback } from 'react'
import { AssetLogo, assetLogoBySymbol } from '~/_components/asset-logo.tsx'
import RecoveryDialog, { useRecoveryDialogStore } from '~/_components/recover/recover-dialog.tsx'
import { chainIdToName } from '~/_lib/chain-id-to-name.ts'
import { adjustDecimals } from '~/_lib/utils.ts'
import { OSMOSIS_ASSETS } from '../../constants.ts'
import { getTokenMetadataOptions, tokenMetadataKeys } from '../_hooks/use-token-metadata'
import { getTransactionStatusOptions } from '../_hooks/use-transaction-status'
import { useSkipClient } from '../_lib/skip-client.tsx'
import { StoredTransaction, useTransactionStore } from '../_stores/transaction-store'

const getDotStyle = (state: StatusState, isActive: boolean) => {
  if (!isActive) return 'bg-gray-200'

  switch (state) {
    case 'STATE_COMPLETED_SUCCESS':
      return 'bg-green-500'
    case 'STATE_COMPLETED_ERROR':
    case 'STATE_PENDING_ERROR':
    case 'STATE_ABANDONED':
      return 'bg-red-500'
    case 'STATE_PENDING':
    case 'STATE_SUBMITTED':
    case 'STATE_RECEIVED':
      return 'bg-blue-500 animate-pulse'
    default:
      return 'bg-gray-300'
  }
}

const SKIP_ERROR_STATES = ['STATE_COMPLETED_ERROR', 'STATE_PENDING_ERROR']
const SKIP_PENDING_STATES = ['STATE_PENDING', 'STATE_SUBMITTED', 'STATE_RECEIVED']

export const TransactionStatus = () => {
  const transactions = useTransactionStore((state) => state.transactions)
  const updateTransactionStatus = useTransactionStore((state) => state.updateTransactionStatus)
  const removeTransaction = useTransactionStore((state) => state.removeTransaction)
  const skippy = useSkipClient()
  const queryClient = useQueryClient()
  const { setIsOpen } = useRecoveryDialogStore()

  // Query metadata for all tokens in transactions
  useQueries({
    queries: transactions.flatMap((tx) => [
      {
        ...getTokenMetadataOptions(Number(tx.sourceAsset.chainId), tx.sourceAsset.denom),
        enabled: !!tx.sourceAsset.denom,
      },
    ]),
  })

  // Query status for each transaction
  useQueries({
    queries: transactions.map((tx) => ({
      ...getTransactionStatusOptions(skippy, tx.txHash, tx.chainID),
      onSuccess: (data: TxStatusResponse) => {
        updateTransactionStatus(tx.txHash, data)
      },
    })),
  })

  const getTokenMetadata = useCallback(
    (chainId: string, denom: string) => {
      if (Number.isNaN(Number.parseInt(chainId))) {
        return null
      }
      const queryKey = tokenMetadataKeys.metadata(Number(chainId), denom)
      const metadata = queryClient.getQueryData<TokenMetadataResponse>(queryKey)
      return metadata ?? null
    },
    [queryClient],
  )

  const getTokenDecimals = useCallback(
    (chainId: string, denom: string) => {
      if (denom.startsWith('0x')) {
        return getTokenMetadata(chainId, denom)?.decimals ?? 18
      } else if (denom.includes('native')) {
        return 18
      } else if (denom.includes('ibc')) {
        if (denom === OSMOSIS_ASSETS.AXELAR_ETH) {
          return 18
        }
        return 6
      } else if (denom.startsWith('u')) {
        return 6
      }
      return 18
    },
    [getTokenMetadata],
  )

  const tokenLogo = (asset: StoredTransaction['sourceAsset']) => {
    if (!Number.isNaN(Number.parseInt(asset.chainId))) {
      return (
        <AssetLogo chainId={Number(asset.chainId)} symbol={asset.symbol} address={asset.denom} />
      )
    }

    return asset.symbol ? (
      assetLogoBySymbol(asset.symbol)
    ) : (
      <img src={GenericLogo} alt={asset.symbol} className="w-8 h-8 rounded-full" />
    )
  }

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2">
      <RecoveryDialog />
      {transactions.map(({ txHash, sourceAsset, destAsset, explorerLink, status, chainID }) => (
        <div key={txHash} className="bg-card p-4 rounded-lg shadow-lg min-w-[300px]">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <div className="relative">
                        {tokenLogo(sourceAsset)}
                        {/* Chain logo  */}
                        {/* <img
                          src={`/chains/${sourceAsset.chainId}.png`}
                          alt={sourceAsset.chainId}
                          className="w-1.5 h-1.5 rounded-full absolute -bottom-0.5 -left-0.5 border border-card"
                        /> */}
                      </div>
                      <div className="relative -ml-2">
                        {tokenLogo(destAsset)}
                        {/* Chain logo */}
                        {/* <img
                          src={`/chains/${destAsset.chainId}.png`}
                          alt={destAsset.chainId}
                          className="w-1.5 h-1.5 rounded-full absolute -bottom-0.5 -left-0.5 border border-card"
                        /> */}
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <div className="text-sm text-gray-600">
                        {chainIdToName(sourceAsset.chainId)} → {chainIdToName(destAsset.chainId)}
                      </div>
                      <div className="font-medium">
                        {`${adjustDecimals(
                          sourceAsset.amount,
                          getTokenDecimals(sourceAsset.chainId, sourceAsset.denom),
                        )} ${sourceAsset.symbol} → ${adjustDecimals(destAsset.amount, 6)} ${
                          destAsset.symbol
                        }`}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeTransaction(txHash)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                    title="Remove"
                  >
                    <svg
                      role="img"
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-label={'remove'}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-2 justify-between">
                  <div className="flex items-center gap-2">
                    {(!status?.state || SKIP_PENDING_STATES.includes(status.state)) && (
                      <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    )}
                    <p className="text-sm text-gray-500">
                      {status?.state?.replace('STATE_', '') || 'Pending'}
                    </p>
                    {status?.state &&
                      SKIP_PENDING_STATES.includes(status.state) &&
                      sourceAsset.chainId === '1' && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info size={16} className="text-gray-500 cursor-pointer" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <TooltipArrow />
                            Transfers from Ethereum may take up to 30 mins
                          </TooltipContent>
                        </Tooltip>
                      )}
                    {(!status?.state || status.state === 'STATE_PENDING') && (
                      <button
                        type={'button'}
                        onClick={() => {
                          console.debug('refresh', txHash)
                          queryClient.invalidateQueries({
                            queryKey: ['transaction-status', chainID, txHash],
                          })
                        }}
                        className="text-blue-500 hover:text-blue-600 p-1"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          role="img"
                          aria-label={'cancel'}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                      </button>
                    )}
                  </div>

                  {explorerLink && (
                    <a
                      href={explorerLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline text-sm"
                    >
                      View
                    </a>
                  )}
                </div>
                {status?.state && SKIP_ERROR_STATES.includes(status.state) && (
                  <Button
                    onClick={() => setIsOpen(true)}
                    size={'xs'}
                    className={'bg-amber hover:bg-amber/90'}
                  >
                    Recovery
                  </Button>
                )}
              </div>
            </div>

            {/* Transfer Progress Indicators */}
            {status?.transfers && status.transfers.length > 0 && (
              <div className="flex items-center gap-2 mt-1">
                {status.transfers.map((transfer, index) => (
                  <div
                    key={`t-${
                      // biome-ignore lint/suspicious/noArrayIndexKey: TODO
                      index
                    }`}
                    className="flex-1 flex items-center"
                  >
                    <div className="flex-1 h-1 relative">
                      <div className="absolute inset-0 bg-gray-200 rounded" />
                      <div
                        className={`absolute inset-0 rounded transition-all duration-300 ${getDotStyle(
                          transfer.state,
                          true,
                        )}`}
                        style={{
                          width: transfer.state.includes('COMPLETED')
                            ? '100%'
                            : transfer.state.includes('PENDING')
                              ? '50%'
                              : '0%',
                        }}
                      />
                    </div>
                    <div
                      className={`h-3 w-3 rounded-full ml-1 ${getDotStyle(transfer.state, true)}`}
                      title={transfer.state.replace('STATE_', '')}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
