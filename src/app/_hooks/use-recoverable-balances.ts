import { useAbstraxionAccount } from '@burnt-labs/abstraxion'
import { useBalances } from 'graz'
import { OSMOSIS_CHAIN_ID, XION_CHAIN_ID } from '../../constants'
import { usePolytoneRecoveryAddress } from './use-polytone-recovery-address'

export const useRecoverableBalances = () => {
  const {
    data: { bech32Address },
  } = useAbstraxionAccount()

  const { data: recoveryAddress } = usePolytoneRecoveryAddress({
    sender: bech32Address,
    hostChainId: OSMOSIS_CHAIN_ID,
    controllerChainId: XION_CHAIN_ID,
  })

  const { data: balances, ...rest } = useBalances({
    bech32Address: recoveryAddress,
    chainId: OSMOSIS_CHAIN_ID,
  })

  return {
    data: balances,
    ...rest,
  }
}
