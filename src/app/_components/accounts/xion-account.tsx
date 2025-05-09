import { Button } from '@abstract-money/ui/components'
import { useAbstraxionAccount, useModal } from '@burnt-labs/abstraxion'
import { XionFlame } from 'assets/xion-flame'
import { CopyIcon, RefreshCw } from 'lucide-react'
import { useXionBalance } from '~/_hooks/use-xion-balance.ts'

import { adjustDecimals, truncateAddress } from '~/_lib/utils.ts'

export const XionAccount: React.FC = () => {
  const {
    data: { bech32Address: xionAddress },
    isConnecting,
  } = useAbstraxionAccount()

  const [, setShowModal] = useModal()

  const {
    data: xionBalanceCoin,
    refetch,
    isLoading: isBalancesLoading,
    isRefetching: isBalancesRefetching,
    fetchStatus,
  } = useXionBalance()

  const shouldSpin = (isBalancesLoading && fetchStatus !== 'idle') || isBalancesRefetching

  const xionBalance = xionBalanceCoin?.amount

  return (
    <div className="flex flex-col gap-4 flex-1">
      <h4 className="text-base leading-none font-semibold px-1 ">2. Connect your XION Account</h4>

      <div className="bg-card w-full p-6 pb-4 flex flex-col gap-4 items-start justify-center rounded-2">
        <div className="flex gap-4 items-center w-full">
          <div className="bg-background h-13 min-w-13 flex items-center justify-center rounded-2">
            <XionFlame />
          </div>

          <div className="flex flex-col items-start gap-2 w-full">
            {xionAddress ? (
              <div className="flex items-center gap-3 w-full">
                <button
                  className="text-base leading-none text-[#9B9B9B]"
                  onClick={() => {
                    setShowModal(true)
                  }}
                  type="button"
                >
                  {truncateAddress(xionAddress)}
                </button>

                <button
                  type="button"
                  className="flex flex-row gap-2 items-center cursor-pointer bg-transparent border-none"
                  onClick={() => {
                    navigator.clipboard.writeText(xionAddress)
                  }}
                >
                  <CopyIcon className="w-3.5 h-3.5 stroke-[#9B9B9B] hover:stroke-white transition-all duration-300" />
                </button>
              </div>
            ) : (
              <Button
                className="w-full cursor-pointer"
                onClick={() => {
                  console.debug('clicked XION')
                  setShowModal(true)
                }}
              >
                {isConnecting ? 'Connecting...' : 'Connect XION'}
              </Button>
            )}
            {xionAddress && (
              <div className="flex flex-row items-center gap-2 text-[24px] leading-none font-bold">
                <div className="text-3xl leading-none">
                  {xionBalance ? adjustDecimals(xionBalance, 6, 2) : 0} XION
                </div>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="p-1 hover:bg-background rounded-full transition-colors"
                  title="Refresh balance"
                  disabled={shouldSpin}
                >
                  <RefreshCw
                    className={`w-4 h-4 text-[#9B9B9B] hover:text-white ${
                      shouldSpin ? 'animate-spin' : ''
                    }`}
                  />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 pl-1">
          <h6 className="text-sm leading-tight font-medium text-[#9B9B9B]">Networks</h6>

          <div className="flex gap-2 items-center">
            <XionFlame className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  )
}
