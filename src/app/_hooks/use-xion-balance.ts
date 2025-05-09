import { useAbstraxionAccount } from '@burnt-labs/abstraxion'
import { useBalance } from 'graz'
import { XION_ASSET_DENOM, XION_CHAIN_ID } from '../../constants.ts'

export const useXionBalance = () => {
  const {
    data: { bech32Address },
    isConnected,
  } = useAbstraxionAccount()

  return useBalance({
    denom: XION_ASSET_DENOM,
    chainId: XION_CHAIN_ID,
    bech32Address: isConnected ? bech32Address : undefined,
  })
}
