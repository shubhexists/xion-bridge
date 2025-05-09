import { useAbstraxionAccount } from '@burnt-labs/abstraxion'
import { useCallback } from 'react'
import { injected } from 'wagmi'
import { connect, getAccount } from 'wagmi/actions'
import { getPolytoneRecoveryAddress } from '~/_hooks/use-polytone-recovery-address.ts'
import { EVM_CHAINS_BY_ID } from '~/index.tsx'
import {
  AXELAR_RECOVERY_ADDRESS,
  NOBLE_RECOVERY_ADDRESS,
  OSMOSIS_CHAIN_ID,
  XION_CHAIN_ID,
} from '../../constants.ts'
import { config } from '../../wagmi-config.ts'

export const useGetAddress = () => {
  const {
    data: { bech32Address: xionAddress },
    isConnected,
  } = useAbstraxionAccount()

  const getAddressForChain = useCallback(
    async (chainId: string) => {
      if (!isConnected) {
        throw new Error('XION not connected.')
      }
      if (chainId === XION_CHAIN_ID) {
        return xionAddress
      } else if (chainId === OSMOSIS_CHAIN_ID) {
        return await getPolytoneRecoveryAddress({
          sender: xionAddress,
          hostChainId: OSMOSIS_CHAIN_ID,
          controllerChainId: XION_CHAIN_ID,
        })
      } else if (chainId === 'axelar-dojo-1') {
        return AXELAR_RECOVERY_ADDRESS
      } else if (chainId === 'noble-1') {
        return NOBLE_RECOVERY_ADDRESS
      }

      // EVM Chain
      if (!EVM_CHAINS_BY_ID[chainId]) {
        throw new Error(`Chain with ID ${chainId} not found`)
      }
      const evmAccount = getAccount({ ...config, chain: EVM_CHAINS_BY_ID[chainId] })

      if (!evmAccount.isConnected) {
        await connect({ ...config, chain: EVM_CHAINS_BY_ID[chainId] }, { connector: injected() })
      }

      if (!evmAccount.address) {
        throw new Error('No address found')
      }

      return evmAccount.address
    },
    [xionAddress, isConnected],
  )

  return {
    getAddressForChain,
  }
}
