import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { http, createConfig } from 'wagmi'

import { SUPPORTED_EVM_CHAINS } from './constants.ts'

export const config = getDefaultConfig({
  appName: 'RainbowKit demo',
  projectId: 'YOUR_PROJECT_ID',
  chains: SUPPORTED_EVM_CHAINS,
})

export const wagmiConfig = createConfig({
  chains: SUPPORTED_EVM_CHAINS,
  // @ts-ignore
  transports: {
    // [mainnet.id]: http(
    //   `https://eth-mainnet.g.alchemy.com/v2/${import.meta.env.ABSTRACT_ALCHEMY_API_KEY}`,
    // ),
    // [polygon.id]: http(
    //   `https://polygon-mainnet.g.alchemy.com/v2/${import.meta.env.ABSTRACT_ALCHEMY_API_KEY}`,
    // ),
    // [arbitrum.id]: http(
    //   `https://arb-mainnet.g.alchemy.com/v2/${import.meta.env.ABSTRACT_ALCHEMY_API_KEY}`,
    // ),
    // [avalanche.id]: http(
    //   `https://avax-mainnet.g.alchemy.com/v2/${import.meta.env.ABSTRACT_ALCHEMY_API_KEY}`,
    // ),
    // [base.id]: http(
    //   `https://base-mainnet.g.alchemy.com/v2/${import.meta.env.ABSTRACT_ALCHEMY_API_KEY}`,
    // ),
    ...Object.fromEntries(
      SUPPORTED_EVM_CHAINS.map((chain) => [
        chain.id,
        http(
          `https://${chain.alchemyNetwork}.g.alchemy.com/v2/${
            import.meta.env.ABSTRACT_ALCHEMY_API_KEY
          }`,
        ),
      ]),
    ),
  },
})
