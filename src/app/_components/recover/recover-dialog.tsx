import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipTrigger,
} from '@abstract-money/ui'
import { useAbstraxionAccount } from '@burnt-labs/abstraxion'
import EthereumLogo from 'cryptocurrency-icons/svg/color/eth.svg'
import GenericLogo from 'cryptocurrency-icons/svg/color/generic.svg'
import UsdcLogo from 'cryptocurrency-icons/svg/color/usdc.svg'
import { CopyIcon, RefreshCw } from 'lucide-react'
import React from 'react'
import { useAccount } from 'wagmi'
import { create } from 'zustand'
import { cn, truncateAddress } from '~/_lib/utils.ts'
import {
  OSMOSIS_ASSETS,
  OSMOSIS_AXELAR_ETH_USDC,
  OSMOSIS_CHAIN_ID,
  OSMOSIS_NOBLE_USDC,
  XION_CHAIN_ID,
} from '../../../constants.ts'
import { usePolytoneRecoveryAddress } from '../../_hooks/use-polytone-recovery-address.ts'
import { useRecoverableBalances } from '../../_hooks/use-recoverable-balances.ts'
import { RecoveryButton } from './recover-button.tsx'

interface DialogState {
  isRecoveryDialogOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export const useRecoveryDialogStore = create<DialogState>((set) => ({
  isRecoveryDialogOpen: false,
  setIsOpen: (isOpen) => set({ isRecoveryDialogOpen: isOpen }),
}))

const AddressSection: React.FC<{
  title: string
  address: string | undefined
  description?: string
  explorerUrl?: string
}> = ({ title, address, description, explorerUrl }) => {
  if (!address) return null

  return (
    <div className="p-4 rounded-lg bg-card border border-[#303030]">
      <div className="font-semibold mb-2">{title}</div>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="text-sm text-gray-400 flex items-center gap-2">
            {explorerUrl ? (
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {truncateAddress(address)}
              </a>
            ) : (
              <span>{truncateAddress(address)}</span>
            )}
            <button
              type="button"
              className="flex flex-row gap-2 items-center cursor-pointer bg-transparent border-none"
              onClick={() => {
                navigator.clipboard.writeText(address)
              }}
            >
              <CopyIcon className="w-3.5 h-3.5 stroke-[#9B9B9B] hover:stroke-white transition-all duration-300" />
            </button>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {address}
          <TooltipArrow />
        </TooltipContent>
      </Tooltip>
      {description && <div className="mt-2 text-sm text-gray-400">{description}</div>}
    </div>
  )
}

const RecoveryDialog: React.FC = () => {
  const { isRecoveryDialogOpen, setIsOpen } = useRecoveryDialogStore()
  const {
    data: { bech32Address },
  } = useAbstraxionAccount()
  const { address: evmAddress } = useAccount()

  const { data: osmosisRecoveryAddress } = usePolytoneRecoveryAddress({
    sender: bech32Address,
    hostChainId: OSMOSIS_CHAIN_ID,
    controllerChainId: XION_CHAIN_ID,
  })

  const {
    data: balances,
    isLoading,
    isRefetching: isRefetchingBalances,
    refetch: refetchBalances,
  } = useRecoverableBalances()

  const getAssetDetails = (denom: string) => {
    switch (denom) {
      case OSMOSIS_AXELAR_ETH_USDC:
        return {
          name: 'Axelar USDC.eth',
          symbol: 'USDC.axl.eth',
          icon: UsdcLogo,
        }
      case OSMOSIS_NOBLE_USDC:
        return {
          name: 'Noble USDC',
          symbol: 'USDC.noble',
          icon: UsdcLogo,
        }
      case OSMOSIS_ASSETS.AXELAR_ETH:
        return {
          name: 'Axelar ETH',
          symbol: 'ETH.axl',
          icon: EthereumLogo,
          decimals: 18,
        }
      case 'uosmo':
        return {
          name: 'Osmosis',
          symbol: 'OSMO',
          icon: 'assets/osmosis.svg',
        }
      default:
        return {
          name: 'Unknown',
          symbol: 'UNKNOWN',
          icon: GenericLogo,
        }
    }
  }

  const formattedBalances = balances?.map((balance) => {
    const { ...details } = getAssetDetails(balance.denom)
    return {
      ...balance,
      ...details,
    }
  })

  if (isLoading) {
    return <></>
  }

  return (
    <Dialog open={isRecoveryDialogOpen} onOpenChange={setIsOpen}>
      <DialogContent className="text-white p-8 sm:rounded-3xl border border-[#303030] shadow-lg max-w-lg w-full transform transition-all duration-300 ease-in-out">
        <DialogHeader>
          <div className="flex justify-between items-center mb-3">
            <DialogTitle className="text-xl font-bold">Asset Recovery</DialogTitle>
            <button
              type="button"
              onClick={() => refetchBalances()}
              disabled={isLoading || isRefetchingBalances}
              className={cn(
                'p-2 text-primary hover:bg-primary/20 rounded-full transition-all duration-100',
                isLoading || (isRefetchingBalances && 'animate-spin'),
              )}
              title="Refresh balances"
            >
              <RefreshCw
                size={20}
                className={isLoading || isRefetchingBalances ? 'animate-spin' : ''}
              />
            </button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6">
          {/* Recoverable Assets Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Recoverable Assets</h3>
            {formattedBalances && formattedBalances.length > 0 ? (
              formattedBalances.map((asset) => (
                <div
                  key={asset.denom}
                  className="flex items-center p-4 rounded-lg bg-card shadow-md hover:shadow-lg transition-shadow duration-200"
                >
                  <img src={asset.icon} alt={asset.name} className="w-10 h-10 mr-4 rounded-full" />
                  <div className="flex-1">
                    <div className="text-md font-semibold">{asset.name}</div>
                    <div className="text-sm text-gray-400">
                      <span
                        className="cursor-pointer hover:underline"
                        onClick={() => navigator.clipboard.writeText(asset.denom)}
                        onKeyUp={(e) =>
                          e.key === 'Enter' && navigator.clipboard.writeText(asset.denom)
                        }
                        title="Click to copy full denomination"
                        tabIndex={0}
                        role="button"
                      >
                        {truncateAddress(asset.denom)}
                      </span>
                    </div>
                    <div className="text-sm mt-1">
                      <strong>Amount:</strong> {Number(asset.amount) / 10 ** (asset.decimals || 6)}
                    </div>
                  </div>
                  <div className="ml-auto">
                    <RecoveryButton
                      hostChainId={OSMOSIS_CHAIN_ID}
                      hostAssetDenom={asset.denom}
                      symbol={asset.symbol}
                      amount={asset.amount}
                      className="ml-3"
                      onSuccess={() => {
                        refetchBalances()
                        setIsOpen(false)
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="flex justify-center items-center h-16 sm:rounded-3xl border border-[#303030]">
                <span className="text-gray-500">No assets to recover</span>
              </div>
            )}
          </div>

          {/* Recovery Addresses Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Addresses</h3>

            <AddressSection
              title="Osmosis"
              address={osmosisRecoveryAddress}
              explorerUrl={`https://celatone.osmosis.zone/osmosis-1/contracts/${osmosisRecoveryAddress}`}
              description="Failed swaps on Osmosis can be recovered above."
            />
            <AddressSection
              title="EVM (all chains)"
              address={evmAddress}
              description="Failed EVM transfers will automatically send assets back to your wallet."
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default RecoveryDialog
