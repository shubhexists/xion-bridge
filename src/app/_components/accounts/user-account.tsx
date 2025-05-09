import { Button, Tooltip, TooltipContent, TooltipTrigger } from '@abstract-money/ui/components'
import { ConnectButton, useConnectModal } from '@rainbow-me/rainbowkit'
import { ArbMainnetIcon } from 'assets/arb-mainnet-icon'
import { AvaxMainnetIcon } from 'assets/avax-mainnet-icon'
import BaseMainnetIcon from 'assets/base-mainnet-icon'
import { EthMainnetIcon } from 'assets/eth-mainnet-icon'
import { MaticMainnetIcon } from 'assets/matic-mainnet-icon'
import { WalletIcon } from 'assets/wallet-icon'
import { WalletSwapIcon } from 'assets/wallet-swap-icon'
import { CopyIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useDisconnect } from 'wagmi'
import OpMainnetIcon from '../../../assets/op-mainnet-icon.tsx'

export const UserAccount: React.FC<{ connectedWalletNetWorth: number }> = ({
  connectedWalletNetWorth,
}) => {
  const [hasClickedSwitch, setHasClickedSwitch] = useState(false)
  const { disconnect } = useDisconnect()
  const { openConnectModal } = useConnectModal()

  useEffect(() => {
    if (openConnectModal && hasClickedSwitch) {
      openConnectModal()
    }
  }, [openConnectModal, hasClickedSwitch])

  return (
    <div className="flex flex-col gap-4 flex-1">
      <h4 className="text-base leading-none font-semibold px-1 ">1. Connect your EVM wallet</h4>

      <div className="bg-card w-full p-6 pb-4 flex flex-col gap-4 items-start justify-center rounded-2">
        <div className="flex gap-4 items-center w-full">
          <div className="bg-background h-13 min-w-13 flex items-center justify-center rounded-2">
            <WalletIcon fill="#5E616E" />
          </div>
          <ConnectButton.Custom>
            {({ account, mounted }) => {
              const connected = account && mounted

              const displayName = account?.displayName

              if (!connected) {
                return (
                  <Button
                    variant="default"
                    size="default"
                    className="w-full flex"
                    onClick={openConnectModal}
                  >
                    Connect EVM Wallet
                  </Button>
                )
              }

              return (
                <div className="w-full flex items-center justify-between gap-2">
                  <div className="flex flex-col items-start gap-2">
                    <div className="flex items-center gap-2">
                      <p className="text-base leading-none text-[#9B9B9B]">
                        {displayName ??
                          `${account.address.slice(0, 5)}...${account.address.slice(-5)}`}
                      </p>
                      <button
                        type="button"
                        className="flex flex-row gap-2 items-center cursor-pointer bg-transparent border-none"
                        onClick={() => {
                          navigator.clipboard.writeText(account.address)
                        }}
                      >
                        <CopyIcon className="w-3.5 h-3.5 stroke-[#9B9B9B] hover:stroke-white transition-all duration-300" />
                      </button>
                    </div>
                    <h3 className="text-3xl leading-none font-bold">
                      $
                      {connectedWalletNetWorth.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger
                        className="inline-flex gap-2 items-center text-sm font-semibold bg-[#222222] rounded-1 p-2.5"
                        onClick={() => {
                          setHasClickedSwitch(true)
                          disconnect()
                        }}
                      >
                        <WalletSwapIcon className="w-6 h-6 fill-[#9B9B9B]" />
                      </TooltipTrigger>
                      <TooltipContent className="border-0 shadow-lg shadow-black border border-[#2A2B32] rounded-1 text-xs">
                        Switch Wallets
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              )
            }}
          </ConnectButton.Custom>
        </div>

        <div className="flex flex-col gap-2 pl-1">
          <h6 className="text-sm leading-tight font-medium text-[#9B9B9B]">Networks</h6>

          <div className="flex gap-2 items-center">
            <EthMainnetIcon className="w-5 h-5" />
            <MaticMainnetIcon className="w-5 h-5" />
            <ArbMainnetIcon className="w-5 h-5" />
            <OpMainnetIcon className="w-5 h-5" />
            <BaseMainnetIcon className="w-5 h-5" />
            <AvaxMainnetIcon className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  )
}
