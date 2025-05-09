import { SkipClient } from '@skip-go/client'
import { useWalletClient } from 'wagmi'

/**
 * @todo should likely follow same API as useWalletClient with undefined .
 */
export const useSkipClient = () => {
  const { data: walletClient } = useWalletClient()

  return new SkipClient({
    getEVMSigner: async () => {
      console.debug('walletClient useSkipClient', walletClient)

      if (!walletClient) throw new Error('No wallet client found. Try again.')
      return Promise.resolve(walletClient)
    },
  })
}

export const getEVMToRoute = async ({
  client,
  sourceAssetDenom,
  sourceAssetChainID,
  destAssetDenom,
  destAssetChainID,
  amountIn,
}: {
  client: SkipClient
  sourceAssetDenom: string
  sourceAssetChainID: string
  destAssetDenom: string
  destAssetChainID: string
  amountIn: string
}) => {
  try {
    const result = await client.route({
      cumulativeAffiliateFeeBPS: '10',
      goFast: true,
      sourceAssetDenom: sourceAssetDenom,
      sourceAssetChainID: sourceAssetChainID,
      destAssetDenom: destAssetDenom,
      destAssetChainID: destAssetChainID,
      amountIn: amountIn,
      smartRelay: true,
      allowMultiTx: false,
      allowUnsafe: true,
      allowSwaps: true,
      smartSwapOptions: {
        evmSwaps: true,
        splitRoutes: false,
      },
    })
    return result
  } catch (error) {
    console.error('Error getting route:', error)
    throw error
  }
}

export const getChainRouteAssets = async ({
  client,
  baseChainID,
  targetChainID,
}: {
  client: SkipClient
  baseChainID: string
  targetChainID: string
}) => {
  try {
    const result = await client.assetsBetweenChains({
      sourceChainID: baseChainID,
      destChainID: targetChainID,
      includeCW20Assets: true,
      includeEvmAssets: true,
      allowMultiTx: true,
    })
    return result
  } catch (error) {
    console.error('Error getting assets between chains:', error)
  }
}
