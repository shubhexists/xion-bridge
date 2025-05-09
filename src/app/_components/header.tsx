import { useAbstraxionSigningClient } from '@burnt-labs/abstraxion'
import { AbstractLogoSm } from 'assets/abstract-logo-sm'
import { AbstractLogoText } from 'assets/abstract-logo-text'
import { PowerIcon } from 'lucide-react'
import { useAccount, useDisconnect } from 'wagmi'

export const Header: React.FC = () => {
  const { disconnect } = useDisconnect()
  const { isConnected } = useAccount()
  const { logout } = useAbstraxionSigningClient()

  return (
    <div className="flex w-full py-5">
      <a href="/" className="flex items-center gap-2">
        <AbstractLogoSm />
        <AbstractLogoText />
      </a>

      <div className="flex items-center gap-2 ml-auto">
        {isConnected && (
          <button
            type="button"
            onClick={() => {
              disconnect()
              logout?.()
            }}
          >
            <PowerIcon size={20} />
          </button>
        )}
      </div>
    </div>
  )
}
